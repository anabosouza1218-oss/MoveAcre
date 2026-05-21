import { useAuth, useUser, UserButton, useClerk } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { safeFetch } from "../mock/safeFetch.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dd-root {
    background: #0A0A0A;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .dd-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 32px;
    height: 56px;
    border-bottom: 1px solid #1E1E1E;
    background: #0D0D0D;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .dd-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dd-admin-link {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    text-decoration: none;
    border: 1px solid rgba(200,245,0,0.3);
    padding: 5px 12px;
    letter-spacing: 0.08em;
    transition: background 0.15s, border-color 0.15s;
  }

  .dd-admin-link:hover {
    background: rgba(200,245,0,0.08);
    border-color: #C8F500;
  }

  .dd-body {
    flex: 1;
    padding: 52px 32px 64px;
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
  }

  .dd-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    letter-spacing: 0.12em;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dd-eyebrow::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 1px;
    background: #C8F500;
  }

  .dd-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 54px;
    line-height: 0.92;
    text-transform: uppercase;
    color: #F5F5F0;
    margin-bottom: 32px;
    letter-spacing: -0.01em;
  }

  .dd-title span { color: #C8F500; }

  .dd-separator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
  }

  .dd-separator-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #1E1E1E, transparent);
  }

  .dd-separator-dot { width: 4px; height: 4px; background: #C8F500; }

  .dd-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .dd-card {
    background: #111;
    border: 1px solid #1E1E1E;
    padding: 24px;
    cursor: pointer;
    text-align: left;
    width: 100%;
    text-decoration: none;
    display: block;
    transition: border-color 0.18s, background 0.18s;
    position: relative;
    overflow: hidden;
  }

  .dd-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: transparent;
    transition: background 0.18s;
  }

  .dd-card:hover { border-color: #2A2A2A; background: #131313; }
  .dd-card:hover::before { background: #444; }

  .dd-card-accent { border-color: rgba(200,245,0,0.12); }
  .dd-card-accent::before { background: #C8F500 !important; }
  .dd-card-accent:hover {
    border-color: rgba(200,245,0,0.28);
    background: rgba(200,245,0,0.025);
  }

  .dd-card-full { grid-column: 1 / -1; }

  .dd-card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 22px;
    text-transform: uppercase;
    color: #C8C8C0;
    margin-bottom: 8px;
    letter-spacing: 0.03em;
    line-height: 1.15;
  }

  .dd-card-title.primary { color: #C8F500; }

  .dd-card-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #3A3A3A;
    line-height: 1.6;
    letter-spacing: 0.02em;
  }

  .dd-footer {
    padding: 14px 32px;
    border-top: 1px solid #141414;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0D0D0D;
  }

  .dd-footer-copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #242424;
    letter-spacing: 0.08em;
  }

  .dd-footer-slogan {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #303030;
    letter-spacing: 0.12em;
  }
`;

export default function DoadorDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [nomeDoador, setNomeDoador] = useState("");
  const [contaDesativada, setContaDesativada] = useState(null);
  const [emailDoador, setEmailDoador] = useState("");

  useEffect(() => {
    const checkPerfil = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();

          const isAdminRes = await safeFetch("/auth/is-admin", { headers: { Authorization: `Bearer ${token}` } });
          const isAdminJson = await isAdminRes.json();
          if (isAdminJson.is_admin) return;

          const res = await safeFetch("/doadores/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          const data = json.data ?? json;
          if (data && data.nome_completo) {
            setNomeDoador(data.nome_completo.split(" ")[0]);
          }
          if (data && data.email) setEmailDoador(data.email);

          if (data && data.online === 0) {
            setContaDesativada(data.desativado_por || 'admin');
            return;
          }

          const completo =
            data &&
            data.genero && data.genero.trim() !== "" &&
            data.telefone && data.telefone.trim() !== "";

          if (!completo) {
            navigate("/completar-perfil", { replace: true });
          }
        } catch (err) { console.error(err); }
      }
    };
    checkPerfil();
  }, [isSignedIn, getToken]);

  if (!isLoaded || !isSignedIn) return null;

  if (contaDesativada) {
    const foiAdmin = contaDesativada === 'admin';
    const reativar = async () => {
      const token = await getToken();
      const email = user?.primaryEmailAddress?.emailAddress;
      const res = await safeFetch("/doadores/reativar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (j.success) { setContaDesativada(null); }
      else alert(j.message);
    };
    return (
      <div style={{ background:"#0A0A0A", color:"#F5F5F0", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Barlow,sans-serif", padding:32 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=JetBrains+Mono:wght@400&display=swap');`}</style>
        <div style={{ maxWidth:400, width:"100%" }}>
          <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#FF3333", letterSpacing:"0.12em", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ display:"inline-block", width:16, height:1, background:"#FF3333" }} />
            CONTA_DESATIVADA
          </div>
          <h2 style={{ fontFamily:"Barlow Condensed,sans-serif", fontWeight:900, fontSize:36, textTransform:"uppercase", marginBottom:20, lineHeight:1 }}>
            Sua conta está <span style={{ color:"#FF3333" }}>desativada</span>
          </h2>
          {foiAdmin ? (
            <p style={{ color:"#555", fontSize:14, lineHeight:1.7, marginBottom:32 }}>
              Esta conta foi desativada pelo administrador. Para mais informações, entre em contato com o suporte.
            </p>
          ) : (
            <>
              <p style={{ color:"#555", fontSize:14, lineHeight:1.7, marginBottom:32 }}>
                Você desativou sua conta. Deseja reativá-la?
              </p>
              <button onClick={reativar} style={{ background:"#C8F500", color:"#000", border:"none", padding:"14px 32px", fontFamily:"Barlow Condensed,sans-serif", fontWeight:900, fontSize:16, textTransform:"uppercase", cursor:"pointer", marginBottom:12, width:"100%", letterSpacing:"0.05em" }}>
                REATIVAR CONTA
              </button>
            </>
          )}
          <button onClick={() => signOut()} style={{ background:"transparent", color:"#444", border:"1px solid #222", padding:"10px 24px", fontFamily:"JetBrains Mono,monospace", fontSize:11, cursor:"pointer", width:"100%", letterSpacing:"0.05em" }}>
            SAIR
          </button>
        </div>
      </div>
    );
  }

  const firstName = nomeDoador || user.firstName || "doador";

  return (
    <>
      <style>{styles}</style>
      <div className="dd-root">
        <nav className="dd-nav">
          <Logo />
          <div className="dd-nav-right">
            {isAdmin && (
              <Link to="/admin" className="dd-admin-link">ADMIN</Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>

        <div className="dd-body">
          <div className="dd-eyebrow">BEM_VINDO</div>
          <h1 className="dd-title">
            OLÁ,<br />
            <span>{firstName}</span>
          </h1>

          <div className="dd-separator">
            <div className="dd-separator-dot" />
            <div className="dd-separator-line" />
          </div>

          <div className="dd-grid">
            <button onClick={() => navigate('/criar-urgencia')} className="dd-card dd-card-accent dd-card-full">
              <h2 className="dd-card-title primary">ABRIR PEDIDO DE SANGUE</h2>
              <p className="dd-card-desc">Criar um novo pedido de transfusão de sangue urgente.</p>
            </button>

            <button onClick={() => navigate('/minhas-urgencias')} className="dd-card">
              <h2 className="dd-card-title">MEUS PEDIDOS</h2>
              <p className="dd-card-desc">Ver status dos pedidos feitos.</p>
            </button>

            <button onClick={() => navigate('/perfil')} className="dd-card">
              <h2 className="dd-card-title">MINHA CONTA</h2>
              <p className="dd-card-desc">Histórico, dados e declarar doação.</p>
            </button>

            {user?.publicMetadata?.role === "admin" && (
              <button onClick={() => navigate('/admin')} className="dd-card dd-card-full">
                <h2 className="dd-card-title primary">PAINEL ADMINISTRATIVO</h2>
                <p className="dd-card-desc">Gestão de usuários, doadores e pedidos.</p>
              </button>
            )}
          </div>
        </div>

        <footer className="dd-footer">
          <span className="dd-footer-copy">© 2026 MOVEACRE — RIO BRANCO, ACRE</span>
          <span className="dd-footer-slogan">VAMOS MOVER O ACRE.</span>
        </footer>
      </div>
    </>
  );
}
