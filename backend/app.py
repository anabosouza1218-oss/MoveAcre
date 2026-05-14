"""
app.py - Entry point do MOVEACRE API
"""
import re
import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config, init_supabase
from scheduler import init_scheduler

# Configuração de Logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Padrões suspeitos em query params (operadores NoSQL, injeção, etc.)
_SUSPICIOUS = re.compile(r'[\$\{\}\[\]<>]|(\.\.)|(//)|(\\\\)')

def _has_suspicious_input() -> bool:
    """Verifica query params e valores do body por padrões maliciosos."""
    for key, value in request.args.items():
        if _SUSPICIOUS.search(key) or _SUSPICIOUS.search(value):
            return True
    return False


def create_app() -> Flask:
    Config.validate()
    init_supabase()

    app = Flask(__name__)
    app.url_map.strict_slashes = False

    # ── LIMITE DE TAMANHO DE UPLOAD ──────────────────────────────────────────
    # Máximo 10 MB por requisição (laudos médicos e atestados)
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

    # ── CORS RESTRITO ────────────────────────────────────────────────────────
    # FIX CRÍTICO: origins aberto para "*" permite qualquer site fazer
    # requisições autenticadas em nome do usuário.
    # Defina as origens permitidas explicitamente via variável de ambiente.
    # Exemplo no .env: ALLOWED_ORIGINS=https://moveacre.com.br,https://www.moveacre.com.br
    _raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
    ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

    CORS(app, resources={r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
        "supports_credentials": False,
    }})

    # ── RATE LIMITING ────────────────────────────────────────────────────────
    # FIX ALTO: sem rate limiting, qualquer bot pode floodar a API, spammar
    # emails pagos e derrubar o serviço.
    try:
        from flask_limiter import Limiter
        from flask_limiter.util import get_remote_address
        limiter = Limiter(
            get_remote_address,
            app=app,
            default_limits=["200 per minute", "1000 per hour"],
            storage_uri=os.getenv("REDIS_URL", "memory://"),
        )
        app.extensions["limiter"] = limiter
        logger.info("[SECURITY] Rate limiting ativo")
    except ImportError:
        logger.warning(
            "[SECURITY] flask-limiter não instalado — rate limiting DESATIVADO. "
            "Execute: pip install flask-limiter"
        )

    # ── SECURITY HEADERS ─────────────────────────────────────────────────────
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Em produção com HTTPS, adicione também:
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    @app.before_request
    def validate_input():
        if request.method == "OPTIONS":
            return
        if _has_suspicious_input():
            logger.warning("[SECURITY] Input suspeito bloqueado: %s %s args=%s ip=%s",
                           request.method, request.path, dict(request.args), request.remote_addr)
            return jsonify({"success": False, "message": "Requisição inválida"}), 400

    # Importação dos Blueprints
    from routes.auth import auth_bp
    from routes.doadores import doadores_bp
    from routes.urgencias import urgencias_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(doadores_bp)
    app.register_blueprint(urgencias_bp)
    app.register_blueprint(admin_bp)

    init_scheduler()

    # ── ERROR HANDLERS ───────────────────────────────────────────────────────

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"success": False, "message": "Rota não encontrada"}), 404

    @app.errorhandler(413)
    def request_entity_too_large(_):
        return jsonify({"success": False, "message": "Arquivo muito grande. Limite: 10 MB"}), 413

    @app.errorhandler(500)
    def internal_error(e):
        # FIX CRÍTICO: nunca expor str(e) — loga internamente, retorna genérico
        logger.error("Erro interno: %s", str(e))
        return jsonify({"success": False, "message": "Erro interno do servidor"}), 500

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"success": True, "data": {"status": "ok", "app": "MOVEACRE"}, "message": "API online"})

    logger.info("MOVEACRE API inicializada com sucesso")
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=False)

# Expõe instância para gunicorn
app = create_app()
