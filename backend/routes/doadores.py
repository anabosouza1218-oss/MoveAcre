import os
import uuid as uuid_lib
import logging
from flask import Blueprint, jsonify, request
from config import get_db
from services.storage import upload_file, ATESTADO_BUCKET
from auth import get_current_user
from services.notificacoes import enviar_email, template_boas_vindas_email

logger = logging.getLogger(__name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

doadores_bp = Blueprint('doadores', __name__)

# ── SYNC ─────────────────────────────────────────────────────────────────────

@doadores_bp.route('/doadores/sync', methods=['POST'])
def sync_doador():
    try:
        user = get_current_user()
        if not user or not user.get('sub'):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        clerk_user_id = user['sub']
        data = request.json or {}
        # FIX: email preferencialmente do token verificado, fallback para o body
        email = user.get('email') or data.get('email')
        nome_completo = data.get('nome_completo')

        if not email:
            return jsonify({"success": False, "message": "Email não encontrado"}), 400

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT id FROM doadores WHERE email = %s", (email,))
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO doadores (id, nome_completo, email, clerk_user_id) VALUES (%s, %s, %s, %s)",
                (str(uuid_lib.uuid4()), nome_completo, email, clerk_user_id)
            )
        else:
            cur.execute(
                "UPDATE doadores SET clerk_user_id = COALESCE(%s, clerk_user_id), nome_completo = COALESCE(%s, nome_completo) WHERE email = %s",
                (clerk_user_id, nome_completo, email)
            )
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        logger.error("[DOADORES] sync_doador: %s", e)
        return jsonify({"success": False, "message": "Erro ao sincronizar usuário"}), 500

# ── ME ───────────────────────────────────────────────────────────────────────

@doadores_bp.route('/doadores/me', methods=['GET', 'PUT'])
def doador_me():
    try:
        user = get_current_user()
        if not user or not user.get('sub'):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        clerk_user_id = user['sub']

        if request.method == 'PUT':
            data = request.json or {}

            db = get_db()
            cur = db.cursor()

            # FIX: busca o registro pelo clerk_user_id (sempre confiável),
            # não pelo email do token que pode não bater com o banco.
            cur.execute("SELECT id, genero, telefone FROM doadores WHERE clerk_user_id = %s", (clerk_user_id,))
            row = cur.fetchone()

            if not row:
                # Perfil ainda não existe — cria com o email do token
                email = user.get('email') or data.get('email')
                if not email:
                    return jsonify({"success": False, "message": "Email não encontrado"}), 400
                cur.execute(
                    "INSERT INTO doadores (id, nome_completo, email, clerk_user_id) VALUES (%s, %s, %s, %s)",
                    (str(uuid_lib.uuid4()), data.get('nome_completo', email), email, clerk_user_id)
                )
                db.commit()
                perfil_ja_completo = False
            else:
                # FIX: verifica se o perfil já estava completo ANTES do update
                # para decidir se deve enviar o e-mail de boas-vindas
                perfil_ja_completo = bool(row.get('genero') and row.get('telefone'))

            # FIX: UPDATE usa clerk_user_id como chave — evita criar linha duplicada
            # quando o email do token não bate com o email gravado no banco.
            # Também inclui nome_completo que estava faltando.
            cur.execute("""
                UPDATE doadores
                SET nome_completo=%s,
                    tipo_sangue=COALESCE(%s, tipo_sangue),
                    genero=%s, telefone=%s, data_ultima_doacao=%s,
                    cidade=%s, idade=%s, tipo=%s,
                    termos_aceitos=%s, termos_aceitos_em=CASE WHEN %s THEN NOW() ELSE termos_aceitos_em END
                WHERE clerk_user_id=%s
            """, (
                data.get('nome_completo'),
                data.get('tipo_sangue'), data.get('genero'),
                data.get('telefone'),
                data.get('ultima_doacao') or None,
                data.get('cidade') or None,
                data.get('idade') or None,
                data.get('tipo') or None,
                data.get('termos_aceitos', False),
                data.get('termos_aceitos', False),
                clerk_user_id
            ))
            db.commit()

            # FIX: só envia e-mail de boas-vindas se o perfil NÃO estava completo antes
            # (primeira vez completando). Edições posteriores não disparam o e-mail.
            if not perfil_ja_completo and not data.get('ultima_doacao'):
                cur.execute("SELECT email, nome_completo FROM doadores WHERE clerk_user_id = %s", (clerk_user_id,))
                doador = cur.fetchone()
                if doador:
                    nome = data.get('nome_completo') or doador.get('nome_completo') or doador.get('email')
                    html = template_boas_vindas_email(nome, data.get('tipo_sangue', ''))
                    enviar_email(doador['email'], "MOVEACRE — Bem-vindo! Que tal sua primeira doacao?", html)

            cur.execute("SELECT * FROM doadores WHERE clerk_user_id = %s", (clerk_user_id,))
            saved = cur.fetchone()
            completo = bool(saved and saved.get('genero') and saved.get('telefone'))
            logger.info("[DOADORES] perfil_completo=%s genero=%s telefone=%s", completo, saved.get('genero') if saved else None, bool(saved.get('telefone')) if saved else None)
            return jsonify({"success": True, "perfil_completo": completo})

        # GET — busca pelo sub do token, não por email no querystring
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT * FROM doadores WHERE clerk_user_id = %s", (clerk_user_id,))
        row = cur.fetchone()
        if row:
            r = dict(row)
            r['ultima_doacao'] = str(r.get('data_ultima_doacao') or '')
            r['nivel'] = r.get('nivel', 'BRONZE') or 'BRONZE'
            r['tipo'] = r.get('tipo', '') or ''
            r['idade'] = r.get('idade', '') or ''
            r['cidade'] = r.get('cidade', '') or ''
            r['online'] = r.get('online', 1)
            r['desativado_por'] = r.get('desativado_por', None)
            r['perfil_incompleto'] = not (r.get('genero') and r.get('telefone'))
            return jsonify({"success": True, "data": r})
        return jsonify({"success": True, "data": {}})
    except Exception as e:
        logger.error("[DOADORES] doador_me: %s", e)
        return jsonify({"success": False, "message": "Erro ao buscar perfil"}), 500

