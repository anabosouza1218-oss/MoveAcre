"""
services/notificacoes.py
Serviço de notificações — Email e WhatsApp.
Pronto para integração: substitua os stubs pelas chamadas reais das APIs.

EMAIL: Resend (https://resend.com) — pip install resend
WHATSAPP: Twilio (https://twilio.com) — pip install twilio
           ou Z-API / WPPConnect para WhatsApp Business não-oficial
"""
import os
import logging

logger = logging.getLogger(__name__)

# ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
# Preencha no .env.local:
#   RESEND_API_KEY=re_xxxx
#   RESEND_FROM=noreply@moveacre.com.br
#   TWILIO_ACCOUNT_SID=ACxxxx
#   TWILIO_AUTH_TOKEN=xxxx
#   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
#   (ou para Z-API)
#   ZAPI_INSTANCE_ID=xxxx
#   ZAPI_TOKEN=xxxx

RESEND_API_KEY    = os.getenv("RESEND_API_KEY", "")
RESEND_FROM       = os.getenv("RESEND_FROM", "noreply@moveacre.com.br")

TWILIO_SID        = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN      = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WA_FROM    = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

ZAPI_INSTANCE     = os.getenv("ZAPI_INSTANCE_ID", "")
ZAPI_TOKEN_KEY    = os.getenv("ZAPI_TOKEN", "")


# ─── EMAIL ────────────────────────────────────────────────────────────────────

def enviar_email(destinatario: str, assunto: str, html: str) -> bool:
    if not RESEND_API_KEY:
        logger.warning("[EMAIL] RESEND_API_KEY não configurada — email simulado para %s", destinatario)
        return True

    try:
        import requests
        res = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": RESEND_FROM,
                "to": destinatario,
                "subject": assunto,
                "html": html,
            },
            timeout=10,
        )
        res.raise_for_status()
        logger.info("[EMAIL] Enviado para %s", destinatario)
        return True
    except Exception as e:
        logger.error("[EMAIL] Falha ao enviar para %s: %s", destinatario, e)
        return False


# ─── WHATSAPP ─────────────────────────────────────────────────────────────────

def enviar_whatsapp(telefone: str, mensagem: str) -> bool:
    """
    Envia WhatsApp via Twilio Sandbox ou Z-API.
    Twilio: pip install twilio  e  definir TWILIO_* no .env
    Z-API:  definir ZAPI_INSTANCE_ID e ZAPI_TOKEN no .env
    """
    numero = _normalizar_telefone(telefone)

    # Tenta Twilio primeiro
    if TWILIO_SID and TWILIO_TOKEN:
        return _enviar_twilio(numero, mensagem)

    # Fallback Z-API
    if ZAPI_INSTANCE and ZAPI_TOKEN_KEY:
        return _enviar_zapi(numero, mensagem)

    logger.warning("[WHATSAPP] Nenhuma API configurada — mensagem simulada para %s", numero)
    logger.info("[WHATSAPP SIMULADO] Para: %s | Msg: %s", numero, mensagem[:80])
    return True  # Simula sucesso em dev


def _normalizar_telefone(tel: str) -> str:
    """Remove tudo que não é dígito e garante código do país."""
    import re
    digits = re.sub(r"\D", "", tel)
    if not digits.startswith("55"):
        digits = "55" + digits
    return digits


def _enviar_twilio(numero: str, mensagem: str) -> bool:
    try:
        from twilio.rest import Client  # type: ignore
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        client.messages.create(
            body=mensagem,
            from_=TWILIO_WA_FROM,
            to=f"whatsapp:+{numero}",
        )
        logger.info("[WHATSAPP/Twilio] Enviado para +%s", numero)
        return True
    except Exception as e:
        logger.error("[WHATSAPP/Twilio] Falha para +%s: %s", numero, e)
        return False


def _enviar_zapi(numero: str, mensagem: str) -> bool:
    try:
        import requests  # type: ignore
        url = f"https://api.z-api.io/instances/{ZAPI_INSTANCE}/token/{ZAPI_TOKEN_KEY}/send-text"
        payload = {"phone": numero, "message": mensagem}
        r = requests.post(url, json=payload, timeout=10)
        r.raise_for_status()
        logger.info("[WHATSAPP/Z-API] Enviado para %s", numero)
        return True
    except Exception as e:
        logger.error("[WHATSAPP/Z-API] Falha para %s: %s", numero, e)
        return False


# ─── TEMPLATES ────────────────────────────────────────────────────────────────

