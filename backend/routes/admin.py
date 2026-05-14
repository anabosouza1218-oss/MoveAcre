"""
routes/admin.py — Painel administrativo completo (schema Supabase)
"""
import logging
from flask import Blueprint, jsonify, request
from config import get_db
from services.filtragem import filtrar_doadores
from services.notificacoes import (
    enviar_email, enviar_whatsapp,
    template_pedido_doacao_email, template_pedido_doacao_whatsapp,
    template_recorrencia_email, template_recorrencia_whatsapp,
    template_pedido_aprovado_email, template_pedido_recusado_email,
)
from auth import require_admin
from services.auditoria import registar

logger = logging.getLogger(__name__)
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

def _rows(cur):
    return cur.fetchall()

def _serialize_pedido(r):
    if not r: return None
    r = dict(r)
    r['nivel_urgencia_sugerido'] = r.get('nivel_urgencia', '')
    r['motivo']                  = r.get('observacao', '')
    r['laudo_url']               = r.get('laudo_path', '')
    r['criado_em']               = str(r.get('data_postagem', ''))
    r['user_id']                 = r.get('auth_user_id', '')
    return r

def _serialize_doador(r):
    if not r: return None
    r = dict(r)
    r['ultima_doacao'] = str(r.get('data_ultima_doacao') or '')
    r['nivel']         = r.get('nivel', 'BRONZE') or 'BRONZE'
    r['tipo']          = r.get('tipo', '') or ''
    r['idade']         = r.get('idade', '') or ''
    r['cidade']        = r.get('cidade', '') or ''
    r['online']        = r.get('online', 1)
    return r

# ─── DOADORES ─────────────────────────────────────────────────────────────────

@admin_bp.route("/doadores", methods=["GET"])
@require_admin
def listar_doadores():
    tipo_sangue = request.args.get("tipo_sangue")
    nivel       = request.args.get("nivel")
    ordem       = request.args.get("ordem", "nome")
    busca       = request.args.get("busca")

    db = get_db()
    cur = db.cursor()
    sql = "SELECT * FROM doadores WHERE 1=1"
    params = []

    if tipo_sangue:
        sql += " AND tipo_sangue = %s"; params.append(tipo_sangue)
    if nivel:
        sql += " AND nivel = %s"; params.append(nivel.upper())
    if busca:
        sql += " AND (nome_completo ILIKE %s OR cidade ILIKE %s)"
        params += [f"%{busca}%", f"%{busca}%"]

    ordem_map = {
        "nome": "nome_completo ASC",
        "nivel": "CASE nivel WHEN 'OURO' THEN 1 WHEN 'PRATA' THEN 2 ELSE 3 END",
        "ultima_doacao": "data_ultima_doacao DESC NULLS LAST",
    }
    sql += f" ORDER BY {ordem_map.get(ordem, 'nome_completo ASC')}"
    cur.execute(sql, params)
    return jsonify({"success": True, "data": [_serialize_doador(r) for r in _rows(cur)]})

# ─── RECEPTORES ───────────────────────────────────────────────────────────────

@admin_bp.route("/receptores", methods=["GET"])
@require_admin
def listar_receptores():
    tipo_sangue = request.args.get("tipo_sangue")
    idade_min   = request.args.get("idade_min", type=int)
    idade_max   = request.args.get("idade_max", type=int)
    ordem       = request.args.get("ordem", "nome")

    db = get_db()
    cur = db.cursor()
    sql = """
        SELECT DISTINCT d.*
        FROM doadores d
        INNER JOIN pedidos_emergentes p ON p.email_solicitante = d.email
        WHERE 1=1
    """
    params = []
    if tipo_sangue:
        sql += " AND d.tipo_sangue = %s"; params.append(tipo_sangue)
    if idade_min is not None:
        sql += " AND d.idade >= %s"; params.append(idade_min)
    if idade_max is not None:
        sql += " AND d.idade <= %s"; params.append(idade_max)
    sql += " ORDER BY " + ("d.nome_completo ASC" if ordem == "nome" else "d.idade ASC NULLS LAST")
    cur.execute(sql, params)
    return jsonify({"success": True, "data": [_serialize_doador(r) for r in _rows(cur)]})

# ─── USUÁRIOS ─────────────────────────────────────────────────────────────────

