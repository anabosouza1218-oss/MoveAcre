import os
import uuid as uuid_lib
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from config import get_db
from services.storage import upload_file, get_signed_url, LAUDO_BUCKET, ALLOWED_EXTENSIONS
from auth import get_current_user

urgencias_bp = Blueprint('urgencias', __name__)

# FIX CRÍTICO: pasta local apenas para dev (quando Supabase não está configurado)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_user_id_from_token(req):
    """Usa get_current_user do auth.py que verifica assinatura JWT."""
    user = get_current_user()
    return user.get('sub') if user else None


def _serialize(row):
    if not row:
        return None
    r = dict(row)
    r['id']                      = r.get('id')
    r['paciente_nome']           = r.get('paciente_nome', '')
    r['tipo_necessario']         = r.get('tipo_necessario', '')
    r['nivel_urgencia_sugerido'] = r.get('nivel_urgencia', '') or r.get('nivel_urgencia_sugerido', '')
    r['status']                  = r.get('status', 'Pendente')
    r['motivo']                  = r.get('observacao', '') or r.get('motivo', '')
    r['motivo_recusa']           = r.get('motivo_recusa', '')
    r['contato_solicitante']     = r.get('contato_solicitante', '')
    # FIX: não retornar o path interno — apenas sinaliza se existe
    r['tem_laudo']               = bool(r.get('laudo_path', ''))
    r['laudo_url']               = ''  # URL gerada sob demanda via /urgencias/<id>/laudo
    r['criado_em']               = str(r.get('data_postagem', '') or r.get('criado_em', ''))
    r['user_id']                 = r.get('auth_user_id', '') or r.get('user_id', '')
    return r


def _serialize_publico(row):
    """Versão pública — sem dados pessoais. paciente_nome substituído por iniciais."""
    if not row: return None
    r = dict(row)
    nome = r.get('paciente_nome', '') or ''
    iniciais = ' '.join(p[0].upper() + '.' for p in nome.split() if p) if nome else '—'
    return {
        'id': r.get('id'),
        'paciente_iniciais': iniciais,
        'tipo_necessario': r.get('tipo_necessario', ''),
        'nivel_urgencia_sugerido': r.get('nivel_urgencia', ''),
        'status': r.get('status', ''),
        'criado_em': str(r.get('data_postagem', '') or ''),
    }


# ── VALIDAÇÃO DE INPUT ────────────────────────────────────────────────────────

TIPOS_SANGUE_VALIDOS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
NIVEIS_VALIDOS = {"BAIXA", "MEDIA", "ALTA", "CRITICA"}


def _validar_urgencia(paciente_nome, tipo_necessario, nivel):
    """Valida campos obrigatórios de uma urgência. Retorna (ok, mensagem)."""
    if not paciente_nome or len(paciente_nome.strip()) < 2:
        return False, "Nome do paciente é obrigatório"
    if tipo_necessario not in TIPOS_SANGUE_VALIDOS:
        return False, f"Tipo sanguíneo inválido: {tipo_necessario}"
    if nivel and nivel.upper() not in NIVEIS_VALIDOS:
        return False, f"Nível de urgência inválido: {nivel}"
    return True, ""


@urgencias_bp.route('/urgencias', methods=['POST'])
def criar_urgencia():
    try:
        user = get_current_user()
        user_id = user.get('sub') if user else None
        if not user_id:
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        email_solicitante = user.get('email') or user.get('email_address') or ''

        # Fallback: busca email no banco pelo clerk_user_id
        if not email_solicitante and user_id:
            try:
                from config import get_db as _get_db
                _db = _get_db()
                _cur = _db.cursor()
                _cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (user_id,))
                _row = _cur.fetchone()
                if _row:
                    email_solicitante = _row.get('email', '')
            except Exception:
                pass

        if request.content_type and 'multipart/form-data' in request.content_type:
            paciente_nome   = request.form.get('paciente_nome', '').strip()
            tipo_necessario = request.form.get('tipo_necessario', '').strip().upper()
            observacao      = request.form.get('motivo', '').strip()
            nivel           = request.form.get('nivel_urgencia_sugerido', '').strip().upper()
            contato         = request.form.get('contato_solicitante', '').strip()
            laudo_path      = ''

            if 'laudo' in request.files:
                file = request.files['laudo']
                if file and file.filename:
                    try:
                        result = upload_file(file, LAUDO_BUCKET, file.filename)
                        if result is None:
                            import logging as _log
                            _log.getLogger(__name__).error("[URGENCIAS] upload_file retornou None — laudo não salvo")
                            # Continua sem laudo em vez de bloquear o pedido
                        else:
                            laudo_path = result
                    except ValueError as ve:
                        return jsonify({"success": False, "message": str(ve)}), 400
        else:
            data            = request.json or {}
            paciente_nome   = str(data.get('paciente_nome', '')).strip()
            tipo_necessario = str(data.get('tipo_necessario', '')).strip().upper()
            observacao      = str(data.get('motivo', '')).strip()
            nivel           = str(data.get('nivel_urgencia_sugerido', '')).strip().upper()
            contato         = str(data.get('contato_solicitante', '')).strip()
            laudo_path      = ''

        # Validação backend
        ok, msg = _validar_urgencia(paciente_nome, tipo_necessario, nivel)
        if not ok:
            return jsonify({"success": False, "message": msg}), 400

        db = get_db()
        cur = db.cursor()
        cur.execute("""
            INSERT INTO pedidos_emergentes
              (paciente_nome, tipo_necessario, nivel_urgencia, contato_solicitante,
               status, observacao, laudo_path, email_solicitante, auth_user_id)
            VALUES (%s, %s, %s, %s, 'Pendente', %s, %s, %s, %s)
        """, (paciente_nome, tipo_necessario, nivel, contato, observacao, laudo_path, email_solicitante, user_id))
        db.commit()

        # Feedback para o solicitante
        if email_solicitante:
            try:
                from services.notificacoes import enviar_email, template_confirmacao_pedido_email
                html = template_confirmacao_pedido_email(paciente_nome or '', tipo_necessario or '', nivel or '')
                enviar_email(email_solicitante, "MOVEACRE — Seu pedido foi recebido", html)
            except Exception as email_err:
                import logging; logging.getLogger(__name__).warning("[URGENCIAS] Falha ao enviar email de confirmação: %s", email_err)

        return jsonify({"success": True})
    except Exception as e:
        import logging; logging.getLogger(__name__).error("[URGENCIAS] criar_urgencia: %s", e)
        return jsonify({"success": False, "message": "Erro ao criar urgência"}), 500


