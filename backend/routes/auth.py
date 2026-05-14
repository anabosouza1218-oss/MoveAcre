from flask import Blueprint, jsonify, request
from auth import get_current_user, _get_email_from_sub, ADMIN_EMAILS

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    return jsonify({"success": True})

@auth_bp.route('/auth/me', methods=['GET'])
def get_me():
    return jsonify({"success": True, "data": {"perfil_incompleto": False}})

@auth_bp.route('/auth/is-admin', methods=['GET'])
def is_admin():
    """Verifica se o usuário autenticado é admin — token verificado via RS256."""
    user = get_current_user()
    if not user or not user.get("sub"):
        return jsonify({"success": True, "is_admin": False})
    email = _get_email_from_sub(user["sub"]) or user.get("email", "")
    return jsonify({"success": True, "is_admin": email in ADMIN_EMAILS})
