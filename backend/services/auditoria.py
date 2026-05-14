"""
services/auditoria.py — Registo de ações administrativas

FIX ALTO: substituído _decode_token_unverified (sem verificação de assinatura)
por get_current_user() que usa RS256 com JWKS do Clerk.
"""
import logging
from flask import request
from auth import get_current_user, _get_email_from_sub

logger = logging.getLogger(__name__)


def _get_admin_email() -> str:
    """
    FIX: usa get_current_user() que verifica a assinatura do JWT.
    Antes usava _decode_token_unverified — um token forjado podia
    inserir entradas falsas ou ocultar rastros no log de auditoria.
    """
    user = get_current_user()
    if not user or not user.get("sub"):
        return "desconhecido"
    sub = user["sub"]
    email = _get_email_from_sub(sub) or user.get("email", sub or "desconhecido")
    return email


def registar(acao: str, detalhes: str = ""):
    """Regista uma ação no log e na tabela audit_log."""
    admin = _get_admin_email()
    logger.info("[AUDITORIA] admin=%s acao=%s detalhes=%s", admin, acao, detalhes)
    try:
        from config import get_db
        db = get_db()
        cur = db.cursor()
        cur.execute("""
            INSERT INTO audit_log (admin_email, acao, detalhes, ip)
            VALUES (%s, %s, %s, %s)
        """, (admin, acao, detalhes, request.remote_addr or ""))
        db.commit()
    except Exception as e:
        logger.warning("[AUDITORIA] Erro ao guardar log: %s", e)
