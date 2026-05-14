"""
scheduler.py — Jobs automáticos do MOVEACRE

FIX BAIXO: fuso horário corrigido para America/Rio_Branco (UTC-5).
America/Manaus é UTC-4, causando execução 1 hora adiantada.
"""
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ─── SEQUÊNCIAS DE EMAIL ──────────────────────────────────────────────────────

def _copys_sem_tipo(nome):
    """Sequência de emails para doadores sem tipo sanguíneo — rotativa."""
    return [
        {
            "assunto": "MOVEACRE — Falta pouco para você salvar vidas",
            "html": f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <h2 style="font-size:22px;margin-bottom:16px;">Olá, {nome}!</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Você está cadastrado no MOVEACRE, mas ainda não informou seu tipo sanguíneo.
                Sem essa informação, não conseguimos te conectar a pedidos de doação compatíveis.
              </p>
              <div style="background:#111;border-left:4px solid #C8F500;padding:20px;margin-bottom:24px;">
                <p style="color:#C8F500;font-size:15px;font-weight:bold;margin-bottom:8px;">Leva menos de 2 minutos</p>
                <p style="color:#888;font-size:13px;line-height:1.6;">Acesse seu perfil e preencha seu tipo sanguíneo agora.</p>
              </div>
              <a href="https://moveacre.com.br/perfil" style="display:inline-block;background:#C8F500;color:#0A0A0A;padding:14px 32px;font-weight:bold;text-decoration:none;font-size:16px;">COMPLETAR MEU PERFIL</a>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">MOVEACRE — Conectando doadores a quem precisa.</p>
            </div>"""
        },
        {
            "assunto": f"{nome}, alguém pode precisar de você hoje",
            "html": f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <h2 style="font-size:22px;margin-bottom:16px;">{nome}, o estoque do Hemoacre está no limite.</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Pedidos de urgência chegam toda semana. Mas sem saber seu tipo sanguíneo,
                não conseguimos te avisar quando alguém compatível precisar de ajuda.
              </p>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Não sabe seu tipo? Vá ao Hemoacre — o exame é gratuito e você descobre na hora.
              </p>
              <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
                <p style="color:#C8F500;font-size:15px;font-weight:bold;margin-bottom:4px;">Hemoacre</p>
                <p style="color:#888;font-size:13px;">Av. Getúlio Vargas, 2787 — (68) 3248-1380 — Seg a Sex: 07h às 17h</p>
              </div>
              <a href="https://moveacre.com.br/perfil" style="display:inline-block;background:#C8F500;color:#0A0A0A;padding:14px 32px;font-weight:bold;text-decoration:none;font-size:16px;">ATUALIZAR MEU PERFIL</a>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">MOVEACRE — Conectando doadores a quem precisa.</p>
            </div>"""
        },
        {
            "assunto": f"Sério, {nome} — isso pode salvar uma vida",
            "html": f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <h2 style="font-size:22px;margin-bottom:16px;">Uma pessoa pode estar esperando por você agora.</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                {nome}, você se cadastrou como doador mas seu perfil ainda está incompleto.
                Cada dia sem seu tipo sanguíneo é um dia que você pode estar perdendo a chance de salvar alguém.
              </p>
              <div style="background:#111;border-left:4px solid #FF4444;padding:20px;margin-bottom:24px;">
                <p style="color:#FF4444;font-size:15px;font-weight:bold;margin-bottom:8px;">O Acre tem escassez crônica de sangue.</p>
                <p style="color:#888;font-size:13px;line-height:1.6;">
                  Uma única doação pode salvar até 4 vidas. Leva 30 minutos. É gratuito.
                </p>
              </div>
              <a href="https://moveacre.com.br/perfil" style="display:inline-block;background:#C8F500;color:#0A0A0A;padding:14px 32px;font-weight:bold;text-decoration:none;font-size:16px;">COMPLETAR AGORA</a>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">MOVEACRE — Conectando doadores a quem precisa.</p>
            </div>"""
        },
    ]


def _copys_sem_doacao(nome, tipo):
    """Sequência de emails para doadores com tipo mas sem doação — rotativa."""
    return [
        {
            "assunto": "MOVEACRE — Você pode salvar até 4 vidas hoje",
            "html": f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <h2 style="font-size:22px;margin-bottom:16px;">Olá, {nome}!</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Você é doador tipo <strong style="color:#C8F500">{tipo}</strong> e ainda não registrou nenhuma doação.
                O Hemoacre precisa de você — o estoque vive no limite.
              </p>
              <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
                <p style="color:#C8F500;font-size:15px;font-weight:bold;margin-bottom:4px;">Hemoacre</p>
                <p style="color:#888;font-size:13px;">Av. Getúlio Vargas, 2787 — (68) 3248-1380 — Seg a Sex: 07h às 17h</p>
              </div>
              <a href="https://moveacre.com.br" style="display:inline-block;background:#C8F500;color:#0A0A0A;padding:14px 32px;font-weight:bold;text-decoration:none;font-size:16px;">QUERO DOAR</a>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">MOVEACRE — Conectando doadores a quem precisa.</p>
            </div>"""
        },
        {
            "assunto": f"{nome}, sua primeira doação pode mudar tudo",
            "html": f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <h2 style="font-size:22px;margin-bottom:16px;">Você tem algo que alguém precisa.</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Sangue tipo <strong style="color:#C8F500">{tipo}</strong>. Você tem. Alguém no Acre pode precisar agora.
                30 minutos do seu dia podem salvar até 4 vidas.
              </p>
              <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
                <p style="color:#C8F500;font-size:15px;font-weight:bold;margin-bottom:4px;">Hemoacre</p>
                <p style="color:#888;font-size:13px;">Av. Getúlio Vargas, 2787 — (68) 3248-1380 — Seg a Sex: 07h às 17h</p>
              </div>
              <a href="https://moveacre.com.br" style="display:inline-block;background:#C8F500;color:#0A0A0A;padding:14px 32px;font-weight:bold;text-decoration:none;font-size:16px;">IR AO HEMOACRE</a>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">MOVEACRE — Conectando doadores a quem precisa.</p>
            </div>"""
        },
        {
            "assunto": f"Última chamada, {nome} — o Hemoacre precisa de {tipo}",
            "html": f"""
            <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
              <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
              <h2 style="font-size:22px;margin-bottom:16px;">{nome}, o estoque de {tipo} está crítico.</h2>
              <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
                Você se cadastrou como doador. Isso significa que você já deu o primeiro passo.
                Agora falta só um: ir ao Hemoacre.
              </p>
              <div style="background:#111;border-left:4px solid #FF4444;padding:20px;margin-bottom:24px;">
                <p style="color:#FF4444;font-size:15px;font-weight:bold;margin-bottom:8px;">Sem doadores, pacientes ficam sem sangue.</p>
                <p style="color:#888;font-size:13px;line-height:1.6;">
                  Cirurgias são adiadas. Tratamentos são interrompidos. Vidas são perdidas.
                  Você pode mudar isso.
                </p>
              </div>
              <a href="https://moveacre.com.br" style="display:inline-block;background:#C8F500;color:#0A0A0A;padding:14px 32px;font-weight:bold;text-decoration:none;font-size:16px;">QUERO FAZER A DIFERENÇA</a>
              <hr style="border-color:#1a1a1a;margin:32px 0;">
              <p style="color:#333;font-size:11px;">MOVEACRE — Conectando doadores a quem precisa.</p>
            </div>"""
        },
    ]


def _job_engajamento():
    """
    Roda a cada 3 dias às 9h.
    Envia emails com copys rotativas para doadores sem tipo sanguíneo ou sem doação declarada.
    """
    logger.info("[SCHEDULER] Iniciando job de engajamento — %s", datetime.now().strftime("%Y-%m-%d %H:%M"))

    try:
        from config import get_db
        from services.notificacoes import enviar_email

        db = get_db()
        cur = db.cursor()

        # 1. Doadores sem tipo sanguíneo
        cur.execute("""
            SELECT nome_completo, email,
                   COALESCE(engajamento_count, 0) as count
            FROM doadores
            WHERE tipo = 'DOADOR' AND online = 1
              AND (tipo_sangue IS NULL OR tipo_sangue = '')
              AND email IS NOT NULL
        """)
        for d in cur.fetchall():
            d = dict(d)
            nome = d.get('nome_completo') or 'Doador'
            copys = _copys_sem_tipo(nome)
            idx = d['count'] % len(copys)
            copy = copys[idx]
            if enviar_email(d['email'], copy['assunto'], copy['html']):
                try:
                    cur.execute("UPDATE doadores SET engajamento_count = COALESCE(engajamento_count,0)+1 WHERE email=%s", (d['email'],))
                except Exception:
                    pass

        # 2. Doadores com tipo mas sem doação
        cur.execute("""
            SELECT nome_completo, email, tipo_sangue,
                   COALESCE(engajamento_count, 0) as count
            FROM doadores
            WHERE tipo = 'DOADOR' AND online = 1
              AND tipo_sangue IS NOT NULL AND tipo_sangue != ''
              AND (data_ultima_doacao IS NULL OR data_ultima_doacao = '')
              AND email IS NOT NULL
        """)
        for d in cur.fetchall():
            d = dict(d)
            nome = d.get('nome_completo') or 'Doador'
            tipo = d.get('tipo_sangue', '')
            copys = _copys_sem_doacao(nome, tipo)
            idx = d['count'] % len(copys)
            copy = copys[idx]
            if enviar_email(d['email'], copy['assunto'], copy['html']):
                try:
                    cur.execute("UPDATE doadores SET engajamento_count = COALESCE(engajamento_count,0)+1 WHERE email=%s", (d['email'],))
                except Exception:
                    pass

        db.commit()
        logger.info("[SCHEDULER] Job de engajamento concluído.")

    except Exception as e:
        logger.error("[SCHEDULER] Erro no job de engajamento: %s", e)


def _job_limpeza_dados():
    """
    Roda todo dia à meia-noite.
    1. Exclui laudos/atestados de contas desativadas há mais de 30 dias (política de privacidade).
    2. Exclui dados cadastrais de contas desativadas há mais de 12 meses.
    """
    logger.info("[SCHEDULER] Iniciando job de limpeza de dados — %s", datetime.now().strftime("%Y-%m-%d %H:%M"))

    try:
        from config import get_db
        from services.storage import delete_file, LAUDO_BUCKET, ATESTADO_BUCKET

        db = get_db()
        cur = db.cursor()

        # 1. Laudos de pedidos de contas desativadas há > 30 dias
        cur.execute("""
            SELECT p.id, p.laudo_path
            FROM pedidos_emergentes p
            INNER JOIN doadores d ON d.clerk_user_id = p.auth_user_id
            WHERE d.online = 0
              AND p.laudo_path IS NOT NULL
              AND p.laudo_path != ''
              AND d.desativado_em < NOW() - INTERVAL '30 days'
        """)
        laudos = cur.fetchall()
        for row in laudos:
            row = dict(row)
            try:
                delete_file(row['laudo_path'], LAUDO_BUCKET)
            except Exception as e:
                logger.warning("[SCHEDULER] Erro ao deletar laudo %s: %s", row['laudo_path'], e)
            cur.execute("UPDATE pedidos_emergentes SET laudo_path = NULL WHERE id = %s", (row['id'],))
        logger.info("[SCHEDULER] Laudos excluídos: %d", len(laudos))

        # 2. Atestados de doações de contas desativadas há > 30 dias
        cur.execute("""
            SELECT dc.id, dc.atestado_url
            FROM doacoes dc
            INNER JOIN doadores d ON d.email = dc.doador_email
            WHERE d.online = 0
              AND dc.atestado_url IS NOT NULL
              AND dc.atestado_url != ''
              AND d.desativado_em < NOW() - INTERVAL '30 days'
        """)
        atestados = cur.fetchall()
        for row in atestados:
            row = dict(row)
            try:
                delete_file(row['atestado_url'], ATESTADO_BUCKET)
            except Exception as e:
                logger.warning("[SCHEDULER] Erro ao deletar atestado %s: %s", row['atestado_url'], e)
            cur.execute("UPDATE doacoes SET atestado_url = NULL WHERE id = %s", (row['id'],))
        logger.info("[SCHEDULER] Atestados excluídos: %d", len(atestados))

        # 3. Dados cadastrais de contas desativadas há > 12 meses
        cur.execute("""
            SELECT id, email FROM doadores
            WHERE online = 0
              AND desativado_em < NOW() - INTERVAL '12 months'
        """)
        contas = cur.fetchall()
        for row in contas:
            row = dict(row)
            cur.execute("DELETE FROM doacoes WHERE doador_email = %s", (row['email'],))
            cur.execute("DELETE FROM pedidos_emergentes WHERE email_solicitante = %s", (row['email'],))
            cur.execute("DELETE FROM doadores WHERE id = %s", (row['id'],))
        logger.info("[SCHEDULER] Contas expiradas excluídas: %d", len(contas))

        db.commit()
        logger.info("[SCHEDULER] Limpeza de dados concluída.")

    except Exception as e:
        logger.error("[SCHEDULER] Erro no job de limpeza: %s", e)


def _job_recorrencia():
    """
    Roda todo dia às 8h.
    Verifica doadores aptos para nova doação e envia notificação de recorrência.
    """
    logger.info("[SCHEDULER] Iniciando job de recorrência — %s", datetime.now().strftime("%Y-%m-%d %H:%M"))

    try:
        from config import get_db
        from services.filtragem import _dias_desde, _intervalo_minimo
        from services.notificacoes import (
            enviar_email, enviar_whatsapp,
            template_recorrencia_email, template_recorrencia_whatsapp,
        )

        db = get_db()
        cur = db.cursor()
        cur.execute("""
            SELECT * FROM doadores
            WHERE tipo = 'DOADOR'
              AND online = 1
              AND data_ultima_doacao IS NOT NULL
        """)
        doadores = [dict(r) for r in cur.fetchall()]

        aptos = []
        for d in doadores:
            dias = _dias_desde(str(d.get("data_ultima_doacao") or ""))
            if dias is not None and dias >= _intervalo_minimo(d.get("genero", "")):
                aptos.append(d)

        logger.info("[SCHEDULER] %d doadores aptos para nova doação", len(aptos))

        enviados_email = 0
        enviados_wa    = 0

        for doador in aptos:
            nome          = doador.get("nome_completo") or "Doador"
            email         = doador.get("email", "")
            tel           = doador.get("telefone", "")
            ultima_doacao = str(doador.get("data_ultima_doacao") or "")

            if email:
                html = template_recorrencia_email(nome, ultima_doacao)
                if enviar_email(email, "🩸 MOVEACRE — Você já pode doar novamente!", html):
                    enviados_email += 1

            if tel:
                msg = template_recorrencia_whatsapp(nome, ultima_doacao)
                if enviar_whatsapp(tel, msg):
                    enviados_wa += 1

        logger.info(
            "[SCHEDULER] Recorrência concluída — emails: %d | whatsapps: %d",
            enviados_email, enviados_wa,
        )

    except Exception as e:
        logger.error("[SCHEDULER] Erro no job de recorrência: %s", e)


def init_scheduler():
    """
    Inicializa o scheduler em background.
    Chamado uma vez no create_app() do app.py.
    """
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger
    except ImportError:
        logger.warning(
            "[SCHEDULER] APScheduler não instalado — jobs automáticos desativados. "
            "Execute: pip install apscheduler"
        )
        return

    # FIX BAIXO: fuso horário corrigido para America/Rio_Branco (UTC-5)
    # America/Manaus é UTC-4 — Rio Branco/AC usa UTC-5
    scheduler = BackgroundScheduler(timezone="America/Rio_Branco")

    # Recorrência: todo dia às 8h
    scheduler.add_job(
        _job_recorrencia,
        trigger=CronTrigger(hour=8, minute=0),
        id="recorrencia_diaria",
        name="Notificação de recorrência de doação",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    # Limpeza de dados: todo dia à meia-noite
    scheduler.add_job(
        _job_limpeza_dados,
        trigger=CronTrigger(hour=0, minute=0),
        id="limpeza_dados_diaria",
        name="Exclusão de laudos e dados expirados (LGPD)",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    # Engajamento: a cada 3 dias às 9h
    scheduler.add_job(
        _job_engajamento,
        trigger=CronTrigger(day="*/3", hour=9, minute=0),
        id="engajamento_3dias",
        name="Engajamento — perfil incompleto e primeira doação",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    scheduler.start()
    logger.info("[SCHEDULER] Iniciado — timezone=America/Rio_Branco — recorrência: 08:00, limpeza: 00:00, engajamento: 09:00 (a cada 3 dias)")