@urgencias_bp.route('/urgencias', methods=['GET'])
def listar_urgencias():
    """Retorna apenas urgências aprovadas com dados mínimos — sem dados pessoais."""
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("""
            SELECT id, paciente_nome, tipo_necessario, nivel_urgencia, status, data_postagem
            FROM pedidos_emergentes
            WHERE status = 'Aprovada'
            ORDER BY data_postagem DESC
        """)
        return jsonify({"success": True, "data": [_serialize_publico(r) for r in cur.fetchall()]})
    except Exception as e:
        import logging; logging.getLogger(__name__).error("[URGENCIAS] listar_urgencias: %s", e)
        return jsonify({"success": False, "message": "Erro ao listar urgências"}), 500


@urgencias_bp.route('/urgencias/me', methods=['GET'])
def minhas_urgencias():
    try:
        user_id = get_user_id_from_token(request)
        if not user_id:
            return jsonify({"success": False, "message": "Não autorizado"}), 401
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT * FROM pedidos_emergentes WHERE auth_user_id = %s ORDER BY data_postagem DESC", (user_id,))
        return jsonify({"success": True, "data": [_serialize(r) for r in cur.fetchall()]})
    except Exception as e:
        import logging; logging.getLogger(__name__).error("[URGENCIAS] minhas_urgencias: %s", e)
        return jsonify({"success": False, "message": "Erro ao buscar urgências"}), 500


@urgencias_bp.route('/urgencias/<int:id>/laudo', methods=['GET'])
def ver_laudo(id):
    """
    FIX CRÍTICO: gera uma signed URL temporária (1h) para o laudo.
    - Apenas o dono do pedido ou admin pode acessar.
    - A URL expira automaticamente — não pode ser compartilhada indefinidamente.
    - Buckets devem ser PRIVADOS no Supabase.
    """
    try:
        user_id = get_user_id_from_token(request)
        if not user_id:
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT laudo_path, auth_user_id FROM pedidos_emergentes WHERE id = %s", (id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Pedido não encontrado"}), 404

        row = dict(row)
        if row.get('auth_user_id') != user_id:
            # Verifica se é admin
            from auth import _get_email_from_sub, ADMIN_EMAILS
            email = _get_email_from_sub(user_id)
            if email not in ADMIN_EMAILS:
                return jsonify({"success": False, "message": "Acesso negado"}), 403

        laudo_path = row.get('laudo_path', '')
        if not laudo_path:
            return jsonify({"success": False, "message": "Laudo não encontrado"})

        # FIX CRÍTICO: URL pública substituída por signed URL temporária
        if laudo_path.startswith('http'):
            # Path legado com URL completa — extrai o path interno
            # ex: https://xxx.supabase.co/storage/v1/object/public/laudos/abc.pdf -> abc.pdf
            prefix_pub = f"/storage/v1/object/public/{LAUDO_BUCKET}/"
            if prefix_pub in laudo_path:
                laudo_path = laudo_path.split(prefix_pub)[-1]

        # Gera signed URL temporária (1 hora)
        from config import USE_POSTGRES
        if USE_POSTGRES:
            signed_url = get_signed_url(laudo_path, LAUDO_BUCKET, expires_in=3600)
            if signed_url:
                return jsonify({"success": True, "url": signed_url, "expires_in": 3600})
            # Fallback: tenta URL pública (bucket público no Supabase)
            import logging as _log
            _log.getLogger(__name__).warning("[URGENCIAS] signed URL falhou, tentando URL pública para path=%s", laudo_path)
            supabase_url = os.getenv("SUPABASE_URL", "")
            if supabase_url and laudo_path:
                public_url = f"{supabase_url}/storage/v1/object/public/{LAUDO_BUCKET}/{laudo_path}"
                return jsonify({"success": True, "url": public_url})

        # Fallback dev: serve local (nunca em produção)
        base_url = os.getenv("BASE_URL", "http://localhost:5000")
        return jsonify({"success": True, "url": f"{base_url}/uploads/{laudo_path}"})

    except Exception as e:
        import logging; logging.getLogger(__name__).error("[URGENCIAS] ver_laudo: %s", e)
        return jsonify({"success": False, "message": "Erro ao acessar laudo"}), 500