def template_pedido_doacao_email(doador_nome: str, tipo_sangue: str, nivel: str, contato: str, receptor_nome: str = "") -> str:
    cor_nivel = {"CRITICA": "#FF3333", "ALTA": "#FF8800", "MEDIA": "#C8F500", "BAIXA": "#44FF88"}.get(nivel, "#C8F500")
    receptor_str = f"<strong style=\"color:#C8F500\">{receptor_nome}</strong>" if receptor_nome else "um paciente"
    return f"""
    <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
      <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue</p>
      <h2 style="font-size:24px;margin-bottom:16px;">Olá, {doador_nome}</h2>
      <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
        {receptor_str} precisa de sangue tipo <strong style="color:#C8F500">{tipo_sangue}</strong>
        e você é um doador compatível.
      </p>
      <div style="background:#111;border-left:4px solid {cor_nivel};padding:20px;margin-bottom:24px;">
        <p style="color:#555;font-size:11px;margin-bottom:4px;">NÍVEL DE URGÊNCIA</p>
        <p style="color:{cor_nivel};font-size:24px;font-weight:bold;">{nivel}</p>
      </div>

      <!-- BLOCO DE INSTRUÇÕES DESTACADO -->
      <div style="background:#0d1a00;border:3px solid #C8F500;padding:28px;margin-bottom:28px;border-radius:2px;">
        <p style="color:#C8F500;font-size:16px;font-weight:bold;margin-bottom:4px;letter-spacing:0.05em;">COMO REALIZAR SUA DOAÇÃO — LEIA COM ATENÇÃO</p>
        <p style="color:#aaa;font-size:13px;margin-bottom:20px;line-height:1.5;">
          Siga os passos abaixo para que sua doação chegue corretamente ao receptor. É simples e rápido!
        </p>

        <div style="background:#0a0a0a;border-left:4px solid #C8F500;padding:16px;margin-bottom:12px;">
          <p style="color:#C8F500;font-size:13px;font-weight:bold;margin-bottom:6px;">PASSO 1 — Vá ao Centro de Hemoterapia do Acre (Hemoacre)</p>
          <p style="color:#aaa;font-size:13px;line-height:1.7;">
            Dirija-se pessoalmente à unidade do Hemoacre no endereço abaixo. Certifique-se de que você está
            ciente e de acordo com os <a href="https://moveacre.com.br/criterios" style="color:#C8F500;">critérios de doação</a>
            — estar em boas condições de saúde, não estar em jejum e respeitar o intervalo mínimo desde a última doação.
          </p>
          <div style="background:#111;padding:12px;margin-top:10px;">
            <p style="color:#C8F500;font-size:14px;font-weight:bold;margin-bottom:4px;">(68) 3248-1380</p>
            <p style="color:#888;font-size:12px;line-height:1.6;">Av. Getúlio Vargas, 2787 - Bosque<br>Rio Branco, AC — CEP 69900-607<br>Seg a Sex: 07h às 17h</p>
          </div>
        </div>

        <div style="background:#0a0a0a;border-left:4px solid #C8F500;padding:16px;margin-bottom:12px;">
          <p style="color:#C8F500;font-size:13px;font-weight:bold;margin-bottom:6px;">PASSO 2 — Informe na recepção que você faz parte do MOVEACRE</p>
          <p style="color:#aaa;font-size:13px;line-height:1.7;">
            Ao chegar no balcão da recepção do Hemoacre, informe ao atendente que você está participando do
            <strong style="color:#F5F5F0;">Projeto MOVEACRE</strong> e que deseja realizar uma doação direcionada para o receptor:
          </p>
          <div style="background:#111;border:1px solid #C8F500;padding:14px;margin-top:10px;text-align:center;">
            <p style="color:#555;font-size:10px;margin-bottom:4px;letter-spacing:0.1em;">NOME DO RECEPTOR</p>
            <p style="color:#C8F500;font-size:20px;font-weight:bold;">{receptor_nome if receptor_nome else "Receptor não informado"}</p>
          </div>
          <p style="color:#888;font-size:12px;margin-top:10px;line-height:1.5;">
            Informe exatamente esse nome. Isso é o que permite que o sangue seja corretamente direcionado ao receptor cadastrado no sistema.
          </p>
        </div>

        <div style="background:#0a0a0a;border-left:4px solid #C8F500;padding:16px;">
          <p style="color:#C8F500;font-size:13px;font-weight:bold;margin-bottom:6px;">PASSO 3 — Siga os procedimentos do Hemoacre normalmente</p>
          <p style="color:#aaa;font-size:13px;line-height:1.7;">
            A partir daí, basta seguir as orientações da equipe do Hemoacre. Eles realizarão a triagem, a coleta
            e todo o processo com segurança. A doação leva aproximadamente 30 minutos no total.
            Você pode ir tranquilo — a equipe já conhece o projeto MOVEACRE e saberá como proceder.
          </p>
        </div>
      </div>
      <!-- FIM DO BLOCO DE INSTRUÇÕES -->

      <div style="background:#111;border-left:4px solid #333;padding:16px;margin-bottom:24px;">
        <p style="color:#555;font-size:11px;margin-bottom:8px;">ALGUNS REQUISITOS BÁSICOS</p>
        <ul style="color:#aaa;font-size:13px;line-height:1.8;padding-left:20px;margin:0;">
          <li>Ter entre 16 e 69 anos (menores com autorização)</li>
          <li>Pesar no mínimo 50kg</li>
          <li>Estar em boas condições de saúde</li>
          <li>Homens: intervalo mínimo de 60 dias entre doações</li>
          <li>Mulheres: intervalo mínimo de 90 dias entre doações</li>
          <li>Não estar em jejum (evitar alimentos gordurosos)</li>
        </ul>
        <p style="color:#555;font-size:11px;margin-top:12px;line-height:1.5;">
          Existem outros critérios de elegibilidade. O Hemoacre realiza triagem completa no dia da doação.
          <a href="https://moveacre.com.br/criterios" style="color:#C8F500;"> Ver todos os critérios →</a>
        </p>
      </div>
      <hr style="border-color:#1a1a1a;margin:32px 0;">
      <p style="color:#333;font-size:11px;">Você recebeu esta mensagem pois está cadastrado como doador no MOVEACRE.</p>
    </div>
    """


