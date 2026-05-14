import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .tc-root { background: #0A0A0A; color: #F5F5F0; font-family: 'Barlow', sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
  .tc-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid #111; }
  .tc-back { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #555; text-decoration: none; }
  .tc-back:hover { color: #C8F500; }
  .tc-content { flex: 1; max-width: 760px; width: 100%; margin: 0 auto; padding: 64px 40px; }
  .tc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #C8F500; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; }
  .tc-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: clamp(36px, 6vw, 64px); line-height: 0.95; text-transform: uppercase; color: #F5F5F0; margin-bottom: 8px; }
  .tc-title span { color: #C8F500; }
  .tc-date { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; margin-bottom: 48px; }
  .tc-section { margin-bottom: 40px; }
  .tc-section-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 20px; text-transform: uppercase; color: #C8F500; margin-bottom: 12px; letter-spacing: 0.03em; }
  .tc-text { font-size: 14px; color: #777; line-height: 1.8; }
  .tc-text strong { color: #F5F5F0; font-weight: 500; }
  .tc-alert { font-size: 13px; color: #999; line-height: 1.8; background: #111; border-left: 3px solid #C8F500; padding: 16px 20px; margin-top: 12px; }
  .tc-alert strong { color: #C8F500; }
  .tc-divider { border: none; border-top: 1px solid #111; margin: 40px 0; }
  .tc-footer { padding: 20px 40px; border-top: 1px solid #111; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .tc-footer-copy { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #333; }
  .tc-footer-link { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; text-decoration: none; }
  .tc-footer-link:hover { color: #C8F500; }
  @media (max-width: 600px) {
    .tc-nav { padding: 14px 20px; }
    .tc-content { padding: 40px 20px; }
    .tc-footer { padding: 16px 20px; }
  }
`;

export default function Termos() {
  return (
    <div className="tc-root">
      <style>{styles}</style>
      <nav className="tc-nav">
        <Logo />
        <Link to="/" className="tc-back">← VOLTAR</Link>
      </nav>

      <div className="tc-content">
        <div className="tc-eyebrow">// LEGAL</div>
        <h1 className="tc-title">Termos e<br /><span>Condições</span></h1>
        <p className="tc-date">Última atualização: maio de 2026</p>

        <div className="tc-section">
          <div className="tc-section-title">1. Aceitação dos Termos</div>
          <p className="tc-text">
            Ao acessar e utilizar a plataforma MOVEACRE, disponível em <strong>moveacre.com.br</strong>, o usuário declara ter lido, compreendido e aceito integralmente os presentes Termos e Condições de Uso. Caso não concorde com qualquer disposição, deverá abster-se de utilizar a plataforma.<br /><br />
            O uso continuado da plataforma após eventuais alterações nestes Termos constitui aceitação das novas condições. Alterações relevantes serão comunicadas por e-mail com antecedência mínima de 10 dias.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">2. Descrição do Serviço</div>
          <p className="tc-text">
            O MOVEACRE é uma plataforma digital <strong>gratuita e sem fins lucrativos</strong> de intermediação entre doadores voluntários de sangue e pessoas que necessitam de doação no estado do Acre, Brasil. A plataforma <strong>não substitui</strong> os serviços do Hemoacre ou de qualquer hemocentro, hospital ou serviço de saúde oficial.<br /><br />
            O MOVEACRE atua exclusivamente como canal de comunicação e organização, <strong>sem qualquer vínculo institucional com o sistema público ou privado de saúde</strong>. Não garantimos a efetivação de doações — a decisão de doar é sempre voluntária e exclusiva do doador. Por ser um projeto social sem fins lucrativos, não há garantia de nível de serviço (SLA) ou suporte técnico contínuo.<br /><br />
            O projeto pode ser descontinuado a qualquer momento. Em caso de encerramento definitivo, os usuários serão notificados com antecedência mínima de 30 dias e todos os dados pessoais serão eliminados conforme nossa Política de Privacidade.
          </p>
          <div className="tc-alert">
            <strong>AVISO IMPORTANTE:</strong> O MOVEACRE não é um dispositivo médico, serviço de emergência ou substituto para o atendimento hospitalar. Em situações de emergência médica, ligue imediatamente para o <strong>SAMU (192)</strong> ou dirija-se ao pronto-socorro mais próximo. Nunca tome decisões médicas baseadas exclusivamente nas informações desta plataforma.
          </div>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">3. Cadastro e Conta</div>
          <p className="tc-text">
            Para utilizar as funcionalidades da plataforma, o usuário deve criar uma conta com informações verdadeiras, completas e atualizadas. O usuário é responsável pela confidencialidade das suas credenciais de acesso e por todas as atividades realizadas na sua conta.<br /><br />
            O MOVEACRE reserva-se o direito de suspender ou encerrar contas que violem estes Termos. Nos casos abaixo, a suspensão pode ocorrer sem aviso prévio:<br /><br />
            — Criação de pedidos de urgência falsos ou com informações sabidamente incorretas;<br />
            — Tentativa de acesso não autorizado a dados de outros usuários;<br />
            — Uso da plataforma para fins fraudulentos ou que causem dano a terceiros;<br />
            — Comportamento que comprometa a segurança ou integridade da plataforma.<br /><br />
            Nos demais casos de violação, o usuário será notificado por e-mail com prazo mínimo de 48 horas para manifestação antes da suspensão definitiva.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">4. Dados de Saúde e LGPD</div>
          <p className="tc-text">
            O MOVEACRE trata dados sensíveis de saúde (tipo sanguíneo, histórico de doações, laudos médicos) com base no <strong>consentimento específico, livre, informado e destacado</strong> do usuário, coletado por checkbox separado da aceitação geral destes Termos, em conformidade com o Art. 11 da <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.<br /><br />
            O tratamento desses dados é realizado exclusivamente para as finalidades descritas na nossa <Link to="/privacidade" style={{ color: '#C8F500' }}>Política de Privacidade</Link>. O usuário pode consultar, corrigir ou solicitar a exclusão dos seus dados a qualquer momento pelo e-mail <strong>moveacre.suporte@gmail.com</strong> — canal monitorado exclusivamente para assuntos de privacidade e proteção de dados, com resposta em até 15 dias corridos.<br /><br />
            <strong>Medidas de segurança técnica implementadas:</strong> autenticação via JWT com verificação de assinatura criptográfica (RS256), criptografia em trânsito (TLS/HTTPS) e em repouso (AES-256), controle de acesso por objeto (cada usuário acessa apenas seus próprios dados) e validação de entrada em todas as rotas da API. Em caso de incidente de segurança com risco relevante aos titulares, comunicaremos a ocorrência à ANPD e aos usuários afetados em até 72 horas.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">5. Responsabilidades do Usuário</div>
          <p className="tc-text">
            O usuário compromete-se a:<br /><br />
            — Fornecer informações verídicas sobre o seu estado de saúde e elegibilidade para doação;<br />
            — Não utilizar a plataforma para fins fraudulentos, ilegais ou que causem dano a terceiros;<br />
            — Respeitar os critérios médicos de doação estabelecidos pelo Ministério da Saúde do Brasil (consulte a <a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/sangue-e-hemoderivados" target="_blank" rel="noopener noreferrer" style={{ color: '#C8F500' }}>portaria vigente</a> e as orientações do <a href="https://hemoacre.ac.gov.br" target="_blank" rel="noopener noreferrer" style={{ color: '#C8F500' }}>Hemoacre</a>);<br />
            — Não criar pedidos de urgência falsos ou com informações incorretas — tal conduta pode configurar crime nos termos do Art. 171 do Código Penal Brasileiro;<br />
            — Manter os seus dados de perfil atualizados;<br />
            — Não tentar acessar áreas restritas da plataforma ou comprometer sua segurança.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">6. Moderação de Conteúdo</div>
          <p className="tc-text">
            O MOVEACRE pode remover, sem aviso prévio, qualquer pedido de urgência ou conteúdo que:<br /><br />
            — Contenha informações falsas ou enganosas;<br />
            — Viole estes Termos ou a legislação brasileira;<br />
            — Represente risco à segurança de outros usuários.<br /><br />
            Para denunciar conteúdo suspeito ou abusivo, entre em contato pelo e-mail <strong>moveacre.suporte@gmail.com</strong> com o assunto "Denúncia — [descrição breve]". Analisaremos o relato em até 72 horas.<br /><br />
            Nos termos do Art. 15 do <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong>, o MOVEACRE mantém registros de acesso à aplicação pelo prazo de <strong>6 meses</strong>, podendo fornecê-los mediante ordem judicial.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">7. Limitação de Responsabilidade</div>
          <p className="tc-text">
            O MOVEACRE não se responsabiliza por:<br /><br />
            — Decisões médicas tomadas com base nas informações da plataforma — a plataforma não valida clinicamente nenhuma informação de saúde fornecida pelos usuários;<br />
            — A efetivação ou não de doações de sangue;<br />
            — Informações incorretas, desatualizadas ou fraudulentas fornecidas por usuários;<br />
            — Indisponibilidade temporária da plataforma por razões técnicas ou de manutenção;<br />
            — Danos decorrentes do uso indevido da plataforma em desacordo com estes Termos.<br /><br />
            A responsabilidade civil do MOVEACRE, quando aplicável, limita-se ao disposto no Marco Civil da Internet e na LGPD. Cláusulas de exclusão de responsabilidade não se aplicam em casos de dolo ou culpa grave comprovados.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">8. Propriedade Intelectual</div>
          <p className="tc-text">
            O design, os textos, o código-fonte e o logotipo da plataforma MOVEACRE são de autoria dos seus criadores e protegidos pela <strong>Lei de Direitos Autorais (Lei nº 9.610/1998)</strong> e pela <strong>Lei de Software (Lei nº 9.609/1998)</strong>, independentemente de registro formal.<br /><br />
            É proibida a reprodução, distribuição ou utilização sem autorização prévia e expressa dos titulares.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">9. Modificações</div>
          <p className="tc-text">
            O MOVEACRE reserva-se o direito de alterar estes Termos a qualquer momento. Alterações relevantes serão comunicadas por e-mail com antecedência mínima de 10 dias. O uso continuado da plataforma após esse prazo constitui aceitação dos novos termos.
          </p>
        </div>

        <div className="tc-section">
          <div className="tc-section-title">10. Lei Aplicável e Foro</div>
          <p className="tc-text">
            Estes Termos são regidos pela legislação brasileira, em especial pela LGPD, pelo Marco Civil da Internet e pelo Código de Defesa do Consumidor, aplicável na medida em que a relação entre o usuário e o MOVEACRE se enquadre como relação de consumo nos termos da Lei nº 8.078/1990.<br /><br />
            Para resolução de conflitos, fica eleito o foro da comarca de <strong>Rio Branco, Acre, Brasil</strong>. Contudo, nos termos do Art. 101, I do CDC, o consumidor pode optar pelo foro do seu domicílio quando aplicável. Nenhuma disposição destes Termos afasta o direito do usuário de acionar os Juizados Especiais Cíveis da sua comarca.
          </p>
        </div>

        <hr className="tc-divider" />

        <p className="tc-text" style={{ fontSize: 12 }}>
          Dúvidas? Entre em contato: <strong>moveacre.suporte@gmail.com</strong>
        </p>
      </div>

      <footer className="tc-footer">
        <span className="tc-footer-copy">© 2026 MOVEACRE — Rio Branco, Acre, Brasil</span>
        <Link to="/privacidade" className="tc-footer-link">Política de Privacidade</Link>
      </footer>
    </div>
  );
}
