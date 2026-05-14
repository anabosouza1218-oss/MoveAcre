import { useState } from "react";
import { Link } from "react-router-dom";
import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import Logo from "../components/Logo";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cr-root {
    background: #0A0A0A;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .cr-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
    height: 64px;
    background: rgba(10,10,10,0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #1a1a1a;
  }

  .cr-nav-left { display: flex; align-items: center; gap: 40px; }
  .cr-nav-links { display: flex; align-items: center; gap: 4px; }

  .cr-nav-link {
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    text-decoration: none;
    padding: 6px 12px;
    letter-spacing: 0.02em;
    transition: color 0.15s;
  }

  .cr-nav-link:hover { color: #F5F5F0; }
  .cr-nav-link-active { color: #C8F500 !important; }

  .cr-nav-right { display: flex; align-items: center; gap: 10px; }

  .cr-btn-nav-enter {
    background: transparent;
    color: #777;
    border: 1px solid #252525;
    padding: 8px 18px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: all 0.15s;
  }

  .cr-btn-nav-enter:hover { border-color: #444; color: #F5F5F0; opacity: 1; }

  .cr-btn-nav-cta {
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 9px 20px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
  }

  .cr-btn-nav-cta:hover { background: #d4ff00; opacity: 1; transform: none; }

  /* PAGE HEADER */
  .cr-header {
    border-bottom: 1px solid #111;
    padding: 64px 40px 56px;
    max-width: 920px;
    width: 100%;
    margin: 0 auto;
  }

  .cr-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #C8F500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .cr-eyebrow::before {
    content: '';
    display: block;
    width: 28px;
    height: 1px;
    background: #C8F500;
  }

  .cr-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(44px, 7vw, 80px);
    line-height: 0.92;
    text-transform: uppercase;
    color: #F5F5F0;
    margin-bottom: 24px;
    letter-spacing: -0.01em;
  }

  .cr-title span { color: #C8F500; }

  .cr-subtitle {
    font-size: 16px;
    color: #666;
    line-height: 1.7;
    max-width: 520px;
    font-weight: 400;
  }

  /* CONTENT */
  .cr-content {
    flex: 1;
    width: 100%;
    max-width: 920px;
    margin: 0 auto;
    padding: 0 40px 80px;
  }

  /* SECTION BLOCKS */
  .cr-block {
    padding: 56px 0;
    border-bottom: 1px solid #111;
  }

  .cr-block:last-child { border-bottom: none; }

  .cr-block-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  .cr-block-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #333;
    letter-spacing: 0.1em;
    min-width: 28px;
  }

  .cr-block-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 24px;
    text-transform: uppercase;
    color: #F5F5F0;
    letter-spacing: 0.03em;
    flex: 1;
  }

  .cr-block-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
    border: 1px solid;
  }

  .cr-badge-ok { color: #C8F500; border-color: rgba(200,245,0,0.3); background: rgba(200,245,0,0.05); }
  .cr-badge-warn { color: #F5A623; border-color: rgba(245,166,35,0.3); background: rgba(245,166,35,0.05); }
  .cr-badge-no { color: #FF4444; border-color: rgba(255,68,68,0.3); background: rgba(255,68,68,0.05); }

  /* ITEM CARDS */
  .cr-cards { display: flex; flex-direction: column; gap: 2px; }

  .cr-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 18px 20px;
    background: #0D0D0D;
    border-left: 3px solid transparent;
    transition: background 0.15s;
  }

  .cr-card:hover { background: #0f0f0f; }
  .cr-card-ok { border-left-color: #C8F500; }
  .cr-card-warn { border-left-color: #F5A623; }
  .cr-card-no { border-left-color: #FF4444; }

  .cr-card-icon {
    font-size: 13px;
    flex-shrink: 0;
    margin-top: 2px;
    width: 16px;
    text-align: center;
  }

  .cr-card-icon-ok { color: #C8F500; }
  .cr-card-icon-warn { color: #F5A623; }
  .cr-card-icon-no { color: #FF4444; }

  .cr-card-text {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    color: #888;
    line-height: 1.65;
  }

  .cr-card-text strong { color: #D0D0C8; font-weight: 600; }

  /* INTERVALS */
  .cr-intervals {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
  }

  .cr-interval-card {
    background: #0D0D0D;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-left: 3px solid #C8F500;
  }

  .cr-interval-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .cr-interval-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 48px;
    font-weight: 900;
    color: #C8F500;
    line-height: 1;
  }

  .cr-interval-desc {
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    color: #555;
    line-height: 1.5;
  }

  /* NOTE */
  .cr-note {
    margin-top: 12px;
    padding: 14px 18px;
    background: #0D0D0D;
    border-left: 2px solid #222;
  }

  .cr-note-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #555;
    line-height: 1.7;
    letter-spacing: 0.02em;
  }

  .cr-note-text strong { color: #666; }

  /* ALERT */
  .cr-alert {
    background: rgba(255,68,68,0.04);
    border: 1px solid rgba(255,68,68,0.15);
    border-left: 4px solid #FF4444;
    padding: 24px 28px;
  }

  .cr-alert-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
    color: #FF4444;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
  }

  .cr-alert-text {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    color: #777;
    line-height: 1.7;
  }

  .cr-alert-text strong { color: #D0D0C8; font-weight: 600; }

  /* INFOBOX */
  .cr-infobox {
    background: #0D0D0D;
    border-left: 4px solid #C8F500;
    padding: 24px 28px;
  }

  .cr-infobox-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
    color: #C8F500;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
  }

  .cr-infobox-text {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    color: #666;
    line-height: 1.7;
  }

  .cr-infobox-text strong { color: #D0D0C8; font-weight: 600; }

  /* CTA */
  .cr-cta {
    text-align: center;
    padding: 64px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .cr-cta-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #444;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .cr-cta-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(32px, 5vw, 52px);
    text-transform: uppercase;
    color: #F5F5F0;
    line-height: 0.95;
  }

  .cr-cta-sub {
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    color: #555;
    margin-bottom: 8px;
  }

  .cr-btn-primary {
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 18px 48px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 18px;
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.06em;
    transition: 0.15s;
  }

  .cr-btn-primary:hover { background: #d4ff00; transform: translateY(-1px); opacity: 1; }

  /* FOOTER */
  .cr-footer {
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #111;
    flex-wrap: wrap;
    gap: 12px;
  }

  .cr-footer-copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #2e2e2e;
    letter-spacing: 0.05em;
  }

  .cr-footer-links { display: flex; gap: 20px; }

  .cr-footer-link {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #3a3a3a;
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: color 0.2s;
  }

  .cr-footer-link:hover { color: #C8F500; }

  /* HAMBURGER */
  .cr-hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .cr-hamburger span { display: block; width: 22px; height: 2px; background: #F5F5F0; }

  .cr-mobile-menu {
    background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a;
    display: flex;
    flex-direction: column;
  }

  .cr-mobile-link {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #777;
    text-decoration: none;
    padding: 16px 24px;
    border-bottom: 1px solid #111;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
    display: block;
  }

  .cr-mobile-cta {
    margin: 16px 24px;
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 14px 20px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 15px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    width: calc(100% - 48px);
    text-align: center;
    display: block;
  }

  @media (max-width: 768px) {
    .cr-nav { padding: 0 20px; }
    .cr-nav-links { display: none; }
    .cr-nav-right { display: none; }
    .cr-hamburger { display: flex; }
    .cr-header { padding: 48px 24px 40px; }
    .cr-content { padding: 0 24px 60px; }
    .cr-intervals { grid-template-columns: 1fr; }
    .cr-footer { padding: 20px 24px; flex-direction: column; align-items: flex-start; }
    .cr-block { padding: 40px 0; }
    .cr-block-header { flex-wrap: wrap; gap: 10px; }
  }

  @media (min-width: 769px) {
    .cr-hamburger { display: none !important; }
    .cr-mobile-menu { display: none !important; }
  }
`;

export default function Criterios() {
  const { isSignedIn } = useUser();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="cr-root">
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="cr-nav">
        <div className="cr-nav-left">
          <Logo />
          <div className="cr-nav-links">
            <Link to="/criterios" className="cr-nav-link cr-nav-link-active">Quem pode doar</Link>
            <Link to="/#sobre" className="cr-nav-link" onClick={() => { setTimeout(() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Sobre nós</Link>
          </div>
        </div>

        <div className="cr-nav-right">
          {isSignedIn ? (
            <Link to="/" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#C8F500', textDecoration: 'none', fontWeight: 500 }}>
              Meu painel →
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="cr-btn-nav-enter">Entrar</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="cr-btn-nav-cta">Criar Conta</button>
              </SignUpButton>
            </>
          )}
        </div>

        <button className="cr-hamburger" onClick={() => setMenuAberto(m => !m)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {menuAberto && (
        <div className="cr-mobile-menu">
          <Link to="/criterios" className="cr-mobile-link" onClick={() => setMenuAberto(false)}>Quem pode doar</Link>
          <Link to="/#sobre" className="cr-mobile-link" onClick={() => { setMenuAberto(false); setTimeout(() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }), 200); }}>Sobre nós</Link>
          {!isSignedIn && (
            <SignUpButton mode="modal">
              <button className="cr-mobile-cta" onClick={() => setMenuAberto(false)}>Criar Conta</button>
            </SignUpButton>
          )}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="cr-header">
        <div className="cr-eyebrow">Critérios de Doação</div>
        <h1 className="cr-title">
          Quem pode<br />
          <span>ser doador?</span>
        </h1>
        <p className="cr-subtitle">
          A doação é simples, mas existem critérios que protegem você e quem vai receber.
          Verifique abaixo — leva menos de 2 minutos.
        </p>
      </div>

      {/* CONTENT */}
      <div className="cr-content">

        {/* 01 REQUISITOS BÁSICOS */}
        <div className="cr-block">
          <div className="cr-block-header">
            <span className="cr-block-num">01</span>
            <span className="cr-block-title">Requisitos básicos</span>
            <span className="cr-block-badge cr-badge-ok">Necessários</span>
          </div>
          <div className="cr-cards">
            {[
              { label: "Idade", text: "Entre 16 e 69 anos. Menores de 18 precisam do responsável. A partir dos 60, só se a primeira doação foi antes dessa idade." },
              { label: "Peso", text: "Acima de 50 kg." },
              { label: "Saúde geral", text: "Estar se sentindo bem no dia da doação." },
              { label: "Alimentação", text: "Ter se alimentado — evitar gordurosos nas 3 horas antes da doação." },
              { label: "Sono", text: "Ter dormido pelo menos 6 horas nas últimas 24 horas." },
              { label: "Documento", text: "RG, CNH, Carteira de Trabalho ou e-Título com foto — emitido por órgão oficial." },
            ].map((item, i) => (
              <div className="cr-card cr-card-ok" key={i}>
                <span className="cr-card-icon cr-card-icon-ok">▸</span>
                <p className="cr-card-text"><strong>{item.label}:</strong> {item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 02 INTERVALOS */}
        <div className="cr-block">
          <div className="cr-block-header">
            <span className="cr-block-num">02</span>
            <span className="cr-block-title">Intervalo entre doações</span>
            <span className="cr-block-badge cr-badge-ok">Recorrência</span>
          </div>
          <div className="cr-intervals">
            <div className="cr-interval-card">
              <span className="cr-interval-label">Homens</span>
              <span className="cr-interval-value">2 meses</span>
              <span className="cr-interval-desc">Máximo de 4 doações por ano</span>
            </div>
            <div className="cr-interval-card">
              <span className="cr-interval-label">Mulheres</span>
              <span className="cr-interval-value">3 meses</span>
              <span className="cr-interval-desc">Máximo de 3 doações por ano</span>
            </div>
          </div>
          <div className="cr-note">
            <p className="cr-note-text">
              O MOVEACRE rastreia seu histórico e avisa automaticamente quando você estiver apto para doar de novo.
            </p>
          </div>
        </div>

        {/* 03 IMPEDIMENTOS TEMPORÁRIOS */}
        <div className="cr-block">
          <div className="cr-block-header">
            <span className="cr-block-num">03</span>
            <span className="cr-block-title">Impedimentos temporários</span>
            <span className="cr-block-badge cr-badge-warn">Aguardar período</span>
          </div>
          <div className="cr-cards">
            {[
              <><strong>Gripe, resfriado ou coriza:</strong> aguardar 14 dias após o fim dos sintomas.</>,
              <><strong>Febre:</strong> aguardar 30 dias após normalizar.</>,
              <><strong>Gravidez ou suspeita:</strong> aguardar — e até 12 meses após o fim da amamentação.</>,
              <><strong>Parto:</strong> 90 dias após parto normal · 180 dias após cesariana.</>,
              <><strong>Tatuagem ou piercing:</strong> 6 meses. Piercing na boca ou região genital: 12 meses após retirada.</>,
              <><strong>Bebida alcoólica:</strong> aguardar 12 horas.</>,
              <><strong>Extração dentária:</strong> aguardar 72 horas.</>,
              <><strong>Cirurgias simples</strong> (apêndice, hérnia, amígdalas, varizes): aguardar 3 meses.</>,
              <><strong>Cirurgias maiores</strong> (vesícula, útero, rins, tireoide): aguardar 6 meses.</>,
              <><strong>Transfusão de sangue:</strong> aguardar 12 meses.</>,
              <><strong>Vacinação:</strong> o prazo varia conforme o tipo — consulte o Hemoacre.</>,
              <><strong>Endoscopia:</strong> aguardar 6 meses.</>,
              <><strong>Risco para ISTs:</strong> aguardar 12 meses após a exposição.</>,
            ].map((text, i) => (
              <div className="cr-card cr-card-warn" key={i}>
                <span className="cr-card-icon cr-card-icon-warn">◦</span>
                <p className="cr-card-text">{text}</p>
              </div>
            ))}
          </div>
          <div className="cr-note">
            <p className="cr-note-text">
              <strong>Vacinas COVID-19:</strong>{" "}
              Coronavac: 48h · AstraZeneca: 7 dias · Pfizer: 7 dias · Janssen: 7 dias
            </p>
          </div>
        </div>

        {/* 04 IMPEDIMENTOS DEFINITIVOS */}
        <div className="cr-block">
          <div className="cr-block-header">
            <span className="cr-block-num">04</span>
            <span className="cr-block-title">Impedimentos definitivos</span>
            <span className="cr-block-badge cr-badge-no">Permanentes</span>
          </div>
          <div className="cr-cards">
            {[
              <><strong>Hepatite</strong> após os 11 anos de idade.</>,
              <><strong>Hepatite B ou C, HIV/AIDS, HTLV I/II, Doença de Chagas</strong> — evidência clínica ou laboratorial.</>,
              <><strong>Uso de drogas ilícitas injetáveis.</strong></>,
            ].map((text, i) => (
              <div className="cr-card cr-card-no" key={i}>
                <span className="cr-card-icon cr-card-icon-no">✕</span>
                <p className="cr-card-text">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 05 INFOS COMPLEMENTARES */}
        <div className="cr-block" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="cr-block-header" style={{ marginBottom: 20 }}>
            <span className="cr-block-num">05</span>
            <span className="cr-block-title">Informações importantes</span>
          </div>
          <div className="cr-alert">
            <div className="cr-alert-title">Sempre consulte o Hemoacre</div>
            <p className="cr-alert-text">
              Esta página lista os critérios gerais do Ministério da Saúde.
              Situações específicas são avaliadas individualmente na triagem presencial.
              Dúvidas? Ligue: <strong>(68) 3248-1380</strong>.
            </p>
          </div>
          <div className="cr-infobox">
            <div className="cr-infobox-title">Onde doar em Rio Branco</div>
            <p className="cr-infobox-text">
              <strong>Hemoacre — Hemocentro do Acre</strong><br />
              Av. Getúlio Vargas, 2787 — Bosque, Rio Branco, AC — CEP 69900-607<br />
              (68) 3248-1380 · Segunda a sábado, das 7h às 17h.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="cr-cta">
          <p className="cr-cta-eyebrow">Pronto para começar?</p>
          <h2 className="cr-cta-title">Você se encaixa.<br />Sai da plateia.</h2>
          <p className="cr-cta-sub">Cadastre-se no MOVEACRE e comece a fazer diferença.</p>
          {isSignedIn ? (
            <Link to="/" style={{ display: "inline-block" }}>
              <button className="cr-btn-primary">Ir para meu painel</button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="cr-btn-primary">Quero ser doador</button>
            </SignInButton>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="cr-footer">
        <span className="cr-footer-copy">© 2026 MOVEACRE — Rio Branco, Acre, Brasil</span>
        <div className="cr-footer-links">
          <Link to="/criterios" className="cr-footer-link">Critérios</Link>
          <Link to="/#sobre" className="cr-footer-link">Sobre nós</Link>
          <Link to="/termos" className="cr-footer-link">Termos</Link>
          <Link to="/privacidade" className="cr-footer-link">Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}
