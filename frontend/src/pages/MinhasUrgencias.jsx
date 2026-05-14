import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .mu-root {
    background: #0A0A0A;
    color: #D8D8D0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .mu-nav {
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

  .mu-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #333;
    letter-spacing: 0.08em;
    text-decoration: none;
    transition: color 0.15s;
  }
  .mu-back:hover { color: #666; }

  .mu-body {
    flex: 1;
    padding: 52px 32px 64px;
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
  }

  .mu-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    letter-spacing: 0.12em;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mu-eyebrow::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 1px;
    background: #C8F500;
  }

  .mu-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 52px;
    line-height: 0.92;
    text-transform: uppercase;
    color: #F0F0E8;
    margin-bottom: 32px;
    letter-spacing: -0.01em;
  }
  .mu-title span { color: #C8F500; }

  .mu-separator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 36px;
  }
  .mu-separator-dot { width: 4px; height: 4px; background: #C8F500; }
  .mu-separator-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #1E1E1E, transparent);
  }

  .mu-empty {
    background: #0F0F0F;
    border: 1px solid #141414;
    padding: 32px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #2A2A2A;
    letter-spacing: 0.1em;
  }

  .mu-loading {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #333;
    letter-spacing: 0.1em;
  }

  .mu-list {
    background: #0F0F0F;
    border: 1px solid #1A1A1A;
    overflow: hidden;
  }

  .mu-card {
    padding: 20px 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid #141414;
    transition: background 0.1s;
  }
  .mu-card:last-child { border-bottom: none; }
  .mu-card:hover { background: #111; }

  .mu-card-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  .mu-paciente {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    color: #C8C8C0;
    letter-spacing: 0.02em;
  }

  .mu-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #333;
    letter-spacing: 0.06em;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .mu-meta-val { color: #555; }

  .mu-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    text-transform: uppercase;
    white-space: nowrap;
    font-weight: 600;
  }

  .mu-badge-pendente {
    background: transparent;
    color: #C8F500;
    border: 1px solid rgba(200,245,0,0.3);
  }

  .mu-badge-aprovado {
    background: #C8F500;
    color: #0A0A0A;
  }

  .mu-badge-recusado {
    background: transparent;
    color: #FF3333;
    border: 1px solid rgba(255,51,51,0.3);
  }

  .mu-badge-default {
    background: transparent;
    color: #333;
    border: 1px solid #1E1E1E;
  }

  .mu-recusa-box {
    margin-top: 8px;
    background: rgba(255,51,51,0.04);
    border: 1px solid rgba(255,51,51,0.15);
    padding: 8px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #FF3333;
    line-height: 1.6;
    letter-spacing: 0.04em;
  }

  .mu-edit-btn {
    background: transparent;
    color: #C8F500;
    border: 1px solid rgba(200,245,0,0.2);
    padding: 4px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    transition: border-color 0.15s;
    margin-top: 6px;
  }
  .mu-edit-btn:hover { border-color: #C8F500; }

  .mu-new-btn {
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 13px 28px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 15px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    margin-top: 20px;
    transition: opacity 0.15s;
  }
  .mu-new-btn:hover { opacity: 0.85; }

  .mu-footer {
    padding: 14px 32px;
    border-top: 1px solid #141414;
    background: #0D0D0D;
  }
  .mu-footer-copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #222;
    letter-spacing: 0.08em;
  }
`;

const statusConfig = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "aprovada" || s === "aprovado" || s === "ativo") return { label: status, cls: "mu-badge-aprovado" };
  if (s === "recusada" || s === "recusado" || s === "rejeitado") return { label: status, cls: "mu-badge-recusado" };
  if (s === "pendente" || s === "aguardando") return { label: status, cls: "mu-badge-pendente" };
  return { label: status || "—", cls: "mu-badge-default" };
};

export default function MinhasUrgencias() {
  const [urgencias, setUrgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const carregar = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/urgencias/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUrgencias(data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    carregar();
  }, [getToken]);

  return (
    <>
      <style>{styles}</style>
      <div className="mu-root">
        <nav className="mu-nav">
          <Logo />
          <Link to="/" className="mu-back">← VOLTAR</Link>
        </nav>

        <div className="mu-body">
          <div className="mu-eyebrow">HISTÓRICO_DE_PEDIDOS</div>
          <h1 className="mu-title">MEUS <span>PEDIDOS</span></h1>

          <div className="mu-separator">
            <div className="mu-separator-dot" />
            <div className="mu-separator-line" />
          </div>

          {loading ? (
            <div className="mu-loading">CARREGANDO...</div>
          ) : urgencias.length === 0 ? (
            <div className="mu-empty">NENHUM_PEDIDO_ENCONTRADO</div>
          ) : (
            <div className="mu-list">
              {urgencias.map((u) => {
                const { label, cls } = statusConfig(u.status);
                return (
                  <div key={u.id} className="mu-card">
                    <div className="mu-card-left">
                      <div className="mu-paciente">{u.paciente_nome}</div>
                      <div className="mu-meta">
                        {u.tipo_necessario && <span>TIPO: <span className="mu-meta-val">{u.tipo_necessario}</span></span>}
                        {u.contato_solicitante && <span>CONTATO: <span className="mu-meta-val">{u.contato_solicitante}</span></span>}
                        {u.criado_em && <span>DATA: <span className="mu-meta-val">{new Date(u.criado_em).toLocaleDateString("pt-BR")}</span></span>}
                      </div>
                      {(u.status === "Recusada" || u.status === "Recusado") && u.motivo_recusa && (
                        <div className="mu-recusa-box">
                          MOTIVO: {u.motivo_recusa}
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                      <span className={`mu-badge ${cls}`}>{label}</span>
                      {u.status === "Pendente" && (
                        <button onClick={() => navigate(`/editar-pedido/${u.id}`)} className="mu-edit-btn">
                          EDITAR
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link to="/criar-urgencia" className="mu-new-btn">
            + NOVO PEDIDO
          </Link>
        </div>

        <footer className="mu-footer">
          <span className="mu-footer-copy">© 2026 MOVEACRE — RIO BRANCO, ACRE</span>
        </footer>
      </div>
    </>
  );
}
