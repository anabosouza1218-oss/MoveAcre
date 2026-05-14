import { useState } from "react";
import { Link } from "react-router-dom";
import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import Logo from "../components/Logo";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sb-root {
    background: #0A0A0A;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .sb-nav {
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

  .sb-nav-left { display: flex; align-items: center; gap: 40px; }
  .sb-nav-links { display: flex; align-items: center; gap: 4px; }

  .sb-nav-link {
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    text-decoration: none;
    padding: 6px 12px;
    letter-spacing: 0.02em;
    transition: color 0.15s;
  }

  .sb-nav-link:hover { color: #F5F5F0; }
  .sb-nav-link-active { color: #C8F500 !important; }

  .sb-nav-right { display: flex; align-items: center; gap: 10px; }

  .sb-btn-nav-enter {
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

  .sb-btn-nav-enter:hover { border-color: #444; color: #F5F5F0; opacity: 1; }

  .sb-btn-nav-cta {
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

  .sb-btn-nav-cta:hover { background: #d4ff00; opacity: 1; transform: none; }

  /* PAGE HEADER */
  .sb-header {
    border-bottom: 1px solid #111;
    padding: 64px 40px 56px;
    max-width: 920px;
    width: 100%;
    margin: 0 auto;
  }

  .sb-eyebrow {
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

  .sb-eyebrow::before {
    content: '';
    display: block;
    width: 28px;
    height: 1px;
    background: #C8F500;
  }

  .sb-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(44px, 7vw, 80px);
    line-height: 0.92;
    text-transform: uppercase;
    color: #F5F5F0;
    margin-bottom: 24px;
    letter-spacing: -0.01em;
  }

  .sb-title span { color: #C8F500; }

  .sb-subtitle {
    font-size: 16px;
    color: #666;
    line-height: 1.7;
    max-width: 560px;
    font-weight: 400;
  }

  /* CONTENT */
  .sb-content {
    flex: 1;
    width: 100%;
    max-width: 920px;
    margin: 0 auto;
    padding: 0 40px 80px;
  }

  /* BLOCKS */
  .sb-block {
    padding: 56px 0;
    border-bottom: 1px solid #111;
  }

  .sb-block:last-child { border-bottom: none; }

  .sb-block-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #444;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #111;
  }

  /* PROPÓSITO */
  .sb-proposito {
    background: #0D0D0D;
    border-left: 4px solid #C8F500;
    padding: 36px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sb-proposito-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 28px;
    text-transform: uppercase;
    color: #C8F500;
    letter-spacing: 0.02em;
  }

  .sb-proposito-text {
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    color: #777;
    line-height: 1.75;
    max-width: 600px;
  }

  .sb-proposito-text strong { color: #D0D0C8; font-weight: 600; }

  /* QUOTE */
  .sb-quote {
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sb-quote-mark {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 80px;
    color: #1a1a1a;
    line-height: 0.6;
    user-select: none;
  }

  .sb-quote-text {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: clamp(24px, 4vw, 36px);
    color: #F5F5F0;
    line-height: 1.15;
    text-transform: uppercase;
    max-width: 640px;
  }

  .sb-quote-author {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #444;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* TEAM */
  .sb-team {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2px;
  }

  .sb-member {
    background: #0D0D0D;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-left: 3px solid #1a1a1a;
    transition: border-color 0.15s;
  }

  .sb-member:hover { border-left-color: #C8F500; }

  .sb-member-role {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #C8F500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .sb-member-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 22px;
    text-transform: uppercase;
    color: #F5F5F0;
    letter-spacing: 0.02em;
  }


  /* MANIFESTO HIGHLIGHTS */
  .sb-manifesto-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
  }

  .sb-manifesto-item {
    background: #0D0D0D;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sb-manifesto-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #333;
    letter-spacing: 0.1em;
  }

  .sb-manifesto-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    color: #C8F500;
    letter-spacing: 0.03em;
  }

  .sb-manifesto-desc {
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    color: #666;
    line-height: 1.65;
  }

  /* CTA */
  .sb-cta {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .sb-cta-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(28px, 4vw, 44px);
    text-transform: uppercase;
    color: #F5F5F0;
    line-height: 0.95;
  }

  .sb-cta-sub {
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    color: #555;
    max-width: 400px;
    line-height: 1.6;
  }

  .sb-btn-primary {
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 18px 44px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 18px;
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.06em;
    transition: 0.15s;
    margin-top: 8px;
  }

  .sb-btn-primary:hover { background: #d4ff00; transform: translateY(-1px); opacity: 1; }

  /* FOOTER */
  .sb-footer {
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #111;
    flex-wrap: wrap;
    gap: 12px;
  }

  .sb-footer-copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #2e2e2e;
    letter-spacing: 0.05em;
  }

  .sb-footer-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: #C8F500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* HAMBURGER */
  .sb-hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .sb-hamburger span { display: block; width: 22px; height: 2px; background: #F5F5F0; }

  .sb-mobile-menu {
    background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a;
    display: flex;
    flex-direction: column;
  }

  .sb-mobile-link {
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

  .sb-mobile-cta {
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
    .sb-nav { padding: 0 20px; }
    .sb-nav-links { display: none; }
    .sb-nav-right { display: none; }
    .sb-hamburger { display: flex; }
    .sb-header { padding: 48px 24px 40px; }
    .sb-content { padding: 0 24px 60px; }
    .sb-manifesto-grid { grid-template-columns: 1fr; }
    .sb-footer { padding: 20px 24px; flex-direction: column; align-items: flex-start; }
    .sb-block { padding: 40px 0; }
  }

  @media (min-width: 769px) {
    .sb-hamburger { display: none !important; }
    .sb-mobile-menu { display: none !important; }
  }
`;

const equipa = [
  { role: "Desenvolvimento", name: "Kelvin Lieberman" },
  { role: "Desenvolvimento", name: "Julio Souza" },
  { role: "Desenvolvimento", name: "Tomas Souza" },
];


export default function Sobre() {
  const { isSignedIn } = useUser();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="sb-root">
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="sb-nav">
        <div className="sb-nav-left">
          <Logo />
          <div className="sb-nav-links">
            <Link to="/criterios" className="sb-nav-link">Quem pode doar</Link>
            <Link to="/sobre" className="sb-nav-link sb-nav-link-active">Sobre nós</Link>
          </div>
        </div>

        <div className="sb-nav-right">
          {isSignedIn ? (
            <Link to="/" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#C8F500', textDecoration: 'none', fontWeight: 500 }}>
              Meu painel →
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="sb-btn-nav-enter">Entrar</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="sb-btn-nav-cta">Criar Conta</button>
              </SignUpButton>
            </>
          )}
        </div>

        <button className="sb-hamburger" onClick={() => setMenuAberto(m => !m)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {menuAberto && (
        <div className="sb-mobile-menu">
          <Link to="/criterios" className="sb-mobile-link" onClick={() => setMenuAberto(false)}>Quem pode doar</Link>
          <Link to="/sobre" className="sb-mobile-link" onClick={() => setMenuAberto(false)}>Sobre nós</Link>
          {!isSignedIn && (
            <SignUpButton mode="modal">
              <button className="sb-mobile-cta" onClick={() => setMenuAberto(false)}>Criar Conta</button>
            </SignUpButton>
          )}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="sb-header">
        <div className="sb-eyebrow">Quem somos</div>
        <h1 className="sb-title">
          Feito no <span>Acre.</span><br />
          Para o Acre.
        </h1>
        <p className="sb-subtitle">
          Todo dia aparece um pedido de sangue no grupo da família.
          A gente compartilha, sente o aperto — e fica por isso mesmo.
          Não por falta de vontade. Por falta de um sistema que funcionasse.
          O MOVEACRE nasceu dessa indignação.
        </p>
      </div>

      {/* CONTENT */}
      <div className="sb-content">

        {/* PROPÓSITO */}
        <div className="sb-block">
          <div className="sb-proposito">
            <div className="sb-proposito-title">Nosso propósito</div>
            <p className="sb-proposito-text">
              Conectar quem precisa de sangue a quem pode ajudar —
              de forma rápida, direta e <strong>sem depender de viralização</strong>.
              O MOVEACRE organiza doadores, notifica quem é compatível
              e garante que o pedido chegue a quem pode agir.
              Porque salvar uma vida não pode depender de um post viral.
            </p>
          </div>
        </div>

        {/* QUOTE */}
        <div className="sb-block">
          <div className="sb-quote">
            <div className="sb-quote-mark">"</div>
            <p className="sb-quote-text">
              Ninguém deveria implorar por um direito que já é seu.
            </p>
            <span className="sb-quote-author">— Manifesto MOVEACRE</span>
          </div>
        </div>


        {/* EQUIPE */}
        <div className="sb-block">
          <div className="sb-block-label">// Quem fez</div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: '#555', lineHeight: 1.7, maxWidth: 560 }}>
              O MOVEACRE é um projeto de extensão universitária desenvolvido por alunos da{' '}
              <strong style={{ color: '#D0D0C8' }}>Uninorte — Centro Universitário do Norte</strong>,
              em Rio Branco, Acre. Nasceu da indignação com a falta de um sistema eficiente de
              mobilização de doadores de sangue no estado.
            </p>
          </div>
          <div className="sb-team">
            {equipa.map((m, i) => (
              <div className="sb-member" key={i}>
                <span className="sb-member-role">{m.role}</span>
                <span className="sb-member-name">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="sb-block">
          <div className="sb-cta">
            <h2 className="sb-cta-title">Sai da plateia.<br />Entra no movimento.</h2>
            <p className="sb-cta-sub">
              Cada pessoa cadastrada é uma resposta que o Acre não vai precisar implorar.
            </p>
            {isSignedIn ? (
              <Link to="/" style={{ display: "inline-block" }}>
                <button className="sb-btn-primary">Ir para meu painel</button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="sb-btn-primary">Quero ser doador</button>
              </SignUpButton>
            )}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="sb-footer">
        <span className="sb-footer-copy">© 2026 MOVEACRE — Rio Branco, Acre, Brasil</span>
        <span className="sb-footer-tag">Vamos mover o Acre.</span>
      </footer>
    </div>
  );
}