def template_boas_vindas_email(doador_nome: str, tipo_sangue: str) -> str:
    tipo_str = f" tipo <strong style='color:#C8F500'>{tipo_sangue}</strong>" if tipo_sangue else ""
    return f"""
    <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
      <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
      <h2 style="font-size:24px;margin-bottom:16px;">Olá, {doador_nome}!</h2>
      <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
        Seu cadastro está completo. Você agora faz parte da rede MOVEACRE como doador de sangue{tipo_str}.
      </p>
      <div style="background:#111;border-left:4px solid #C8F500;padding:20px;margin-bottom:24px;">
        <p style="color:#C8F500;font-size:16px;font-weight:bold;margin-bottom:8px;">Que tal sua primeira doação?</p>
        <p style="color:#888;font-size:13px;line-height:1.6;">
          O estoque do Hemoacre vive no limite. Uma única doação pode salvar até 4 vidas.
          Leva menos de 30 minutos e é totalmente gratuito.
        </p>
      </div>
      <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
        <p style="color:#C8F500;font-size:18px;font-weight:bold;margin-bottom:8px;">Hemoacre</p>
        <p style="color:#888;font-size:13px;line-height:1.6;">
          Av. Getúlio Vargas, 2787 - Bosque<br>
          Rio Branco, AC — CEP 69900-607<br>
          (68) 3248-1380<br>
          Seg a Sex: 07h às 17h
        </p>
      </div>
      <div style="background:#111;border-left:4px solid #333;padding:16px;margin-bottom:24px;">
        <p style="color:#555;font-size:11px;margin-bottom:8px;">ALGUNS REQUISITOS BÁSICOS</p>
        <ul style="color:#aaa;font-size:13px;line-height:1.8;padding-left:20px;margin:0;">
          <li>Ter entre 16 e 69 anos</li>
          <li>Pesar no mínimo 50kg</li>
          <li>Estar em boas condições de saúde</li>
          <li>Não estar em jejum (evitar alimentos gordurosos)</li>
        </ul>
        <p style="color:#555;font-size:12px;margin-top:12px;line-height:1.6;">
          Existem outros critérios (medicamentos, viagens, tatuagens recentes, etc.).
          O Hemoacre faz triagem completa no dia.
          <a href="https://moveacre.com.br/criterios" style="color:#C8F500;">Ver todos os critérios →</a>
        </p>
      </div>
      <hr style="border-color:#1a1a1a;margin:32px 0;">
      <p style="color:#333;font-size:11px;">
        Você recebeu este email pois se cadastrou no MOVEACRE.<br>
        Acesse <a href="https://moveacre.com.br" style="color:#C8F500;">moveacre.com.br</a> para gerenciar seu perfil.
      </p>
    </div>
    """


