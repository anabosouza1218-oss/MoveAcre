"""
auth.py — Verificação de JWT do Clerk e proteção de rotas
"""
import os
import json
import base64
import time
import logging
from functools import wraps
from flask import request, jsonify

logger = logging.getLogger(__name__)

CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
ADMIN_EMAILS = set(e.strip() for e in os.getenv("ADMIN_EMAILS", "moveacre@gmail.com").split(",") if e.strip())

# ─── CACHE DE JWKS ────────────────────────────────────────────────────────────
_jwks_cache = {"data": None, "ts": 0}

def _get_jwks() -> dict:
    """Busca as chaves públicas do Clerk com cache de 5 minutos.
    Tenta primeiro o endpoint público, depois o autenticado via secret key."""
    if time.time() - _jwks_cache["ts"] < 300 and _jwks_cache["data"]:
        return _jwks_cache["data"]

    import requests as req
    all_keys = []

    # 1. Endpoint público
    try:
        r = req.get(CLERK_JWKS_URL, timeout=5)
        all_keys += r.json().get("keys", [])
    except Exception as e:
        logger.error("[AUTH] Falha ao buscar JWKS público: %s", e)

    # 2. Endpoint autenticado via secret key (inclui chaves de instância)
    if CLERK_SECRET_KEY:
        try:
            r = req.get(
                "https://api.clerk.com/v1/jwks",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
                timeout=5,
            )
            if r.status_code == 200:
                existing_kids = {k["kid"] for k in all_keys}
                for k in r.json().get("keys", []):
                    if k["kid"] not in existing_kids:
                        all_keys.append(k)
        except Exception as e:
            logger.error("[AUTH] Falha ao buscar JWKS autenticado: %s", e)

    if all_keys:
        jwks = {"keys": all_keys}
        _jwks_cache["data"] = jwks
        _jwks_cache["ts"] = time.time()
        logger.info("[AUTH] JWKS carregado com %d chaves: %s", len(all_keys), [k["kid"] for k in all_keys])
        return jwks

    return _jwks_cache["data"] or {}


def _decode_token_unverified(token: str) -> dict:
    """Decodifica o payload do JWT SEM verificar assinatura. Usar apenas para logging."""
    try:
        parts = token.split(".")
        payload = parts[1] + "=" * (-len(parts[1]) % 4)
        return json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))
    except Exception:
        return {}


def _verify_token(token: str) -> dict:
    """Verifica o JWT usando as chaves públicas do Clerk via JWKS."""
    if not CLERK_JWKS_URL:
        logger.error("[AUTH] CLERK_JWKS_URL não configurada — rejeitando token por segurança")
        return {}

    try:
        jwks = _get_jwks()
        if not jwks:
            logger.error("[AUTH] JWKS vazio — rejeitando token")
            return {}

        # Decodifica header para pegar kid
        try:
            header_b64 = token.split(".")[0]
            header_b64 += "=" * (-len(header_b64) % 4)
            header = json.loads(base64.urlsafe_b64decode(header_b64).decode("utf-8"))
            kid = header.get("kid")
        except Exception as e:
            logger.error("[AUTH] Erro ao decodificar header do token: %s", e)
            return {}

        key_data = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
        if not key_data:
            logger.warning("[AUTH] Chave JWKS não encontrada para kid=%s — tentando recarregar JWKS", kid)
            # Força recarregamento do cache e tenta novamente
            _jwks_cache["ts"] = 0
            jwks = _get_jwks()
            key_data = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            if not key_data:
                logger.error("[AUTH] Chave JWKS não encontrada após recarregamento para kid=%s", kid)
                return {}
        try:
            import jwt as pyjwt
            from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
            from cryptography.hazmat.backends import default_backend

            def b64url_to_int(val):
                val += "=" * (-len(val) % 4)
                return int.from_bytes(base64.urlsafe_b64decode(val), "big")

            pub_numbers = RSAPublicNumbers(
                e=b64url_to_int(key_data["e"]),
                n=b64url_to_int(key_data["n"]),
            )
            pub_key = pub_numbers.public_key(default_backend())
            payload = pyjwt.decode(token, pub_key, algorithms=["RS256"], options={"verify_aud": False})
            return payload

        except ImportError:
            logger.error("[AUTH] PyJWT ou cryptography não instalados — rejeitando token por segurança")
            return {}

    except Exception as e:
        logger.error("[AUTH] Erro ao verificar token: %s", e)
        return {}


def get_current_user() -> dict:
    """Extrai e verifica o usuário do token Bearer."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return {}
    token = auth.split(" ", 1)[1]
    return _verify_token(token)


def require_auth(f):
    """Decorator — exige usuário autenticado com token verificado."""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user or not user.get("sub"):
            return jsonify({"success": False, "message": "Não autorizado"}), 401
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    """Decorator — exige admin com token verificado (RS256)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Usa get_current_user que chama _verify_token — assinatura verificada
        user = get_current_user()
        if not user or not user.get("sub"):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        sub = user["sub"]
        email = _get_email_from_sub(sub)

        # Fallback: email pode vir direto no token (alguns configs do Clerk)
        if not email:
            email = user.get("email") or user.get("email_address") or ""

        if not email or email not in ADMIN_EMAILS:
            logger.warning("[AUTH] Acesso admin negado para sub=%s email=%s", sub, email)
            return jsonify({"success": False, "message": "Acesso negado"}), 403

        return f(*args, **kwargs)
    return decorated


def _get_email_from_sub(sub: str) -> str:
    """Busca email do doador pelo clerk_user_id."""
    try:
        from config import get_db
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (sub,))
        row = cur.fetchone()
        return row["email"] if row else ""
    except Exception:
        return ""
