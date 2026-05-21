import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { safeFetch } from "../mock/safeFetch.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const nivelCor = { OURO:"#FFD700", PRATA:"#C0C0C0", BRONZE:"#CD7F32" };

export default function HistoricoDoador() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [doacoes, setDoacoes] = useState([]);
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [rPerfil, rDoacoes] = await Promise.all([
        safeFetch(`/doadores/me?email=${email}`, { headers }),
        safeFetch(`/doadores/historico-doacoes?email=${email}`, { headers }),
      ]);
      const jPerfil  = await rPerfil.json();
      const jDoacoes = await rDoacoes.json();
      if (jPerfil.success)  setPerfil(jPerfil.data);
      if (jDoacoes.success) setDoacoes(jDoacoes.data);
      setLoading(false);
    };
    if (user) carregar();
  }, [user, getToken]);

  const nivel = perfil?.nivel || "BRONZE";
  const cor   = nivelCor[nivel] || "#CD7F32";

  const proximo = nivel === "BRONZE" ? { nome:"PRATA", meta:3 } : nivel === "PRATA" ? { nome:"OURO", meta:6 } : null;
  const progresso = proximo ? Math.min((doacoes.length / proximo.meta) * 100, 100) : 100;

  return (
    <div style={{ background:"#0A0A0A", color:"#D8D8D0", minHeight:"100vh", fontFamily:"Barlow,sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* NAV */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 32px", height:56, borderBottom:"1px solid #1A1A1A", background:"#0D0D0D", position:"sticky", top:0 }}>
        <Logo />
        <Link to="/perfil" style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#333", textDecoration:"none", letterSpacing:"0.08em", transition:"color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#666"}
          onMouseLeave={e => e.currentTarget.style.color = "#333"}
        >← VOLTAR</Link>
      </nav>

      <div style={{ flex:1, padding:"52px 32px 64px", maxWidth:680, width:"100%", margin:"0 auto" }}>

        {/* HEADER */}
        <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#C8F500", letterSpacing:"0.12em", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ display:"inline-block", width:16, height:1, background:"#C8F500" }} />
          HISTÓRICO_DO_DOADOR
        </div>
        <h1 style={{ fontFamily:"Barlow Condensed,sans-serif", fontWeight:900, fontSize:52, textTransform:"uppercase", lineHeight:0.92, marginBottom:32, color:"#F0F0E8", letterSpacing:"-0.01em" }}>
          MINHAS <span style={{ color:"#C8F500" }}>DOAÇÕES</span>
        </h1>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40 }}>
          <div style={{ width:4, height:4, background:"#C8F500" }} />
          <div style={{ flex:1, height:1, background:"linear-gradient(to right, #1E1E1E, transparent)" }} />
        </div>

        {loading ? (
          <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"#333", letterSpacing:"0.1em" }}>CARREGANDO...</div>
        ) : (
          <>
            {/* CARD DE NÍVEL */}
            <div style={{ background:"#0F0F0F", border:`1px solid #1A1A1A`, borderLeft:`3px solid ${cor}`, padding:"20px 24px", marginBottom:10, display:"flex", alignItems:"center", gap:24 }}>
              <div style={{ fontSize:42, fontWeight:900, color:cor, fontFamily:"Barlow Condensed,sans-serif", lineHeight:1, minWidth:80 }}>{nivel}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#333", marginBottom:6, letterSpacing:"0.1em" }}>NÍVEL DO DOADOR</div>
                <div style={{ fontSize:14, color:"#888", marginBottom:8, fontWeight:500 }}>
                  {doacoes.length} {doacoes.length !== 1 ? "doações" : "doação"} declarada{doacoes.length !== 1 ? "s" : ""}
                </div>
                {proximo && (
                  <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#444", letterSpacing:"0.06em" }}>
                    {proximo.meta - doacoes.length > 0 ? `${proximo.meta - doacoes.length} doação(ões) para ${proximo.nome}` : `Pronto para ${proximo.nome}!`}
                  </div>
                )}
                {!proximo && (
                  <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#444", letterSpacing:"0.06em" }}>NÍVEL MÁXIMO ATINGIDO</div>
                )}
              </div>
            </div>

            {/* PROGRESSO */}
            <div style={{ background:"#0F0F0F", border:"1px solid #1A1A1A", padding:"16px 24px", marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#2A2A2A", marginBottom:10, letterSpacing:"0.08em" }}>
                <span>BRONZE</span><span>PRATA (3)</span><span>OURO (6)</span>
              </div>
              <div style={{ background:"#141414", height:4, position:"relative" }}>
                <div style={{ background:cor, height:"100%", width:`${progresso}%`, transition:"width 0.6s ease" }} />
              </div>
            </div>

            {/* LISTA */}
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#333", letterSpacing:"0.12em", marginBottom:16 }}>REGISTRO DE DOAÇÕES</div>

            {doacoes.length === 0 ? (
              <div style={{ background:"#0F0F0F", border:"1px solid #141414", padding:"24px 20px", fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"#2A2A2A", letterSpacing:"0.08em" }}>
                NENHUMA DOAÇÃO DECLARADA
              </div>
            ) : (
              <div style={{ background:"#0F0F0F", border:"1px solid #1A1A1A", overflow:"hidden" }}>
                {doacoes.map((d, i) => (
                  <div key={d.id} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"16px 20px",
                    borderBottom: i < doacoes.length - 1 ? "1px solid #141414" : "none",
                    transition:"background 0.1s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#111"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div>
                      <div style={{ fontFamily:"Barlow Condensed,sans-serif", fontWeight:700, fontSize:17, textTransform:"uppercase", color:"#C8C8C0", marginBottom:5 }}>
                        Doação #{doacoes.length - i}
                      </div>
                      <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#333", letterSpacing:"0.06em" }}>
                        DATA: {d.data_doacao || "—"} &nbsp;·&nbsp; REG: {d.criado_em ? new Date(d.criado_em).toLocaleDateString("pt-BR") : "—"}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      {d.atestado_url && (
                        <button
                          onClick={() => window.open(`${API}/uploads/${d.atestado_url}`, "_blank")}
                          style={{ background:"transparent", color:"#C8F500", border:"1px solid rgba(200,245,0,0.25)", padding:"5px 12px", fontFamily:"JetBrains Mono,monospace", fontSize:9, cursor:"pointer", letterSpacing:"0.06em", transition:"border-color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "#C8F500"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,245,0,0.25)"}
                        >VER ATESTADO</button>
                      )}
                      <span style={{ color:"#44FF88", fontSize:14 }}>✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <footer style={{ padding:"14px 32px", borderTop:"1px solid #141414", background:"#0D0D0D" }}>
        <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#222", letterSpacing:"0.08em" }}>© 2026 MOVEACRE</span>
      </footer>
    </div>
  );
}