def template_recorrencia_email(doador_nome: str, ultima_doacao: str) -> str:
    return f"""
    <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
      <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue</p>
      <h2 style="font-size:24px;margin-bottom:16px;">Olá, {doador_nome}!</h2>
      <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
        Sua última doação foi em <strong style="color:#C8F500">{ultima_doacao}</strong>.
        Você já está apto para doar novamente!
      </p>
      <p style="color:#aaa;line-height:1.6;">
        Acesse a plataforma e declare sua próxima doação para manter seu nível atualizado.
      </p>
      <hr style="border-color:#1a1a1a;margin:32px 0;">
      <p style="color:#333;font-size:11px;">MOVEACRE — Conectando doadores a quem precisa.</p>
    </div>
    """


def template_pedido_doacao_whatsapp(doador_nome: str, tipo_sangue: str, nivel: str, contato: str) -> str:
    return (
        f"🩸 *MOVEACRE — Pedido de Doação*\n\n"
        f"Olá, {doador_nome}!\n\n"
        f"Um paciente precisa de sangue tipo *{tipo_sangue}* com urgência *{nivel}*.\n\n"
        f"Você é um doador compatível. Para ajudar, entre em contato:\n"
        f"📞 {contato}\n\n"
        f"_Acesse moveacre.com.br para mais informações._"
    )


def template_recorrencia_whatsapp(doador_nome: str, ultima_doacao: str) -> str:
    return (
        f"🩸 *MOVEACRE — Hora de Doar!*\n\n"
        f"Olá, {doador_nome}!\n\n"
        f"Sua última doação foi em *{ultima_doacao}*.\n"
        f"Você já está apto para doar novamente!\n\n"
        f"Acesse a plataforma e declare sua próxima doação. 💪"
    )


# ─── TEMPLATES DE FEEDBACK AO SOLICITANTE ────────────────────────────────────

def template_confirmacao_pedido_email(paciente_nome: str, tipo_necessario: str, nivel: str) -> str:
    cor_nivel = {"CRITICA": "#FF3333", "ALTA": "#FF8800", "MEDIA": "#C8F500", "BAIXA": "#44FF88"}.get(nivel, "#C8F500")
    return f"""
    <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
      <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
      <h2 style="font-size:22px;margin-bottom:16px;">Pedido recebido com sucesso</h2>
      <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
        Seu pedido de sangue tipo <strong style="color:#C8F500">{tipo_necessario}</strong>
        para <strong style="color:#F5F5F0">{paciente_nome}</strong> foi recebido e está
        <strong style="color:#C8F500"> aguardando revisão</strong> pela nossa equipe.
      </p>
      <div style="background:#111;border-left:4px solid {cor_nivel};padding:20px;margin-bottom:24px;">
        <p style="color:#555;font-size:11px;margin-bottom:4px;">NÍVEL SUGERIDO</p>
        <p style="color:{cor_nivel};font-size:20px;font-weight:bold;">{nivel}</p>
      </div>
      <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
        <p style="color:#C8F500;font-size:13px;font-weight:bold;margin-bottom:12px;">O QUE ACONTECE AGORA?</p>
        <ol style="color:#aaa;font-size:13px;line-height:2;padding-left:20px;margin:0;">
          <li>Nossa equipe revisa o pedido (geralmente em até 24h)</li>
          <li>Se aprovado, notificamos doadores compatíveis por email e WhatsApp</li>
          <li>Você recebe um email confirmando a aprovação e quantos doadores foram notificados</li>
          <li>Os doadores irão realizar a doação presencialmente no Centro de Hemoterapia do Acre (Hemoacre)</li>
          <li>O sangue doado será redirecionado diretamente para você, o receptor</li>
        </ol>
      </div>
      <div style="background:#1a0000;border-left:4px solid #FF3333;padding:16px;margin-bottom:24px;">
        <p style="color:#FF6666;font-size:13px;line-height:1.6;">
          <strong>EMERGÊNCIA MÉDICA?</strong> O MOVEACRE não é um serviço de emergência.
          Ligue imediatamente para o <strong>SAMU (192)</strong> ou vá ao pronto-socorro mais próximo.
        </p>
      </div>
      <hr style="border-color:#1a1a1a;margin:32px 0;">
      <p style="color:#333;font-size:11px;">
        Acesse <a href="https://moveacre.com.br" style="color:#C8F500;">moveacre.com.br</a> para acompanhar o status do seu pedido.
      </p>
    </div>
    """


