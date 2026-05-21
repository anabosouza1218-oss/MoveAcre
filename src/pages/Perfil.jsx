import { useState, useEffect } from "react";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import { safeFetch } from "../mock/safeFetch.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pf-root {
    background: #0A0A0A;
    color: #D8D8D0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .pf-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 32px;
    height: 56px;
    border-bottom: 1px solid #1A1A1A;
    background: #0D0D0D;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .pf-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #333;
    letter-spacing: 0.08em;
    text-decoration: none;
    transition: color 0.15s;
  }
  .pf-back:hover { color: #666; }

  .pf-body {
    flex: 1;
    padding: 52px 32px 64px;
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
  }

  .pf-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    letter-spacing: 0.12em;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pf-eyebrow::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 1px;
    background: #C8F500;
  }

  .pf-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 52px;
    line-height: 0.92;
    text-transform: uppercase;
    color: #F0F0E8;
    margin-bottom: 32px;
    letter-spacing: -0.01em;
  }
  .pf-title span { color: #C8F500; }

  .pf-separator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 36px;
  }
  .pf-separator-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #1E1E1E, transparent);
  }
  .pf-separator-dot { width: 4px; height: 4px; background: #C8F500; }

  .pf-section {
    background: #0F0F0F;
    border: 1px solid #1A1A1A;
    padding: 0;
    margin-bottom: 12px;
    overflow: hidden;
  }

  .pf-section-header {
    padding: 14px 20px;
    border-bottom: 1px solid #1A1A1A;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #111;
  }

  .pf-subtitle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 600;
  }

  .pf-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid #141414;
    transition: background 0.1s;
  }
  .pf-row:last-child { border-bottom: none; }
  .pf-row:hover { background: #111; }

  .pf-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #3A3A3A;
    letter-spacing: 0.06em;
  }

  .pf-value {
    font-size: 14px;
    font-weight: 500;
    color: #C8C8C0;
    text-align: right;
  }

  .pf-value.accent { color: #C8F500; font-weight: 700; }

  .pf-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 24px;
  }

  .pf-btn {
    background: #0F0F0F;
    color: #888;
    border: 1px solid #1E1E1E;
    padding: 12px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    text-align: center;
  }
  .pf-btn:hover { border-color: #2E2E2E; color: #C8C8C0; background: #131313; }

  .pf-btn-primary {
    background: #C8F500;
    color: #000;
    border-color: #C8F500;
    font-weight: 700;
  }
  .pf-btn-primary:hover { background: #D4FF00; color: #000; border-color: #D4FF00; }

  .pf-btn-danger { border-color: #1E1E1E; color: #444; }
  .pf-btn-danger:hover { border-color: #FF3333; color: #FF3333; background: rgba(255,51,51,0.04); }

  .pf-btn-full { grid-column: 1 / -1; }

  .pf-footer {
    padding: 14px 32px;
    border-top: 1px solid #141414;
    background: #0D0D0D;
  }
  .pf-footer-copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #222;
    letter-spacing: 0.08em;
  }

  /* MODAL */
  .pf-modal {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.94);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .pf-modal-content {
    background: #111;
    border: 1px solid #222;
    padding: 32px;
    width: 100%;
    max-width: 420px;
  }

  .pf-modal-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 22px;
    text-transform: uppercase;
    color: #C8F500;
    margin-bottom: 24px;
    letter-spacing: 0.03em;
  }

  .pf-modal-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #444;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
    display: block;
  }

  .pf-modal-input {
    width: 100%;
    padding: 10px 12px;
    background: #0A0A0A;
    border: 1px solid #1E1E1E;
    color: #C8C8C0;
    margin-bottom: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s;
  }
  .pf-modal-input:focus { border-color: #2A2A2A; }
`;

export default function Perfil() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [dataDoacao, setDataDoacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (location.state?.abrirDeclarar) setShowModal(true);
  }, [location.state]);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = await getToken();
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;
        const res = await safeFetch(`/doadores/me?email=${email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data && Object.keys(json.data).length > 0) {
          setPerfil(json.data);
        } else {
          setPerfil({ tipo_sangue:'Não cadastrado', genero:'Não cadastrado', telefone:'Não cadastrado', idade:'Não cadastrado', cidade:'Não cadastrado', ultima_doacao:'Não cadastrado', tipo:'Não cadastrado', nivel:'Não cadastrado' });
        }
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    if (user) fetchPerfil();
  }, [getToken, user]);

  const handleDelete = async () => {
    if (window.confirm("Ação irreversível! Deseja mesmo desativar sua conta?")) {
      try {
        const token = await getToken();
        const email = user?.primaryEmailAddress?.emailAddress;
        await safeFetch("/doadores/desativar", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        await signOut();
      } catch (err) { console.error(err); }
    }
  };

  const handleEnviarDoacao = async (e) => {
    e.preventDefault();
    if (!arquivo) { alert("Selecione o atestado."); return; }
    if (!dataDoacao) { alert("Informe a data da doação."); return; }
    setEnviando(true);
    try {
      const token = await getToken();
      const email = user?.primaryEmailAddress?.emailAddress;
      const formData = new FormData();
      formData.append("email", email);
      formData.append("data_doacao", dataDoacao);
      formData.append("atestado", arquivo);
      const res = await safeFetch("/doadores/declarar-doacao", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        alert("Atestado enviado! Aguardando aprovação do administrador.");
        setShowModal(false); setArquivo(null); setDataDoacao("");
      } else {
        alert("Erro: " + (json.message || "Tente novamente."));
      }
    } catch (err) { alert("Erro ao enviar: " + err.message); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pf-root">
        <nav className="pf-nav">
          <Logo />
          <Link to="/" className="pf-back">← VOLTAR</Link>
        </nav>

        <div className="pf-body">
          <div className="pf-eyebrow">MINHA_CONTA</div>
          <h1 className="pf-title">MEU <span>PERFIL</span></h1>

          <div className="pf-separator">
            <div className="pf-separator-dot" />
            <div className="pf-separator-line" />
          </div>

          {loading ? (
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"#333", letterSpacing:"0.1em" }}>CARREGANDO...</div>
          ) : (
            <>
              <div className="pf-section">
                <div className="pf-section-header">
                  <div className="pf-subtitle">DADOS DA CONTA</div>
                </div>
                <div className="pf-row">
                  <span className="pf-label">NOME</span>
                  <span className="pf-value">{perfil?.nome_completo || user?.fullName}</span>
                </div>
                <div className="pf-row">
                  <span className="pf-label">EMAIL</span>
                  <span className="pf-value">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="pf-row">
                  <span className="pf-label">TIPO</span>
                  <span className="pf-value accent">{perfil?.tipo}</span>
                </div>
                <div className="pf-row">
                  <span className="pf-label">NÍVEL DOADOR</span>
                  <span className="pf-value accent">{perfil?.nivel || "BRONZE"}</span>
                </div>
              </div>

              <div className="pf-section">
                <div className="pf-section-header">
                  <div className="pf-subtitle">INFORMAÇÕES MÉDICAS E CONTATO</div>
                </div>
                <div className="pf-row">
                  <span className="pf-label">TIPO SANGUÍNEO</span>
                  <span className="pf-value">{perfil?.tipo_sangue}</span>
                </div>
                <div className="pf-row">
                  <span className="pf-label">IDADE</span>
                  <span className="pf-value">{perfil?.idade}</span>
                </div>
                <div className="pf-row">
                  <span className="pf-label">CIDADE</span>
                  <span className="pf-value">{perfil?.cidade}</span>
                </div>
                <div className="pf-row">
                  <span className="pf-label">ÚLTIMA DOAÇÃO</span>
                  <span className="pf-value">{perfil?.ultima_doacao}</span>
                </div>
              </div>

              <div className="pf-actions">
                <button className="pf-btn" onClick={() => navigate('/editar-conta')}>EDITAR CONTA</button>
                <button className="pf-btn" onClick={() => navigate('/historico-doador')}>HISTÓRICO DE DOAÇÕES</button>
                <button className="pf-btn pf-btn-primary pf-btn-full" onClick={() => setShowModal(true)}>+ DECLARAR DOAÇÃO</button>
                <button className="pf-btn pf-btn-danger pf-btn-full" onClick={handleDelete}>DESATIVAR CONTA</button>
              </div>
            </>
          )}
        </div>

        <footer className="pf-footer">
          <span className="pf-footer-copy">© 2026 MOVEACRE — DADOS PROTEGIDOS</span>
        </footer>

        {showModal && (
          <div className="pf-modal">
            <div className="pf-modal-content">
              <div className="pf-modal-title">DECLARAR DOAÇÃO</div>
              <form onSubmit={handleEnviarDoacao}>
                <label className="pf-modal-label">DATA DA DOAÇÃO</label>
                <input
                  type="date"
                  className="pf-modal-input"
                  required
                  value={dataDoacao}
                  onChange={(e) => setDataDoacao(e.target.value)}
                />
                <label className="pf-modal-label">ATESTADO (PDF, PNG, JPG)</label>
                <input
                  type="file"
                  className="pf-modal-input"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setArquivo(e.target.files[0])}
                />
                <button type="submit" className="pf-btn pf-btn-primary pf-btn-full" style={{ width:"100%", marginBottom:8 }} disabled={enviando}>
                  {enviando ? "ENVIANDO..." : "ENVIAR ATESTADO"}
                </button>
                <button type="button" className="pf-btn pf-btn-full" style={{ width:"100%" }} onClick={() => setShowModal(false)}>
                  CANCELAR
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