# ── DECLARAR DOAÇÃO ──────────────────────────────────────────────────────────

@doadores_bp.route('/doadores/declarar-doacao', methods=['POST'])
def declarar_doacao():
    try:
        user = get_current_user()
        if not user or not user.get('sub'):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (user['sub'],))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Doador não encontrado"}), 404
        email = row['email']

        data_doacao = request.form.get('data_doacao')
        if not data_doacao:
            return jsonify({"success": False, "message": "Data é obrigatória"}), 400

        atestado_url = None
        if 'atestado' in request.files:
            file = request.files['atestado']
            if file and file.filename:
                # FIX: validate_file chamado internamente por upload_file
                try:
                    atestado_url = upload_file(file, ATESTADO_BUCKET, file.filename)
                except ValueError as ve:
                    return jsonify({"success": False, "message": str(ve)}), 400

        cur.execute(
            "INSERT INTO doacoes (doador_email, data_doacao, atestado_url, status) VALUES (%s, %s, %s, 'Pendente')",
            (email, data_doacao, atestado_url)
        )
        db.commit()

        # Email de confirmação para o doador
        try:
            cur.execute("SELECT nome_completo FROM doadores WHERE email = %s", (email,))
            d = cur.fetchone()
            nome = d['nome_completo'] if d else email
            html = f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <div style="background:#111;border-left:4px solid #C8F500;padding:16px;margin-bottom:24px;">
                <p style="color:#C8F500;font-size:14px;font-weight:bold;">⏳ ATESTADO RECEBIDO — AGUARDANDO REVISÃO</p>
              </div>
              <h2 style="font-size:22px;margin-bottom:16px;">Olá, {nome}!</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Seu atestado de doação de <strong style="color:#C8F500">{str(data_doacao)}</strong>
                foi recebido e está <strong style="color:#C8F500">aguardando revisão</strong> pela nossa equipe.
              </p>
              <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
                <p style="color:#C8F500;font-size:13px;font-weight:bold;margin-bottom:12px;">O QUE ACONTECE AGORA?</p>
                <ol style="color:#aaa;font-size:13px;line-height:2;padding-left:20px;margin:0;">
                  <li>Nossa equipe revisa o atestado</li>
                  <li>Você recebe um email com o resultado</li>
                  <li>Se aprovado, seu nível de doador é atualizado automaticamente</li>
                </ol>
              </div>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">Acesse <a href="https://moveacre.com.br" style="color:#C8F500;">moveacre.com.br</a> para acompanhar o status.</p>
            </div>"""
            enviar_email(email, "MOVEACRE — Atestado recebido, aguardando revisão", html)
        except Exception as e_mail:
            logger.warning("[DOADORES] Falha ao enviar email de confirmação de atestado: %s", e_mail)

        return jsonify({"success": True, "message": "Atestado enviado! Aguarde aprovação do administrador."})
    except Exception as e:
        logger.error("[DOADORES] declarar_doacao: %s", e)
        return jsonify({"success": False, "message": "Erro ao declarar doação"}), 500

# ── HISTÓRICO ────────────────────────────────────────────────────────────────

@doadores_bp.route('/doadores/historico-doacoes', methods=['GET'])
def historico_doacoes():
    try:
        user = get_current_user()
        if not user or not user.get('sub'):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (user['sub'],))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Doador não encontrado"}), 404

        cur.execute("SELECT id, data_doacao, status, criado_em FROM doacoes WHERE doador_email = %s ORDER BY criado_em DESC", (row['email'],))
        # FIX: não retornar atestado_url diretamente — acesso sob demanda autenticado
        rows = []
        for r in cur.fetchall():
            d = dict(r)
            if d.get('data_doacao'):
                d['data_doacao'] = str(d['data_doacao'])
            if d.get('criado_em'):
                d['criado_em'] = str(d['criado_em'])
            rows.append(d)
        return jsonify({"success": True, "data": rows})
    except Exception as e:
        logger.error("[DOADORES] historico_doacoes: %s", e)
        return jsonify({"success": False, "message": "Erro ao buscar histórico"}), 500

# ── DESATIVAR / REATIVAR ─────────────────────────────────────────────────────

@doadores_bp.route('/doadores/desativar', methods=['POST'])
def desativar_conta():
    try:
        user = get_current_user()
        if not user or not user.get('sub'):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (user['sub'],))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Doador não encontrado"}), 404

        cur.execute(
            "UPDATE doadores SET online = 0, desativado_por = 'usuario', desativado_em = NOW() WHERE email = %s",
            (row['email'],)
        )
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        logger.error("[DOADORES] desativar_conta: %s", e)
        return jsonify({"success": False, "message": "Erro ao desativar conta"}), 500


@doadores_bp.route('/doadores/reativar', methods=['POST'])
def reativar_conta():
    try:
        user = get_current_user()
        if not user or not user.get('sub'):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT email, online, desativado_por FROM doadores WHERE clerk_user_id = %s", (user['sub'],))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Doador não encontrado"}), 404
        row = dict(row)
        if row.get('desativado_por') != 'usuario':
            return jsonify({"success": False, "message": "Conta desativada pelo administrador. Entre em contato com o suporte."}), 403

        cur.execute("UPDATE doadores SET online = 1, desativado_por = NULL WHERE email = %s", (row['email'],))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        logger.error("[DOADORES] reativar_conta: %s", e)
        return jsonify({"success": False, "message": "Erro ao reativar conta"}), 500

# ── VER ATESTADO ─────────────────────────────────────────────────────────────

@doadores_bp.route('/doadores/atestado/<int:doacao_id>', methods=['GET'])
def ver_atestado(doacao_id):
    """Gera signed URL para o atestado — apenas admin ou dono da doação."""
    try:
        from auth import _get_email_from_sub, ADMIN_EMAILS
        from services.storage import get_signed_url, ATESTADO_BUCKET
        import os

        user = get_current_user()
        if not user or not user.get('sub'):
            return jsonify({"success": False, "message": "Não autorizado"}), 401

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT atestado_url, doador_email FROM doacoes WHERE id = %s", (doacao_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Doação não encontrada"}), 404
        row = dict(row)

        # Verifica permissão: dono ou admin
        cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (user['sub'],))
        doador = cur.fetchone()
        email_user = doador['email'] if doador else ''
        admin_email = _get_email_from_sub(user['sub'])
        is_admin = admin_email in ADMIN_EMAILS

        if not is_admin and email_user != row.get('doador_email'):
            return jsonify({"success": False, "message": "Acesso negado"}), 403

        atestado_path = row.get('atestado_url', '')
        if not atestado_path:
            return jsonify({"success": False, "message": "Atestado não encontrado"}), 404

        # Tenta signed URL
        signed_url = get_signed_url(atestado_path, ATESTADO_BUCKET, expires_in=3600)
        if signed_url:
            return jsonify({"success": True, "url": signed_url})

        # Fallback URL pública
        supabase_url = os.getenv("SUPABASE_URL", "")
        if supabase_url:
            return jsonify({"success": True, "url": f"{supabase_url}/storage/v1/object/public/{ATESTADO_BUCKET}/{atestado_path}"})

        return jsonify({"success": False, "message": "Não foi possível gerar URL do atestado"}), 500
    except Exception as e:
        logger.error("[DOADORES] ver_atestado: %s", e)
        return jsonify({"success": False, "message": "Erro ao acessar atestado"}), 500