def template_pedido_aprovado_email(paciente_nome: str, tipo_necessario: str, nivel: str, notificados: int) -> str:
    cor_nivel = {"CRITICA": "#FF3333", "ALTA": "#FF8800", "MEDIA": "#C8F500", "BAIXA": "#44FF88"}.get(nivel, "#C8F500")
    msg_notif = f"<strong style='color:#C8F500'>{notificados} doador{'es' if notificados != 1 else ''}</strong> compatível{'is' if notificados != 1 else ''} {'foram' if notificados != 1 else 'foi'} notificado{'s' if notificados != 1 else ''}." if notificados > 0 else "Ainda não há doadores compatíveis cadastrados — divulgue o pedido para ampliar o alcance."
    return f"""
    <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
      <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
      <div style="background:#001a00;border-left:4px solid #44FF88;padding:16px;margin-bottom:24px;">
        <p style="color:#44FF88;font-size:14px;font-weight:bold;">✓ SEU PEDIDO FOI APROVADO</p>
      </div>
      <h2 style="font-size:22px;margin-bottom:16px;">Pedido de {paciente_nome}</h2>
      <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
        Seu pedido de sangue tipo <strong style="color:#C8F500">{tipo_necessario}</strong>
        foi aprovado com nível de urgência <strong style="color:{cor_nivel}">{nivel}</strong>.
      </p>
      <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
        <p style="color:#555;font-size:11px;margin-bottom:8px;">DOADORES NOTIFICADOS</p>
        <p style="color:#F5F5F0;font-size:16px;line-height:1.6;">{msg_notif}</p>
        <p style="color:#555;font-size:12px;margin-top:8px;line-height:1.5;">
          Os doadores notificados irão realizar a doação presencialmente no Centro de Hemoterapia do Acre (Hemoacre).
          O sangue será redirecionado diretamente para você. Fique atento às atualizações do pedido.
        </p>
      </div>
      <div style="background:#1a0000;border-left:4px solid #FF3333;padding:16px;margin-bottom:24px;">
        <p style="color:#FF6666;font-size:13px;line-height:1.6;">
          <strong>EMERGÊNCIA MÉDICA?</strong> Ligue para o <strong>SAMU (192)</strong> ou vá ao pronto-socorro.
          O MOVEACRE não substitui atendimento médico de urgência.
        </p>
      </div>
      <hr style="border-color:#1a1a1a;margin:32px 0;">
      <p style="color:#333;font-size:11px;">
        Acesse <a href="https://moveacre.com.br" style="color:#C8F500;">moveacre.com.br</a> para acompanhar seu pedido.
      </p>
    </div>
    """


def template_pedido_recusado_email(paciente_nome: str, tipo_necessario: str, motivo: str) -> str:
    return f"""
    <div style="background:#0A0A0A;color:#F5F5F0;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
      <h1 style="color:#C8F500;font-size:32px;margin-bottom:8px;">MOVEACRE</h1>
      <p style="color:#555;font-size:12px;margin-bottom:32px;">Sistema de Doação de Sangue — Acre, Brasil</p>
      <div style="background:#1a0000;border-left:4px solid #FF3333;padding:16px;margin-bottom:24px;">
        <p style="color:#FF6666;font-size:14px;font-weight:bold;">✗ SEU PEDIDO NÃO FOI APROVADO</p>
      </div>
      <h2 style="font-size:22px;margin-bottom:16px;">Pedido de {paciente_nome}</h2>
      <p style="color:#aaa;line-height:1.6;margin-bottom:24px;">
        Seu pedido de sangue tipo <strong style="color:#C8F500">{tipo_necessario}</strong>
        não pôde ser aprovado pela nossa equipe.
      </p>
      <div style="background:#111;border-left:4px solid #FF3333;padding:20px;margin-bottom:24px;">
        <p style="color:#555;font-size:11px;margin-bottom:8px;">MOTIVO</p>
        <p style="color:#F5F5F0;font-size:14px;line-height:1.6;">{motivo}</p>
      </div>
      <div style="background:#111;border:1px solid #222;padding:20px;margin-bottom:24px;">
        <p style="color:#C8F500;font-size:13px;font-weight:bold;margin-bottom:12px;">O QUE FAZER AGORA?</p>
        <ul style="color:#aaa;font-size:13px;line-height:2;padding-left:20px;margin:0;">
          <li>Corrija as informações e crie um novo pedido em <a href="https://moveacre.com.br" style="color:#C8F500;">moveacre.com.br</a></li>
          <li>Entre em contato com o nosso suporte: <a href="mailto:suporte.moveacre@gmail.com" style="color:#C8F500;">suporte.moveacre@gmail.com</a></li>
          <li>Em emergências, ligue para o <strong style="color:#FF6666">SAMU (192)</strong></li>
        </ul>
      </div>
      <hr style="border-color:#1a1a1a;margin:32px 0;">
      <p style="color:#333;font-size:11px;">
        Dúvidas? Entre em contato: <a href="mailto:suporte.moveacre@gmail.com" style="color:#C8F500;">suporte.moveacre@gmail.com</a>
      </p>
    </div>
    """
