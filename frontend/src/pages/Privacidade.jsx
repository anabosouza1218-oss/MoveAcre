import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .pv-root { background: #0A0A0A; color: #F5F5F0; font-family: 'Barlow', sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
  .pv-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid #111; }
  .pv-back { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #555; text-decoration: none; }
  .pv-back:hover { color: #C8F500; }
  .pv-content { flex: 1; max-width: 760px; width: 100%; margin: 0 auto; padding: 64px 40px; }
  .pv-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #C8F500; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; }
  .pv-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: clamp(36px, 6vw, 64px); line-height: 0.95; text-transform: uppercase; color: #F5F5F0; margin-bottom: 8px; }
  .pv-title span { color: #C8F500; }
  .pv-date { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; margin-bottom: 48px; }
  .pv-section { margin-bottom: 40px; }
  .pv-section-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 20px; text-transform: uppercase; color: #C8F500; margin-bottom: 12px; letter-spacing: 0.03em; }
  .pv-text { font-size: 14px; color: #777; line-height: 1.8; }
  .pv-text strong { color: #F5F5F0; font-weight: 500; }
  .pv-divider { border: none; border-top: 1px solid #111; margin: 40px 0; }
  .pv-footer { padding: 20px 40px; border-top: 1px solid #111; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .pv-footer-copy { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #333; }
  .pv-footer-link { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; text-decoration: none; }
  .pv-footer-link:hover { color: #C8F500; }
  @media (max-width: 600px) {
    .pv-nav { padding: 14px 20px; }
    .pv-content { padding: 40px 20px; }
    .pv-footer { padding: 16px 20px; }
  }
`;

export default function Privacidade() {
  return (
    <div className="pv-root">
      <style>{styles}</style>
      <nav className="pv-nav">
        <Logo />
        <Link to="/" className="pv-back">← VOLTAR</Link>
      </nav>

      <div className="pv-content">
        <div className="pv-eyebrow">// LEGAL</div>
        <h1 className="pv-title">Política de<br /><span>Privacidade</span></h1>
        <p className="pv-date">Última atualização: maio de 2026</p>

        <div className="pv-section">
          <div className="pv-section-title">1. Introdução</div>
          <p className="pv-text">
            O MOVEACRE respeita a privacidade dos seus usuários e está comprometido com a proteção dos dados pessoais em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>. Esta Política descreve como coletamos, utilizamos, armazenamos e protegemos as suas informações.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">2. Dados Coletados</div>
          <p className="pv-text">
            Coletamos os seguintes dados pessoais:<br /><br />
            — <strong>Dados de identificação:</strong> nome completo, endereço de e-mail;<br />
            — <strong>Dados de saúde:</strong> tipo sanguíneo, gênero, idade, data da última doação;<br />
            — <strong>Dados de contato:</strong> número de telefone, cidade;<br />
            — <strong>Documentos:</strong> atestados de doação e laudos médicos enviados voluntariamente;<br />
            — <strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo, logs de acesso.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">3. Finalidade do Tratamento e Base Legal</div>
          <p className="pv-text">
            Os dados são utilizados exclusivamente para as finalidades abaixo, com as respectivas bases legais do Art. 7 da LGPD:<br /><br />
            — <strong>Gerenciar cadastro e perfil</strong> — base legal: execução de contrato (Art. 7, V);<br />
            — <strong>Enviar notificações de urgência compatíveis com o tipo sanguíneo</strong> — base legal: consentimento (Art. 7, I) e legítimo interesse (Art. 7, IX);<br />
            — <strong>Verificar elegibilidade para doação</strong> — base legal: consentimento para dados sensíveis (Art. 11, I);<br />
            — <strong>Manter histórico de doações</strong> — base legal: execução de contrato (Art. 7, V);<br />
            — <strong>Logs de acesso e segurança</strong> — base legal: cumprimento de obrigação legal (Art. 7, II — Marco Civil da Internet, Art. 15);<br />
            — <strong>Dados técnicos</strong> (IP, dispositivo) — base legal: legítimo interesse para segurança da plataforma (Art. 7, IX).
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">4. Dados de Saúde, Consentimento e Menores de Idade</div>
          <p className="pv-text">
            Os dados de saúde (tipo sanguíneo, histórico de doações, atestados e laudos médicos) são considerados <strong>dados sensíveis</strong> nos termos do Art. 11 da LGPD. O seu tratamento é realizado com base no <strong>consentimento específico, livre, informado e inequívoco</strong> do titular, coletado por meio de checkbox destacado no momento do cadastro, separado da aceitação geral dos Termos de Uso.<br /><br />
            O consentimento é solicitado nos seguintes termos: <em>"Dou meu consentimento livre e esclarecido para o tratamento dos meus dados de saúde (tipo sanguíneo, histórico de doações e laudos médicos) pelo MOVEACRE, exclusivamente para fins de gestão de doação de sangue, conforme descrito na Política de Privacidade."</em><br /><br />
            <strong>Menores de idade:</strong> A plataforma permite o cadastro de doadores a partir de 16 anos, conforme critérios do Ministério da Saúde. Para usuários entre 16 e 17 anos, o consentimento para tratamento de dados deve ser fornecido pelos pais ou responsáveis legais, nos termos do Art. 14 da LGPD. O MOVEACRE não coleta dados de crianças menores de 16 anos. Caso identifiquemos cadastro de menor sem autorização, os dados serão excluídos imediatamente.<br /><br />
            Esses dados nunca são compartilhados com terceiros para fins comerciais.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">5. Compartilhamento e Transferência Internacional de Dados</div>
          <p className="pv-text">
            O MOVEACRE não vende, aluga ou compartilha dados pessoais com terceiros, exceto:<br /><br />
            — <strong>Prestadores de serviço técnico</strong> necessários ao funcionamento da plataforma, todos sujeitos a acordos de confidencialidade e obrigações compatíveis com a LGPD:<br /><br />
            &nbsp;&nbsp;• <strong>Supabase</strong> (banco de dados e armazenamento de arquivos) — servidores nos EUA;<br />
            &nbsp;&nbsp;• <strong>Railway</strong> (hospedagem da aplicação) — servidores nos EUA;<br />
            &nbsp;&nbsp;• <strong>Clerk</strong> (autenticação de usuários) — servidores nos EUA;<br />
            &nbsp;&nbsp;• <strong>Resend</strong> (envio de e-mails transacionais) — servidores nos EUA.<br /><br />
            — <strong>Autoridades competentes</strong> quando exigido por lei ou ordem judicial.<br /><br />
            <strong>Transferência Internacional:</strong> Em razão dos sub-processadores listados acima, os seus dados podem ser transferidos e processados em servidores localizados fora do Brasil, especialmente nos Estados Unidos. Os EUA não possuem legislação federal equivalente à LGPD. A transferência ocorre com base no <strong>Art. 33, II da LGPD</strong> (garantias contratuais adequadas), por meio das <strong>cláusulas contratuais padrão</strong> (Standard Contractual Clauses — SCCs) adotadas por cada sub-processador em seus Termos de Serviço e Acordos de Processamento de Dados (DPA). O titular pode solicitar cópia dos mecanismos de garantia aplicáveis pelo e-mail <strong>moveacre.suporte@gmail.com</strong>.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">6. Armazenamento e Segurança</div>
          <p className="pv-text">
            Os dados são armazenados em servidores seguros com <strong>criptografia em trânsito (TLS/HTTPS)</strong> e <strong>criptografia em repouso (AES-256)</strong>, conforme implementado pelo Supabase. Os arquivos enviados (atestados e laudos) são armazenados no Supabase Storage com controle de acesso restrito.<br /><br />
            Implementamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou destruição. Dado o caráter sensível dos dados de saúde tratados, mantemos internamente um <strong>Relatório de Impacto à Proteção de Dados Pessoais (RIPD)</strong>, conforme recomendado pelo Art. 38 da LGPD. O RIPD pode ser solicitado pelo titular ou pela ANPD — encaminhe a solicitação para <strong>moveacre.suporte@gmail.com</strong> com o assunto "RIPD — Solicitação".<br /><br />
            Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, comunicaremos a ocorrência à ANPD e aos usuários afetados em até <strong>72 horas</strong> após a ciência do incidente.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">7. Direitos do Titular</div>
          <p className="pv-text">
            Nos termos da LGPD, o usuário tem direito a:<br /><br />
            — <strong>Acesso:</strong> consultar os dados que temos sobre você;<br />
            — <strong>Correção:</strong> atualizar dados incorretos ou desatualizados;<br />
            — <strong>Eliminação:</strong> solicitar a exclusão dos seus dados pessoais, observados os prazos legais de retenção;<br />
            — <strong>Portabilidade:</strong> receber os seus dados em formato estruturado;<br />
            — <strong>Informação:</strong> ser informado sobre com quem seus dados são compartilhados;<br />
            — <strong>Oposição:</strong> opor-se ao tratamento realizado em desconformidade com a LGPD.<br /><br />
            Para exercer esses direitos, entre em contato com nosso Encarregado de Dados (DPO) pelo e-mail <strong>moveacre.suporte@gmail.com</strong>, com o assunto "LGPD — [Direito Solicitado]". Responderemos em até <strong>15 dias corridos</strong>.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">8. Encarregado de Dados (DPO)</div>
          <p className="pv-text">
            Nos termos do Art. 41 da LGPD e da Resolução CD/ANPD nº 2/2022, o MOVEACRE designa como canal oficial de comunicação para assuntos relacionados à proteção de dados:<br /><br />
            <strong>Encarregado de Dados (DPO) — MOVEACRE</strong><br />
            E-mail: <strong>moveacre.suporte@gmail.com</strong><br />
            Assunto: "DPO — MOVEACRE"<br />
            Rio Branco, Acre, Brasil
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">9. Retenção de Dados</div>
          <p className="pv-text">
            Os dados são mantidos enquanto a conta estiver ativa e enquanto forem necessários para as finalidades descritas nesta política. Após a desativação da conta:<br /><br />
            — <strong>Logs de acesso</strong> são retidos por <strong>6 meses</strong>, conforme obrigação do Art. 15 do Marco Civil da Internet (Lei nº 12.965/2014);<br />
            — <strong>Dados cadastrais básicos</strong> (nome, email, tipo sanguíneo) são retidos por até <strong>12 meses</strong> para fins de defesa em eventuais processos administrativos;<br />
            — <strong>Laudos médicos e atestados</strong> são <strong>excluídos imediatamente</strong> após a desativação da conta ou, no máximo, em <strong>30 dias</strong>. Não há justificativa legal para retenção prolongada desses documentos após o encerramento da relação;<br />
            — Findo o prazo aplicável, os dados são eliminados permanentemente, salvo obrigação legal expressa em contrário.<br /><br />
            Encerrada a finalidade do tratamento e não havendo obrigação legal de retenção, os dados são excluídos imediatamente.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">10. Cookies</div>
          <p className="pv-text">
            A plataforma utiliza cookies técnicos essenciais para o funcionamento da autenticação e sessão do usuário. Não utilizamos cookies de rastreamento ou publicidade.
          </p>
        </div>

        <div className="pv-section">
          <div className="pv-section-title">11. Contato</div>
          <p className="pv-text">
            Para questões relacionadas à privacidade e proteção de dados:<br /><br />
            <strong>MOVEACRE</strong><br />
            Rio Branco, Acre, Brasil<br />
            E-mail: <strong>moveacre.suporte@gmail.com</strong>
          </p>
        </div>

        <hr className="pv-divider" />

        <p className="pv-text" style={{ fontSize: 12 }}>
          Esta política pode ser atualizada periodicamente. Recomendamos a consulta regular desta página. Alterações relevantes serão comunicadas por e-mail aos usuários cadastrados.
        </p>
      </div>

      <footer className="pv-footer">
        <span className="pv-footer-copy">© 2026 MOVEACRE — Rio Branco, Acre, Brasil</span>
        <Link to="/termos" className="pv-footer-link">Termos e Condições</Link>
      </footer>
    </div>
  );
}