@admin_bp.route("/usuarios", methods=["GET"])
@require_admin
def listar_usuarios():
    tipo_sangue = request.args.get("tipo_sangue")
    busca       = request.args.get("busca")
    online      = request.args.get("online")

    db = get_db()
    cur = db.cursor()
    sql = "SELECT * FROM doadores WHERE 1=1"
    params = []
    if tipo_sangue:
        sql += " AND tipo_sangue = %s"; params.append(tipo_sangue)
    if online is not None and online != "":
        sql += " AND online = %s"; params.append(1 if online == "1" else 0)
    if busca:
        sql += " AND (nome_completo ILIKE %s OR email ILIKE %s)"
        params += [f"%{busca}%", f"%{busca}%"]
    sql += " ORDER BY nome_completo ASC"
    cur.execute(sql, params)
    rows = [_serialize_doador(r) for r in _rows(cur)]

    cur.execute("SELECT COUNT(*) as t FROM doadores")
    total = cur.fetchone()["t"]
    cur.execute("SELECT COUNT(*) as t FROM doadores WHERE online = 1")
    ativas = cur.fetchone()["t"]
    cur.execute("SELECT COUNT(*) as t FROM doadores WHERE online = 0")
    desativadas = cur.fetchone()["t"]

    return jsonify({
        "success": True,
        "data": rows,
        "stats": {"total": total, "doadores": ativas, "receptores": desativadas, "online": ativas}
    })

# ─── ONLINE ───────────────────────────────────────────────────────────────────

@admin_bp.route("/online", methods=["GET"])
@require_admin
def pessoas_online():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM doadores ORDER BY nome_completo ASC")
    return jsonify({"success": True, "data": [_serialize_doador(r) for r in _rows(cur)]})

# ─── PEDIDOS ──────────────────────────────────────────────────────────────────

@admin_bp.route("/pedidos", methods=["GET"])
@require_admin
def listar_pedidos():
    status      = request.args.get("status")
    tipo_sangue = request.args.get("tipo_sangue")
    nivel       = request.args.get("nivel")
    busca       = request.args.get("busca")

    db = get_db()
    cur = db.cursor()
    sql = "SELECT * FROM pedidos_emergentes WHERE 1=1"
    params = []
    if status:
        sql += " AND status = %s"; params.append(status)
    if tipo_sangue:
        sql += " AND tipo_necessario = %s"; params.append(tipo_sangue)
    if nivel:
        sql += " AND nivel_urgencia = %s"; params.append(nivel.upper())
    if busca:
        sql += " AND paciente_nome ILIKE %s"; params.append(f"%{busca}%")
    sql += " ORDER BY data_postagem DESC"
    cur.execute(sql, params)
    rows = [_serialize_pedido(r) for r in _rows(cur)]

    cur.execute("SELECT COUNT(*) as t FROM pedidos_emergentes")
    total = cur.fetchone()["t"]
    cur.execute("SELECT COUNT(*) as t FROM pedidos_emergentes WHERE status='Pendente'")
    pendentes = cur.fetchone()["t"]
    cur.execute("SELECT COUNT(*) as t FROM pedidos_emergentes WHERE status='Aprovada'")
    aprovadas = cur.fetchone()["t"]

    return jsonify({"success": True, "data": rows, "stats": {"total": total, "pendentes": pendentes, "aprovadas": aprovadas}})

# ─── DOAÇÕES ──────────────────────────────────────────────────────────────────

@admin_bp.route("/doacoes", methods=["GET"])
@require_admin
def listar_doacoes():
    busca = request.args.get("busca")
    db = get_db()
    cur = db.cursor()
    sql = """
        SELECT d.*, u.nome_completo, u.tipo_sangue, u.genero
        FROM doacoes d
        LEFT JOIN doadores u ON u.email = d.doador_email
        WHERE 1=1
    """
    params = []
    if busca:
        sql += " AND (d.doador_email ILIKE %s OR u.nome_completo ILIKE %s)"
        params += [f"%{busca}%", f"%{busca}%"]
    sql += " ORDER BY d.criado_em DESC"
    cur.execute(sql, params)
    rows = [dict(r) for r in _rows(cur)]
    for r in rows:
        if r.get('data_doacao'):
            r['data_doacao'] = str(r['data_doacao'])
        if r.get('criado_em'):
            r['criado_em'] = str(r['criado_em'])
    return jsonify({"success": True, "data": rows})