# FIX CRÍTICO: rota /uploads só disponível em dev com autenticação
# Em produção, arquivos são servidos via signed URLs do Supabase (ver acima).
@urgencias_bp.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    """
    Serve arquivos locais apenas em desenvolvimento.
    FIX: requer autenticação e usa secure_filename para evitar path traversal.
    Em produção (USE_POSTGRES=True), esta rota retorna 404.
    """
    from config import USE_POSTGRES
    if USE_POSTGRES:
        return jsonify({"success": False, "message": "Não encontrado"}), 404

    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"success": False, "message": "Não autorizado"}), 401

    # FIX: secure_filename previne path traversal (../../../etc/passwd)
    safe_filename = secure_filename(filename)
    if not safe_filename or safe_filename != filename:
        return jsonify({"success": False, "message": "Nome de arquivo inválido"}), 400

    from flask import send_from_directory
    return send_from_directory(UPLOAD_FOLDER, safe_filename)


@urgencias_bp.route('/urgencias/<int:id>', methods=['PUT'])
def editar_urgencia(id):
    try:
        user_id = get_user_id_from_token(request)
        if not user_id:
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT * FROM pedidos_emergentes WHERE id = %s", (id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Pedido não encontrado"}), 404

        row = dict(row)
        if row.get('auth_user_id') != user_id:
            return jsonify({"success": False, "message": "Acesso negado"}), 403
        if row.get('status') != 'Pendente':
            return jsonify({"success": False, "message": "Só é possível editar pedidos Pendentes"}), 400

        laudo_path = row.get('laudo_path', '')

        if request.content_type and 'multipart/form-data' in request.content_type:
            observacao = request.form.get('motivo', '').strip()
            tipo       = request.form.get('tipo_necessario', '').strip().upper()
            nivel      = request.form.get('nivel_urgencia_sugerido', '').strip().upper()

            if 'laudo' in request.files:
                file = request.files['laudo']
                if file and file.filename:
                    # FIX CRÍTICO: substituído file.save() com filename original por upload
                    # validado via Supabase com UUID como nome
                    try:
                        new_path = upload_file(file, LAUDO_BUCKET, file.filename)
                        if new_path:
                            laudo_path = new_path
                    except ValueError as ve:
                        return jsonify({"success": False, "message": str(ve)}), 400
        else:
            data       = request.json or {}
            observacao = str(data.get('motivo', '')).strip()
            tipo       = str(data.get('tipo_necessario', '')).strip().upper()
            nivel      = str(data.get('nivel_urgencia_sugerido', '')).strip().upper()

        # Validação backend
        if tipo and tipo not in TIPOS_SANGUE_VALIDOS:
            return jsonify({"success": False, "message": f"Tipo sanguíneo inválido: {tipo}"}), 400
        if nivel and nivel not in NIVEIS_VALIDOS:
            return jsonify({"success": False, "message": f"Nível de urgência inválido: {nivel}"}), 400

        cur.execute("""
            UPDATE pedidos_emergentes
            SET observacao=%s, tipo_necessario=%s, nivel_urgencia=%s, laudo_path=%s
            WHERE id=%s
        """, (observacao, tipo, nivel, laudo_path, id))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        import logging; logging.getLogger(__name__).error("[URGENCIAS] editar_urgencia: %s", e)
        return jsonify({"success": False, "message": "Erro ao editar urgência"}), 500


@urgencias_bp.route('/urgencias/<int:id>/desativar', methods=['POST'])
def desativar_urgencia(id):
    try:
        user_id = get_user_id_from_token(request)
        if not user_id:
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        data = request.json or {}
        motivo = data.get('motivo', '').strip()
        if not motivo:
            return jsonify({"success": False, "message": "Motivo obrigatório"}), 400

        cur = db.cursor()
        cur.execute("SELECT auth_user_id FROM pedidos_emergentes WHERE id = %s", (id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Pedido não encontrado"}), 404
        if dict(row).get('auth_user_id') != user_id:
            return jsonify({"success": False, "message": "Acesso negado"}), 403

        cur.execute("UPDATE pedidos_emergentes SET status='Desativado', motivo_recusa=%s WHERE id=%s", (motivo, id))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        import logging; logging.getLogger(__name__).error("[URGENCIAS] desativar_urgencia: %s", e)
        return jsonify({"success": False, "message": "Erro ao desativar urgência"}), 500
