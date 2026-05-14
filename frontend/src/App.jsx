import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import MinhasUrgencias from "./pages/MinhasUrgencias";
import CriarUrgencia from "./pages/CriarUrgencia";
import CompletarPerfil from "./pages/CompletarPerfil";
import SyncWrapper from "./components/SyncWrapper";
import DoadorDashboard from "./pages/DoadorDashboard";
import Perfil from "./pages/Perfil";
import HistoricoDoador from "./pages/HistoricoDoador";
import EditarPedido from "./pages/EditarPedido";
import EditarConta from "./pages/EditarConta";
import Criterios from "./pages/Criterios";
import Sobre from "./pages/Sobre";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import Logo from "./components/Logo";
import { useIsAdmin } from "./hooks/useIsAdmin";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ma-root {
    background: #0A0A0A;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* NAV */
  .ma-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 48px;
    height: 68px;
    background: rgba(10,10,10,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #141414;
  }
  .ma-nav-links { display: flex; align-items: center; gap: 8px; }
  .ma-nav-link {
    font-family: 'Barlow', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #555; text-decoration: none;
    padding: 6px 14px; letter-spacing: 0.02em;
    transition: color 0.15s;
  }
  .ma-nav-link:hover { color: #F5F5F0; }
  .ma-nav-right { display: flex; align-items: center; gap: 10px; }
  .ma-btn-nav-ghost {
    background: transparent; color: #666;
    border: 1px solid #222; padding: 8px 18px;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; letter-spacing: 0.02em; transition: all 0.15s;
  }
  .ma-btn-nav-ghost:hover { border-color: #444; color: #F5F5F0; }
  .ma-btn-nav-cta {
    background: #C8F500; color: #0A0A0A; border: none;
    padding: 9px 22px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
  }
  .ma-btn-nav-cta:hover { background: #d4ff00; }

  /* HERO */
  .ma-hero-wrap {
    display: grid;
    grid-template-columns: 1fr 380px;
    border-bottom: 1px solid #111;
    min-height: 600px;
  }
  .ma-hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 64px;
  }
  .ma-hero-right {
    background: #0D0D0D;
    border-left: 1px solid #111;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 40px;
    gap: 0;
  }
  .ma-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #C8F500;
    letter-spacing: 0.14em; text-transform: uppercase;
    margin-bottom: 28px;
    display: flex; align-items: center; gap: 12px;
  }
  .ma-eyebrow::before {
    content: ''; display: block;
    width: 24px; height: 1px; background: #C8F500;
  }
  .ma-headline {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(40px, 5vw, 72px);
    line-height: 0.95;
    text-transform: uppercase;
    color: #F5F5F0;
    margin-bottom: 32px;
    letter-spacing: -0.01em;
  }
  .ma-headline span { color: #C8F500; }
  .ma-manifesto {
    font-size: 15px; color: #666; line-height: 1.75;
    max-width: 480px; margin-bottom: 48px;
    border-left: 2px solid #1e1e1e; padding-left: 20px;
  }
  .ma-manifesto em { color: #C8F500; font-style: normal; font-weight: 500; }
  .ma-cta-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: stretch; margin-bottom: 56px; }
  .ma-btn-primary {
    background: #C8F500; color: #0A0A0A; border: none;
    padding: 18px 44px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900; font-size: 18px;
    text-transform: uppercase; cursor: pointer;
    letter-spacing: 0.05em; transition: 0.15s;
    flex: 1; min-width: 200px;
  }
  .ma-btn-primary:hover { background: #d4ff00; transform: translateY(-1px); }
  .ma-btn-secondary {
    background: transparent; color: #777;
    border: 1px solid #252525;
    padding: 18px 44px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 18px;
    text-transform: uppercase; cursor: pointer;
    letter-spacing: 0.05em; transition: 0.15s;
    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    flex: 1; min-width: 200px;
  }
  .ma-btn-secondary:hover { border-color: #C8F500; color: #C8F500; }

  /* STATS SIDEBAR */
  .ma-stat {
    padding: 24px 0;
    border-top: 1px solid #141414;
  }
  .ma-stat:last-child { border-bottom: 1px solid #141414; }
  .ma-stat-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; color: #444;
    text-transform: uppercase; letter-spacing: 0.12em;
    margin-bottom: 6px;
  }
  .ma-stat-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900; font-size: 36px;
    color: #C8F500; line-height: 1;
  }
  .ma-stat-desc {
    font-family: 'Barlow', sans-serif;
    font-size: 12px; color: #444; margin-top: 4px; line-height: 1.5;
  }

  /* SECTION SHARED */
  .ma-section {
    padding: 80px 64px;
    border-bottom: 1px solid #111;
  }
  .ma-section-inner { max-width: 1100px; margin: 0 auto; }
  .ma-section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #C8F500;
    letter-spacing: 0.14em; text-transform: uppercase;
    margin-bottom: 12px;
  }
  .ma-section-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900; font-size: clamp(32px, 4vw, 52px);
    text-transform: uppercase; color: #F5F5F0;
    line-height: 0.95; margin-bottom: 16px;
  }
  .ma-section-title span { color: #C8F500; }
  .ma-section-sub {
    font-size: 14px; color: #555; line-height: 1.7;
    max-width: 520px; margin-bottom: 48px;
  }

  /* CARDS DE SERVIÇO */
  .ma-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }
  .ma-card {
    background: #0D0D0D;
    padding: 40px 32px;
    display: flex; flex-direction: column; gap: 16px;
    border-top: 3px solid transparent;
    transition: border-color 0.2s;
  }
  .ma-card:hover { border-top-color: #C8F500; }
  .ma-card-icon {
    width: 44px; height: 44px;
    background: #141414;
    display: flex; align-items: center; justify-content: center;
    color: #C8F500;
  }
  .ma-card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 22px;
    text-transform: uppercase; color: #F5F5F0;
    letter-spacing: 0.02em;
  }
  .ma-card-desc {
    font-size: 13px; color: #555; line-height: 1.7;
  }

  /* SPLIT SECTION */
  .ma-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .ma-split-text { display: flex; flex-direction: column; gap: 20px; }
  .ma-split-quote {
    background: #0D0D0D;
    border-left: 4px solid #C8F500;
    padding: 40px 36px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .ma-split-quote-mark {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900; font-size: 72px;
    color: #1a1a1a; line-height: 0.6; user-select: none;
  }
  .ma-split-quote-text {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: clamp(22px, 3vw, 32px);
    color: #F5F5F0; line-height: 1.15;
    text-transform: uppercase;
  }
  .ma-split-quote-author {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #444;
    letter-spacing: 0.1em; text-transform: uppercase;
  }
  .ma-split-body {
    font-size: 14px; color: #555; line-height: 1.8;
  }
  .ma-split-body strong { color: #D0D0C8; font-weight: 600; }

  /* NÚMEROS */
  .ma-numbers {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
  }
  .ma-number-item {
    background: #0D0D0D;
    padding: 36px 28px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .ma-number-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900; font-size: 52px;
    color: #C8F500; line-height: 1;
  }
  .ma-number-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #444;
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .ma-number-desc {
    font-size: 12px; color: #444; line-height: 1.6; margin-top: 4px;
  }

  /* EQUIPE */
  .ma-team {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }
  .ma-member {
    background: #0D0D0D;
    padding: 36px 28px;
    display: flex; flex-direction: column; gap: 8px;
    border-bottom: 3px solid transparent;
    transition: border-color 0.2s;
  }
  .ma-member:hover { border-bottom-color: #C8F500; }
  .ma-member-role {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; color: #C8F500;
    letter-spacing: 0.12em; text-transform: uppercase;
  }
  .ma-member-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 24px;
    text-transform: uppercase; color: #F5F5F0;
    letter-spacing: 0.02em;
  }
  .ma-member-org {
    font-size: 12px; color: #444; margin-top: 4px;
  }

  /* CTA FINAL */
  .ma-cta-final {
    background: #0D0D0D;
    border-top: 1px solid #111;
    padding: 100px 64px;
    text-align: center;
    display: flex; flex-direction: column;
    align-items: center; gap: 20px;
  }
  .ma-cta-final-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900; font-size: clamp(36px, 5vw, 64px);
    text-transform: uppercase; color: #F5F5F0;
    line-height: 0.95;
  }
  .ma-cta-final-title span { color: #C8F500; }
  .ma-cta-final-sub {
    font-size: 15px; color: #555; max-width: 440px; line-height: 1.7;
  }

  /* FOOTER */
  .ma-footer {
    padding: 24px 48px;
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid #111; flex-wrap: wrap; gap: 12px;
  }
  .ma-footer-left { display: flex; flex-direction: column; gap: 6px; }
  .ma-footer-copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #2e2e2e; letter-spacing: 0.05em;
  }
  .ma-footer-links { display: flex; gap: 16px; flex-wrap: wrap; }
  .ma-footer-link {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #3a3a3a; text-decoration: none;
    letter-spacing: 0.05em; transition: color 0.2s;
  }
  .ma-footer-link:hover { color: #C8F500; }
  .ma-footer-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 13px;
    color: #C8F500; letter-spacing: 0.1em; text-transform: uppercase;
  }

  /* HAMBURGER */
  .ma-hamburger {
    display: none; flex-direction: column; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 4px;
  }
  .ma-hamburger span { display: block; width: 22px; height: 2px; background: #F5F5F0; }
  .ma-mobile-menu {
    background: #0D0D0D; border-bottom: 1px solid #1a1a1a;
    display: flex; flex-direction: column;
  }
  .ma-mobile-link {
    font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 500;
    color: #777; text-decoration: none;
    padding: 16px 24px; border-bottom: 1px solid #111;
    background: none; border-left: none; border-right: none; border-top: none;
    cursor: pointer; text-align: left; width: 100%; display: block;
  }
  .ma-mobile-cta {
    margin: 16px 24px; background: #C8F500; color: #0A0A0A; border: none;
    padding: 14px 20px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900; font-size: 15px;
    letter-spacing: 0.06em; text-transform: uppercase;
    cursor: pointer; width: calc(100% - 48px); text-align: center; display: block;
  }

  @media (max-width: 900px) {
    .ma-hero-wrap { grid-template-columns: 1fr; }
    .ma-hero-right { display: none; }
    .ma-hero-left { padding: 60px 32px; }
    .ma-cards { grid-template-columns: 1fr; }
    .ma-split { grid-template-columns: 1fr; gap: 40px; }
    .ma-numbers { grid-template-columns: 1fr 1fr; }
    .ma-team { grid-template-columns: 1fr; }
    .ma-section { padding: 60px 32px; }
    .ma-cta-final { padding: 72px 32px; }
    .ma-footer { padding: 20px 24px; flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 600px) {
    .ma-nav { padding: 0 20px; }
    .ma-nav-links { display: none; }
    .ma-nav-right { display: none; }
    .ma-hamburger { display: flex; }
    .ma-numbers { grid-template-columns: 1fr; }
    .ma-cta-row { flex-direction: column; }
    .ma-btn-secondary { justify-content: center; }
  }
  @media (min-width: 601px) {
    .ma-hamburger { display: none !important; }
    .ma-mobile-menu { display: none !important; }
  }
`;

const AdminRoute = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin, loading } = useIsAdmin();
  if (!isLoaded || loading) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <AdminDashboard />;
};

const Index = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [menuAberto, setMenuAberto] = useState(false);

  if (!isLoaded) return null;
  if (isSignedIn) return <DoadorDashboard />;

  return (
    <div className="ma-root">
      <style>{styles}</style>

      {/* NAV */}
      <nav className="ma-nav">
        <Logo />
        <div className="ma-nav-links">
          <Link to="/criterios" className="ma-nav-link">Quem pode doar</Link>
          <a href="#sobre" className="ma-nav-link" onClick={e => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }); setMenuAberto(false); }}>Sobre nós</a>
        </div>
        <div className="ma-nav-right">
          <SignInButton mode="modal">
            <button className="ma-btn-nav-ghost">Entrar</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="ma-btn-nav-cta">Criar Conta</button>
          </SignUpButton>
        </div>
        <button className="ma-hamburger" onClick={() => setMenuAberto(m => !m)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {menuAberto && (
        <div className="ma-mobile-menu">
          <Link to="/criterios" className="ma-mobile-link" onClick={() => setMenuAberto(false)}>Quem pode doar</Link>
          <a href="#sobre" className="ma-mobile-link" onClick={e => { e.preventDefault(); setMenuAberto(false); setTimeout(() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Sobre nós</a>
          <SignUpButton mode="modal">
            <button className="ma-mobile-cta" onClick={() => setMenuAberto(false)}>Criar Conta</button>
          </SignUpButton>
        </div>
      )}

      {/* HERO */}
      <div className="ma-hero-wrap">
        <div className="ma-hero-left">
          <div className="ma-eyebrow">MOVEACRE — Acre, Brasil · Doação de Sangue</div>
          <h1 className="ma-headline">
            NINGUÉM DEVERIA<br />
            IMPLORAR POR UM<br />
            DIREITO QUE JÁ É <span>SEU.</span>
          </h1>
          <p className="ma-manifesto">
            O MOVEACRE conecta quem precisa de sangue a quem pode ajudar —
            de forma rápida, direta e sem depender de viralização.
            Cadastre-se como <em>doador</em>, receba alertas compatíveis com seu tipo sanguíneo
            e faça parte de uma rede que realmente salva vidas no Acre.
          </p>
          <div className="ma-cta-row">
            <SignUpButton mode="modal">
              <button className="ma-btn-primary">Quero ser doador</button>
            </SignUpButton>
            <SignUpButton mode="modal">
              <button className="ma-btn-secondary">Preciso de sangue</button>
            </SignUpButton>
          </div>
        </div>

        <div className="ma-hero-right">
          {[
            { val: "~30min", label: "Duração da doação", desc: "Rápido, seguro e sem custo." },
            { val: "4x", label: "Por ano", desc: "Homens podem doar até 4 vezes por ano." },
            { val: "3", label: "Vidas salvas", desc: "Cada doação pode salvar até 3 pessoas." },
            { val: "0", label: "Custo", desc: "Doar sangue é gratuito e voluntário." },
          ].map((s, i) => (
            <div className="ma-stat" key={i}>
              <div className="ma-stat-label">{s.label}</div>
              <div className="ma-stat-value">{s.val}</div>
              <div className="ma-stat-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVIÇOS / O QUE OFERECEMOS */}
      <div className="ma-section">
        <div className="ma-section-inner">
          <div className="ma-section-label">// O que o MOVEACRE faz</div>
          <h2 className="ma-section-title">Uma plataforma.<br /><span>Três pilares.</span></h2>
          <p className="ma-section-sub">
            Construída para resolver o problema real: conectar doadores e receptores de forma eficiente, sem depender de grupos de WhatsApp ou posts virais.
          </p>
          <div className="ma-cards">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: "Cadastro de Doadores",
                desc: "Registre seu tipo sanguíneo, localização e histórico. O sistema calcula automaticamente quando você estará apto para doar de novo.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                ),
                title: "Alertas de Urgência",
                desc: "Quando há uma urgência compatível com seu tipo sanguíneo e localização, você recebe o alerta diretamente. Sem intermediários.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
                title: "Rastreamento Inteligente",
                desc: "Acompanhe seu histórico de doações, veja o impacto gerado e saiba exatamente quando você pode voltar a salvar vidas.",
              },
            ].map((c, i) => (
              <div className="ma-card" key={i}>
                <div className="ma-card-icon">{c.icon}</div>
                <div className="ma-card-title">{c.title}</div>
                <p className="ma-card-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPLIT — PROPÓSITO */}
      <div className="ma-section" id="sobre">
        <div className="ma-section-inner">
          <div className="ma-split">
            <div className="ma-split-quote">
              <div className="ma-split-quote-mark">"</div>
              <p className="ma-split-quote-text">
                Salvar uma vida não pode depender de um post viral.
              </p>
              <span className="ma-split-quote-author">— Manifesto MOVEACRE</span>
            </div>
            <div className="ma-split-text">
              <div className="ma-section-label">// Por que existimos</div>
              <h2 className="ma-section-title" style={{ marginBottom: 0 }}>
                Nascemos da<br /><span>indignação.</span>
              </h2>
              <p className="ma-split-body">
                Todo dia aparece um pedido de sangue no grupo da família.
                A gente compartilha, sente o aperto — e fica por isso mesmo.
                Não por falta de vontade. Por falta de um sistema que funcionasse.
              </p>
              <p className="ma-split-body">
                O MOVEACRE é um projeto de extensão universitária desenvolvido por alunos da{' '}
                <strong>Uninorte — Centro Universitário do Norte</strong>, em Rio Branco, Acre.
                Nasceu da indignação com a falta de um sistema eficiente de mobilização de doadores de sangue no estado.
              </p>
              <Link to="/sobre" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: '#C8F500', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Conheça nossa história →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* NÚMEROS */}
      <div className="ma-section">
        <div className="ma-section-inner">
          <div className="ma-section-label">// Doação em números</div>
          <div className="ma-numbers">
            {[
              { val: "56%", label: "Do sangue é plasma", desc: "Pode ser doado com mais frequência que o sangue total." },
              { val: "8", label: "Tipos sanguíneos", desc: "A+, A-, B+, B-, AB+, AB-, O+, O-. Todos são necessários." },
              { val: "90", label: "Dias entre doações", desc: "Intervalo mínimo para mulheres entre doações de sangue total." },
              { val: "16+", label: "Anos para doar", desc: "Idade mínima para ser doador de sangue no Brasil." },
            ].map((n, i) => (
              <div className="ma-number-item" key={i}>
                <div className="ma-number-val">{n.val}</div>
                <div className="ma-number-label">{n.label}</div>
                <p className="ma-number-desc">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MANIFESTO */}
      <div className="ma-section">
        <div className="ma-section-inner">
          <div className="ma-section-label">// Como operamos</div>
          <h2 className="ma-section-title" style={{ marginBottom: 32 }}>Nossos<br /><span>princípios.</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {[
              { num: "01", label: "Sem viralização", desc: "Não dependemos de posts virais. O sistema notifica diretamente quem pode ajudar, na hora certa." },
              { num: "02", label: "Transparência total", desc: "Somos um projeto universitário sem fins lucrativos. Não vendemos dados, não cobramos nada." },
              { num: "03", label: "Tecnologia a serviço", desc: "Compatibilidade sanguínea, intervalo entre doações, localização — tudo calculado automaticamente." },
              { num: "04", label: "Feito no Acre", desc: "Construído por quem vive aqui, para resolver um problema real que afeta famílias acreanas todo dia." },
            ].map((item, i) => (
              <div key={i} style={{ background: '#0D0D0D', padding: '28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.1em' }}>{item.num}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, textTransform: 'uppercase', color: '#C8F500', letterSpacing: '0.03em' }}>{item.label}</span>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#666', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EQUIPE */}
      <div className="ma-section">
        <div className="ma-section-inner">
          <div className="ma-section-label">// Quem fez</div>
          <h2 className="ma-section-title" style={{ marginBottom: 8 }}>O time por trás<br /><span>do movimento.</span></h2>
          <p className="ma-section-sub">Alunos da Uninorte que decidiram parar de reclamar e começar a construir.</p>
          <div className="ma-team">
            {[
              { role: "Desenvolvimento", name: "Kelvin Lieberman", org: "Uninorte — Rio Branco, AC" },
              { role: "Desenvolvimento", name: "Julio Souza", org: "Uninorte — Rio Branco, AC" },
              { role: "Desenvolvimento", name: "Tomas Souza", org: "Uninorte — Rio Branco, AC" },
            ].map((m, i) => (
              <div className="ma-member" key={i}>
                <span className="ma-member-role">{m.role}</span>
                <span className="ma-member-name">{m.name}</span>
                <span className="ma-member-org">{m.org}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="ma-cta-final">
        <div className="ma-section-label" style={{ textAlign: 'center' }}>// Próximo passo</div>
        <h2 className="ma-cta-final-title">
          Sai da plateia.<br /><span>Entra no movimento.</span>
        </h2>
        <p className="ma-cta-final-sub">
          Cada pessoa cadastrada é uma resposta que o Acre não vai precisar implorar.
        </p>
        <div className="ma-cta-row" style={{ justifyContent: 'center', marginBottom: 0 }}>
          <SignUpButton mode="modal">
            <button className="ma-btn-primary">Quero ser doador</button>
          </SignUpButton>
          <Link to="/criterios" className="ma-btn-secondary">Ver critérios</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="ma-footer">
        <div className="ma-footer-left">
          <span className="ma-footer-copy">© 2026 MOVEACRE — Rio Branco, Acre, Brasil</span>
          <div className="ma-footer-links">
            <Link to="/criterios" className="ma-footer-link">Critérios de doação</Link>
            <a href="#sobre" className="ma-footer-link" onClick={e => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }); }}>Sobre nós</a>
            <Link to="/termos" className="ma-footer-link">Termos</Link>
            <Link to="/privacidade" className="ma-footer-link">Privacidade</Link>
          </div>
        </div>
        <span className="ma-footer-tag">Vamos mover o Acre.</span>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/minhas-urgencias" element={<MinhasUrgencias />} />
        <Route path="/criar-urgencia" element={<SyncWrapper><CriarUrgencia /></SyncWrapper>} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/historico-doador" element={<HistoricoDoador />} />
        <Route path="/editar-pedido/:id" element={<EditarPedido />} />
        <Route path="/editar-conta" element={<EditarConta />} />
        <Route path="/listar-urgencias" element={<MinhasUrgencias />} />
        <Route path="/criterios" element={<Criterios />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
      </Routes>
    </Router>
  );
}