# ─── APROVAR / REPROVAR DOAÇÃO ────────────────────────────────────────────────

@admin_bp.route("/doacoes/<int:id>/aprovar", methods=["POST"])
@require_admin
def aprovar_doacao(id):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM doacoes WHERE id = %s", (id,))
    doacao = cur.fetchone()
    if not doacao:
        return jsonify({"success": False, "message": "Doação não encontrada"}), 404
    doacao = dict(doacao)
    email = doacao["doador_email"]
    data_doacao = doacao["data_doacao"]

    cur.execute("UPDATE doacoes SET status = 'Aprovada' WHERE id = %s", (id,))
    cur.execute("UPDATE doadores SET data_ultima_doacao = %s WHERE email = %s", (data_doacao, email))
    db.commit()

    cur.execute("SELECT COUNT(*) as total FROM doacoes WHERE doador_email = %s AND status = 'Aprovada'", (email,))
    row = cur.fetchone()
    total = row["total"] if row else 0

    def nivel(n):
        if n >= 6: return "OURO"
        if n >= 3: return "PRATA"
        return "BRONZE"

    novo_nivel = nivel(total)
    try:
        cur.execute("UPDATE doadores SET nivel = %s WHERE email = %s", (novo_nivel, email))
        db.commit()
    except Exception:
        pass

    registar("aprovar_doacao", f"id={id} doador={email} nivel={novo_nivel}")

    # Email para o doador
    try:
        cur.execute("SELECT nome_completo FROM doadores WHERE email = %s", (email,))
        d = cur.fetchone()
        nome = d['nome_completo'] if d else email
        html = f"""
        <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
          <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
          <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
          <div style="background:#001a00;border-left:4px solid #44FF88;padding:16px;margin-bottom:24px;">
            <p style="color:#44FF88;font-size:14px;font-weight:bold;">✓ SUA DOAÇÃO FOI CONFIRMADA</p>
          </div>
          <h2 style="font-size:22px;margin-bottom:16px;">Parabéns, {nome}!</h2>
          <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
            Sua doação de <strong style="color:#C8F500">{str(data_doacao)}</strong> foi aprovada.
            Seu nível agora é <strong style="color:#C8F500">{novo_nivel}</strong> ({total} doação{'ões' if total != 1 else ''} confirmada{'s' if total != 1 else ''}).
          </p>
          <p style="color:#aaa;line-height:1.6;">Obrigado por salvar vidas. O Acre agradece.</p>
          <hr style="border-color:#1a1a1a;margin:32px 0;">
          <p style="color:#333;font-size:11px;">Acesse <a href="https://moveacre.com.br" style="color:#C8F500;">moveacre.com.br</a> para ver seu histórico.</p>
        </div>"""
        enviar_email(email, "MOVEACRE — Sua doação foi confirmada!", html)
    except Exception as e_mail:
        logger.warning("[ADMIN] Falha ao enviar email de aprovação de doação: %s", e_mail)

    return jsonify({"success": True, "nivel": novo_nivel, "total_doacoes": total})

@admin_bp.route("/doacoes/<int:id>/reprovar", methods=["POST"])
@require_admin
def reprovar_doacao(id):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT doador_email, data_doacao FROM doacoes WHERE id = %s", (id,))
    row = cur.fetchone()
    if not row:
        return jsonify({"success": False, "message": "Doação não encontrada"}), 404
    row = dict(row)

    cur.execute("UPDATE doacoes SET status = 'Reprovada' WHERE id = %s", (id,))
    db.commit()

    email = row.get("doador_email", "")
    if email:
        try:
            logger.info("[ADMIN] Enviando email de reprovação de doação para %s", email)
            db2 = get_db()
            cur2 = db2.cursor()
            cur2.execute("SELECT nome_completo FROM doadores WHERE email = %s", (email,))
            d = cur2.fetchone()
            nome = d['nome_completo'] if d else email
            html = f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <div style="background:#1a0000;border-left:4px solid #FF3333;padding:16px;margin-bottom:24px;">
                <p style="color:#FF6666;font-size:14px;font-weight:bold;">✗ ATESTADO NÃO APROVADO</p>
              </div>
              <h2 style="font-size:22px;margin-bottom:16px;">Olá, {nome}</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Seu atestado de doação de <strong style="color:#C8F500">{str(row.get('data_doacao', ''))}</strong>
                não pôde ser aprovado. Isso pode acontecer se o documento estiver ilegível ou incompleto.
              </p>
              <p style="color:#aaa;line-height:1.6;">
                Se acredita que houve um engano, envie novamente pelo seu perfil em
                <a href="https://moveacre.com.br" style="color:#C8F500;">moveacre.com.br</a>.
              </p>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">Dúvidas? <a href="mailto:moveacre.suporte@gmail.com" style="color:#C8F500;">moveacre.suporte@gmail.com</a></p>
            </div>"""
            enviar_email(email, "MOVEACRE — Atualização sobre seu atestado", html)
        except Exception as e_mail:
            logger.warning("[ADMIN] Falha ao enviar email de reprovação de doação: %s", e_mail)

    return jsonify({"success": True})

# ─── DELETAR / DESATIVAR USUÁRIO ──────────────────────────────────────────────

@admin_bp.route("/usuarios/<id>", methods=["DELETE"])
@require_admin
def deletar_usuario(id):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, email FROM doadores WHERE id = %s", (id,))
    row = cur.fetchone()
    if not row:
        return jsonify({"success": False, "message": "Usuário não encontrado"}), 404
    row = dict(row)
    try:
        cur.execute("DELETE FROM doacoes WHERE doador_email = %s", (row["email"],))
    except Exception:
        pass
    cur.execute("DELETE FROM doadores WHERE id = %s", (id,))
    db.commit()
    registar("deletar_usuario", f"id={id} email={row['email']}")
    return jsonify({"success": True})

@admin_bp.route("/usuarios/<id>/desativar", methods=["POST"])
@require_admin
def desativar_usuario(id):
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute("UPDATE doadores SET online = 0, desativado_por = 'admin', desativado_em = NOW() WHERE id = %s", (id,))
    except Exception:
        pass
    db.commit()
    registar("desativar_usuario", f"id={id}")
    return jsonify({"success": True})

@admin_bp.route("/usuarios/<id>/reativar", methods=["POST"])
@require_admin
def reativar_usuario(id):
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE doadores SET online = 1, desativado_por = NULL WHERE id = %s", (id,))
    db.commit()
    registar("reativar_usuario", f"id={id}")
    return jsonify({"success": True})

# ─── APROVAR / REPROVAR PEDIDO ───────────────────────────────────────────────

@admin_bp.route("/pedidos/<int:id>/aprovar", methods=["POST"])
@require_admin
def aprovar_pedido(id):
    # FIX CRÍTICO: substituído str(e) por logger.error + mensagem genérica.
    # str(e) expunha detalhes internos do banco e do servidor para o cliente.
    try:
        data = request.json or {}
        nivel = data.get('nivel', 'MEDIA')
        db = get_db()
        cur = db.cursor()
        cur.execute("UPDATE pedidos_emergentes SET status='Aprovada', nivel_urgencia=%s WHERE id=%s", (nivel, id))
        db.commit()
        registar("aprovar_pedido", f"id={id} nivel={nivel}")

        # Notifica doadores automaticamente
        cur.execute("SELECT * FROM pedidos_emergentes WHERE id = %s", (id,))
        pedido = cur.fetchone()
        notificados = 0
        if pedido:
            pedido = dict(pedido)
            cur.execute("SELECT * FROM doadores")
            todos = [dict(r) for r in _rows(cur)]
            for d in todos:
                d['ultima_doacao'] = str(d.get('data_ultima_doacao') or '')
                d['tipo'] = 'DOADOR'
            resultado = filtrar_doadores(todos, pedido["tipo_necessario"], nivel)
            contato = pedido.get("contato_solicitante") or "—"
            receptor_nome = pedido.get("paciente_nome", "")
            for doador in resultado["elegiveis"]:
                nome  = doador.get("nome_completo") or "Doador"
                email = doador.get("email", "")
                if email:
                    html = template_pedido_doacao_email(nome, pedido["tipo_necessario"], nivel, contato, receptor_nome)
                    if enviar_email(email, "MOVEACRE — Você pode salvar uma vida hoje", html):
                        notificados += 1

            # Feedback para o solicitante: pedido aprovado + quantos foram notificados
            email_sol = pedido.get("email_solicitante", "")
            if not email_sol:
                # Fallback: busca pelo auth_user_id
                try:
                    cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (pedido.get("auth_user_id", ""),))
                    r = cur.fetchone()
                    if r: email_sol = r.get("email", "")
                except Exception:
                    pass
            if email_sol:
                try:
                    html_sol = template_pedido_aprovado_email(
                        pedido.get("paciente_nome", ""),
                        pedido.get("tipo_necessario", ""),
                        nivel,
                        notificados,
                    )
                    enviar_email(email_sol, "MOVEACRE — Seu pedido foi aprovado", html_sol)
                except Exception as e_sol:
                    logger.warning("[ADMIN] Falha ao enviar email de aprovação ao solicitante: %s", e_sol)

        return jsonify({"success": True, "message": f"Urgência {id} aprovada como {nivel}!", "notificados": notificados})
    except Exception as e:
        logger.error("[ADMIN] aprovar_pedido id=%s: %s", id, e)
        return jsonify({"success": False, "message": "Erro ao aprovar pedido"}), 500

@admin_bp.route("/pedidos/<int:id>/reprovar", methods=["POST"])
@require_admin
def reprovar_pedido(id):
    # FIX CRÍTICO: substituído str(e) por logger.error + mensagem genérica.
    try:
        data = request.json or {}
        motivo = data.get('motivo')
        if not motivo:
            return jsonify({"success": False, "message": "Motivo é obrigatório"}), 400
        db = get_db()
        cur = db.cursor()
        cur.execute("UPDATE pedidos_emergentes SET status='Recusada', motivo_recusa=%s WHERE id=%s", (motivo, id))
        db.commit()
        registar("reprovar_pedido", f"id={id} motivo={motivo}")

        # Feedback para o solicitante: pedido recusado + motivo
        cur.execute("SELECT email_solicitante, paciente_nome, tipo_necessario, auth_user_id FROM pedidos_emergentes WHERE id=%s", (id,))
        pedido = cur.fetchone()
        if pedido:
            pedido = dict(pedido)
            email_sol = pedido.get("email_solicitante", "")
            if not email_sol:
                try:
                    cur.execute("SELECT email FROM doadores WHERE clerk_user_id = %s", (pedido.get("auth_user_id", ""),))
                    r = cur.fetchone()
                    if r: email_sol = r.get("email", "")
                except Exception:
                    pass
            if email_sol:
                try:
                    html_sol = template_pedido_recusado_email(
                        pedido.get("paciente_nome", ""),
                        pedido.get("tipo_necessario", ""),
                        motivo,
                    )
                    enviar_email(email_sol, "MOVEACRE — Atualização sobre seu pedido", html_sol)
                except Exception as e_sol:
                    logger.warning("[ADMIN] Falha ao enviar email de recusa ao solicitante: %s", e_sol)

        return jsonify({"success": True})
    except Exception as e:
        logger.error("[ADMIN] reprovar_pedido id=%s: %s", id, e)
        return jsonify({"success": False, "message": "Erro ao reprovar pedido"}), 500

# ─── NOTIFICAR DOADORES ───────────────────────────────────────────────────────

@admin_bp.route("/pedidos/<int:id>/notificar", methods=["POST"])
@require_admin
def notificar_doadores(id):
    try:
        canal = (request.json or {}).get("canal", "ambos")
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT * FROM pedidos_emergentes WHERE id = %s", (id,))
        pedido = cur.fetchone()
        if not pedido:
            return jsonify({"success": False, "message": "Pedido não encontrado"}), 404
        pedido = dict(pedido)

        cur.execute("SELECT * FROM doadores")
        todos = [dict(r) for r in _rows(cur)]
        for d in todos:
            d['ultima_doacao'] = str(d.get('data_ultima_doacao') or '')
            d['tipo'] = 'DOADOR'

        nivel_urg = pedido.get('nivel_urgencia') or 'MEDIA'
        resultado = filtrar_doadores(todos, pedido["tipo_necessario"], nivel_urg)
        elegiveis = resultado["elegiveis"]

        enviados_email = enviados_wa = erros = 0
        contato = pedido.get("contato_solicitante") or "—"
        receptor_nome = pedido.get("paciente_nome", "")

        for doador in elegiveis:
            nome  = doador.get("nome_completo") or "Doador"
            email = doador.get("email", "")
            tel   = doador.get("telefone", "")

            if canal in ("email", "ambos") and email:
                html = template_pedido_doacao_email(nome, pedido["tipo_necessario"], nivel_urg, contato, receptor_nome)
                if enviar_email(email, "MOVEACRE — Você pode salvar uma vida hoje", html): enviados_email += 1
                else: erros += 1

            if canal in ("whatsapp", "ambos") and tel:
                msg = template_pedido_doacao_whatsapp(nome, pedido["tipo_necessario"], nivel_urg, contato)
                if enviar_whatsapp(tel, msg): enviados_wa += 1
                else: erros += 1

        return jsonify({"success": True, "stats": {**resultado, "enviados_email": enviados_email, "enviados_whatsapp": enviados_wa, "erros": erros}})
    except Exception as e:
        logger.error("[ADMIN] notificar_doadores id=%s: %s", id, e)
        return jsonify({"success": False, "message": "Erro ao notificar doadores"}), 500

# ─── RECORRÊNCIA ──────────────────────────────────────────────────────────────

@admin_bp.route("/recorrencia/notificar", methods=["POST"])
@require_admin
def notificar_recorrencia():
    try:
        from services.filtragem import _dias_desde, _intervalo_minimo
        canal = (request.json or {}).get("canal", "ambos")
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT * FROM doadores WHERE data_ultima_doacao IS NOT NULL")
        doadores = [dict(r) for r in _rows(cur)]

        aptos = []
        for d in doadores:
            dias = _dias_desde(str(d.get("data_ultima_doacao") or ""))
            if dias is not None and dias >= _intervalo_minimo(d.get("genero", "")):
                aptos.append(d)

        enviados_email = enviados_wa = 0
        for doador in aptos:
            nome  = doador.get("nome_completo") or "Doador"
            email = doador.get("email", "")
            tel   = doador.get("telefone", "")
            ultima = str(doador.get("data_ultima_doacao", ""))
            if canal in ("email", "ambos") and email:
                if enviar_email(email, "MOVEACRE — Você já pode doar novamente!", template_recorrencia_email(nome, ultima)):
                    enviados_email += 1
            if canal in ("whatsapp", "ambos") and tel:
                if enviar_whatsapp(tel, template_recorrencia_whatsapp(nome, ultima)):
                    enviados_wa += 1

        return jsonify({"success": True, "aptos": len(aptos), "enviados_email": enviados_email, "enviados_whatsapp": enviados_wa})
    except Exception as e:
        logger.error("[ADMIN] notificar_recorrencia: %s", e)
        return jsonify({"success": False, "message": "Erro ao notificar recorrência"}), 500

# ─── STATS ────────────────────────────────────────────────────────────────────

@admin_bp.route("/stats", methods=["GET"])
@require_admin
def stats_gerais():
    try:
        db = get_db()
        cur = db.cursor()

        def count(sql):
            cur.execute(sql)
            return cur.fetchone()["t"]

        return jsonify({"success": True, "data": {
            "total_doadores":    count("SELECT COUNT(*) as t FROM doadores"),
            "total_receptores":  count("SELECT COUNT(DISTINCT email_solicitante) as t FROM pedidos_emergentes"),
            "pedidos_pendentes": count("SELECT COUNT(*) as t FROM pedidos_emergentes WHERE status='Pendente'"),
            "pedidos_aprovados": count("SELECT COUNT(*) as t FROM pedidos_emergentes WHERE status='Aprovada'"),
            "total_doacoes":     count("SELECT COUNT(*) as t FROM doacoes"),
            "online":            count("SELECT COUNT(*) as t FROM doadores"),
            "niveis": {
                "ouro":   count("SELECT COUNT(*) as t FROM doadores WHERE nivel='OURO'"),
                "prata":  count("SELECT COUNT(*) as t FROM doadores WHERE nivel='PRATA'"),
                "bronze": count("SELECT COUNT(*) as t FROM doadores WHERE nivel='BRONZE'"),
            }
        }})
    except Exception as e:
        logger.error("[ADMIN] stats_gerais: %s", e)
        return jsonify({"success": False, "message": "Erro ao buscar estatísticas"}), 500
