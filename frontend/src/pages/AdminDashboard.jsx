import { useState, useEffect, useCallback } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TIPOS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const NIVEIS_URG = ["BAIXA","MEDIA","ALTA","CRITICA"];
const NIVEIS_DOA = ["BRONZE","PRATA","OURO"];
const nivelCor  = { CRITICA:"#FF3333", ALTA:"#FF8800", MEDIA:"#C8F500", BAIXA:"#44FF88" };
const statusCor = { Pendente:"#C8F500", Aprovada:"#44FF88", Recusada:"#FF3333", Desativado:"#555" };

/* ─── shared design tokens ─── */
const t = {
  bg:       "#0A0A0A",
  surface:  "#0F0F0F",
  surface2: "#141414",
  border:   "#1A1A1A",
  border2:  "#242424",
  text:     "#D8D8D0",
  muted:    "#555",
  dim:      "#333",
  accent:   "#C8F500",
  green:    "#44FF88",
  red:      "#FF3333",
  orange:   "#FF8800",
  mono:     "'JetBrains Mono', monospace",
  cond:     "'Barlow Condensed', sans-serif",
  sans:     "'Barlow', sans-serif",
};

const s = {
  root:    { background: t.bg, color: t.text, minHeight:"100vh", fontFamily: t.sans },
  nav:     { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 28px", height:56, borderBottom:`1px solid ${t.border}`, background: t.surface, position:"sticky", top:0, zIndex:100 },
  navLeft: { display:"flex", alignItems:"center", gap:16 },
  navTag:  { fontFamily: t.mono, fontSize:10, color: t.dim, letterSpacing:"0.1em", paddingLeft:12, borderLeft:`1px solid ${t.border2}` },
  tabs:    { display:"flex", borderBottom:`1px solid ${t.border}`, padding:"0 28px", overflowX:"auto", background: t.surface, gap:0 },
  body:    { padding:"28px 28px 48px" },
  th:      { padding:"10px 14px", color:"#3A3A3A", fontSize:10, fontFamily: t.mono, textAlign:"left", borderBottom:`1px solid ${t.border}`, whiteSpace:"nowrap", letterSpacing:"0.08em", fontWeight:600 },
  td:      { padding:"14px 14px", borderBottom:`1px solid #111`, fontSize:13, verticalAlign:"top", color: t.text },
  table:   { width:"100%", borderCollapse:"collapse" },
  input:   { background:"#111", border:`1px solid ${t.border2}`, color: t.text, padding:"8px 12px", fontSize:11, outline:"none", fontFamily: t.mono, letterSpacing:"0.03em", transition:"border-color 0.15s" },
  select:  { background:"#111", border:`1px solid ${t.border2}`, color: t.text, padding:"8px 12px", fontSize:11, outline:"none", cursor:"pointer", fontFamily: t.mono },
  statBox: { background: t.surface2, border:`1px solid ${t.border}`, padding:"20px 24px", flex:1, minWidth:130, position:"relative", overflow:"hidden" },
};

const Bdg = ({ cor, txt }) => (
  <span style={{
    background: cor,
    color: (cor === t.accent || cor === t.green) ? "#000" : "#fff",
    padding: "3px 9px",
    fontSize: 9,
    fontWeight: 700,
    display: "inline-block",
    fontFamily: t.mono,
    letterSpacing: "0.08em",
  }}>{txt}</span>
);

const Btn = ({ bg, c = "#000", label, onClick }) => (
  <button onClick={onClick} style={{
    background: bg,
    color: c,
    border: "none",
    padding: "5px 11px",
    fontSize: 9,
    cursor: "pointer",
    fontWeight: 700,
    marginLeft: 4,
    fontFamily: t.mono,
    letterSpacing: "0.06em",
    transition: "opacity 0.15s",
  }}
  onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >{label}</button>
);

function Modal({ onClose, titulo, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.94)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:"#111", border:`1px solid ${t.border2}`, padding:32, minWidth:320, maxWidth:480, width:"100%" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontFamily: t.mono, fontSize:9, color: t.dim, letterSpacing:"0.1em", marginBottom:4 }}>// AÇÃO</div>
            <h3 style={{ color: t.accent, fontSize:16, fontWeight:900, fontFamily: t.cond, textTransform:"uppercase", letterSpacing:"0.05em" }}>{titulo}</h3>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color: t.muted, cursor:"pointer", fontSize:18, lineHeight:1, padding:4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TabelaUsuarios({ rows, onDeletar, onDesativar, onReativar }) {
  return (
    <table style={s.table}>
      <thead>
        <tr>{["ID","NOME","EMAIL","TIPO","SANGUE","NÍVEL","CIDADE","ONLINE","AÇÕES"].map(h =>
          <th key={h} style={s.th}>{h}</th>
        )}</tr>
      </thead>
      <tbody>
        {rows.map(u => (
          <tr key={u.id} style={{ transition:"background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#111"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <td style={s.td}><span style={{ color: t.dim, fontFamily: t.mono, fontSize:10 }}>#{u.id}</span></td>
            <td style={s.td}><span style={{ fontWeight:600, color:"#E0E0D8" }}>{u.nome_completo}</span></td>
            <td style={s.td}><span style={{ fontSize:11, color: t.muted, fontFamily: t.mono }}>{u.email}</span></td>
            <td style={s.td}><span style={{ color: t.accent, fontSize:10, fontFamily: t.mono, fontWeight:600 }}>{u.tipo}</span></td>
            <td style={s.td}><span style={{ fontWeight:700, color:"#E0E0D8" }}>{u.tipo_sangue || "—"}</span></td>
            <td style={s.td}><span style={{ color: t.muted, fontSize:11 }}>{u.nivel || "—"}</span></td>
            <td style={s.td}><span style={{ fontSize:11, color: t.dim }}>{u.cidade || "—"}</span></td>
            <td style={s.td}>
              <span style={{ color: u.online ? t.green : "#2A2A2A", fontSize:11, fontFamily: t.mono }}>
                {u.online ? "● ATIVO" : "○ OFF"}
              </span>
            </td>
            <td style={s.td}>
              {u.online
                ? <Btn bg="#1E1E1E" c="#888" label="DESATIVAR" onClick={() => onDesativar(u.id)} />
                : <Btn bg={t.green} c="#000" label="REATIVAR" onClick={() => onReativar(u.id)} />
              }
              <Btn bg={t.red} c="#fff" label="DELETAR" onClick={() => onDeletar(u.id)} />
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={9} style={{ ...s.td, color: t.dim, fontFamily: t.mono, fontSize:11, padding:"24px 14px" }}>NENHUM REGISTRO ENCONTRADO</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [aba, setAba]               = useState("pedidos");
  const [loading, setLoading]       = useState(false);
  const [pedidos, setPedidos]       = useState([]);
  const [doadores, setDoadores]     = useState([]);
  const [receptores, setReceptores] = useState([]);
  const [usuarios, setUsuarios]     = useState([]);
  const [doacoes, setDoacoes]       = useState([]);
  const [online, setOnline]         = useState([]);
  const [stats, setStats]           = useState(null);
  const [filtros, setFiltros]       = useState({ status:"Pendente", tipo_sangue:"", nivel:"", busca:"", ordem:"nome", idade_min:"", idade_max:"", tipo:"", online:"" });
  const [modalAprovar, setModalAprovar]     = useState(null);
  const [modalNotificar, setModalNotificar] = useState(null);
  const [notifResult, setNotifResult]       = useState(null);

  const api = useCallback(async (path, opts = {}) => {
    const token = await getToken();
    const isForm = opts.body instanceof FormData;
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(!isForm && { "Content-Type": "application/json" }),
        ...(opts.headers || {}),
      },
    });
    return res.json();
  }, [getToken]);

  const setFiltro = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => v && q.set(k, v));
      if (aba === "pedidos")    { const j = await api(`/admin/pedidos?${q}`);    if (j.success) { setPedidos(j.data); setStats(j.stats); } }
      else if (aba === "doadores")   { const j = await api(`/admin/doadores?${q}`);   if (j.success) setDoadores(j.data); }
      else if (aba === "receptores") { const j = await api(`/admin/receptores?${q}`); if (j.success) setReceptores(j.data); }
      else if (aba === "usuarios")   { const j = await api(`/admin/usuarios?${q}`);   if (j.success) { setUsuarios(j.data); setStats(j.stats); } }
      else if (aba === "doacoes")    { const j = await api(`/admin/doacoes?${q}`);    if (j.success) setDoacoes(j.data); }
      else if (aba === "online")     { const j = await api("/admin/online");           if (j.success) setOnline(j.data); }
      else if (aba === "stats")      { const j = await api("/admin/stats");            if (j.success) setStats(j.data); }
    } finally { setLoading(false); }
  }, [aba, filtros, api]);

  useEffect(() => { carregar(); }, [carregar]);

  const aprovar = async (id, nivel) => {
    await api(`/admin/pedidos/${id}/aprovar`, { method: "POST", body: JSON.stringify({ nivel }) });
    setPedidos(p => p.filter(u => u.id !== id));
    setModalAprovar(null);
  };

  const recusar = async (id) => {
    const motivo = prompt("Motivo da recusa:");
    if (!motivo) return;
    await api(`/admin/pedidos/${id}/reprovar`, { method: "POST", body: JSON.stringify({ motivo }) });
    setPedidos(p => p.filter(u => u.id !== id));
  };

  const verLaudo = async (id) => {
    const j = await api(`/urgencias/${id}/laudo`);
    if (j.success && j.url) {
      window.open(j.url.replace("http://localhost:5000", API), "_blank");
    } else {
      alert("Laudo não encontrado ou não disponível para este pedido.");
    }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Deletar permanentemente?")) return;
    await api(`/admin/usuarios/${id}`, { method: "DELETE" });
    [setUsuarios, setDoadores, setReceptores].forEach(fn => fn(u => u.filter(x => x.id !== id)));
  };

  const desativarUsuario = async (id) => {
    if (!window.confirm("Desativar conta?")) return;
    await api(`/admin/usuarios/${id}/desativar`, { method: "POST" });
    carregar();
  };

  const reativarUsuario = async (id) => {
    if (!window.confirm("Reativar conta?")) return;
    await api(`/admin/usuarios/${id}/reativar`, { method: "POST" });
    carregar();
  };

  const notificar = async (id, canal) => {
    setNotifResult(null);
    const j = await api(`/admin/pedidos/${id}/notificar`, { method: "POST", body: JSON.stringify({ canal }) });
    setNotifResult(j.stats || j);
  };

  const notificarRecorrencia = async () => {
    const canal = prompt("Canal (email / whatsapp / ambos):", "ambos");
    if (!canal) return;
    const j = await api("/admin/recorrencia/notificar", { method: "POST", body: JSON.stringify({ canal }) });
    alert(`Aptos: ${j.aptos} | Emails: ${j.enviados_email} | WhatsApps: ${j.enviados_whatsapp}`);
  };

  const aprovarDoacao = async (id) => {
    if (!window.confirm("Aprovar esta doação? O nível do doador será atualizado.")) return;
    const j = await api(`/admin/doacoes/${id}/aprovar`, { method: "POST" });
    if (j.success) { alert(`Doação aprovada! Novo nível: ${j.nivel}`); carregar(); }
    else alert("Erro: " + j.message);
  };

  const reprovarDoacao = async (id) => {
    if (!window.confirm("Reprovar esta doação?")) return;
    await api(`/admin/doacoes/${id}/reprovar`, { method: "POST" });
    carregar();
  };

  const ABAS = [
    { id:"pedidos", label:"PEDIDOS" },
    { id:"doadores", label:"DOADORES" },
    { id:"receptores", label:"RECEPTORES" },
    { id:"usuarios", label:"USUÁRIOS" },
    { id:"doacoes", label:"DOAÇÕES" },
    { id:"online", label:"ONLINE" },
    { id:"stats", label:"ESTATÍSTICAS" },
  ];

  const Tab = ({ id, label }) => (
    <button
      onClick={() => { setAba(id); setFiltros(f => ({ ...f, status: id === "pedidos" ? "Pendente" : "" })); }}
      style={{
        background: "none",
        border: "none",
        borderBottom: aba === id ? `2px solid ${t.accent}` : "2px solid transparent",
        color: aba === id ? t.accent : t.dim,
        padding: "14px 18px",
        cursor: "pointer",
        fontFamily: t.mono,
        fontSize: 10,
        whiteSpace: "nowrap",
        letterSpacing: "0.08em",
        transition: "color 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => { if (aba !== id) e.currentTarget.style.color = t.muted; }}
      onMouseLeave={e => { if (aba !== id) e.currentTarget.style.color = t.dim; }}
    >{label}</button>
  );

  const StatBoxes = ({ items }) => (
    <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
      {items.map(([l, v, c = t.accent]) => (
        <div key={l} style={{ ...s.statBox, borderColor: c === t.accent ? t.border : c + "33" }}>
          <div style={{ color: t.dim, fontSize:9, fontFamily: t.mono, marginBottom:8, letterSpacing:"0.1em" }}>{l}</div>
          <div style={{ fontSize:36, fontWeight:900, color: c, fontFamily: t.cond, lineHeight:1 }}>{v ?? 0}</div>
        </div>
      ))}
    </div>
  );

  const inputStyle = {
    ...s.input,
    ':focus': { borderColor: t.border2 },
  };

  const FilterBar = ({ children }) => (
    <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center", padding:"14px 16px", background:"#0D0D0D", border:`1px solid ${t.border}` }}>
      {children}
    </div>
  );

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #2A2A2A !important; outline: none; }
        tr:hover td { background: #0D0D0D; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #1E1E1E; }
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <Logo />
          <div style={s.navTag}>ADMIN_PANEL</div>
        </div>
        <button onClick={() => signOut()} style={{
          color: t.dim, background:"none", cursor:"pointer", fontSize:10,
          border:`1px solid ${t.border}`, padding:"5px 14px", fontFamily: t.mono,
          letterSpacing:"0.08em", transition:"color 0.15s, border-color 0.15s"
        }}
        onMouseEnter={e => { e.currentTarget.style.color = t.muted; e.currentTarget.style.borderColor = t.border2; }}
        onMouseLeave={e => { e.currentTarget.style.color = t.dim; e.currentTarget.style.borderColor = t.border; }}
        >SAIR</button>
      </nav>

      {/* TABS */}
      <div style={s.tabs}>
        {ABAS.map(a => <Tab key={a.id} id={a.id} label={a.label} />)}
      </div>

      {/* BODY */}
      <div style={s.body}>
        {loading && (
          <div style={{ color: t.dim, fontFamily: t.mono, fontSize:11, padding:"24px 0", letterSpacing:"0.1em" }}>
            CARREGANDO...
          </div>
        )}

        {/* PEDIDOS */}
        {aba === "pedidos" && !loading && (
          <>
            <FilterBar>
              <select style={s.select} value={filtros.status} onChange={e => setFiltro("status", e.target.value)}>
                <option value="">Todos</option>
                {["Pendente","Aprovada","Recusada","Desativado"].map(v => <option key={v}>{v}</option>)}
              </select>
              <select style={s.select} value={filtros.tipo_sangue} onChange={e => setFiltro("tipo_sangue", e.target.value)}>
                <option value="">Tipo sanguíneo</option>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select style={s.select} value={filtros.nivel} onChange={e => setFiltro("nivel", e.target.value)}>
                <option value="">Nível</option>
                {NIVEIS_URG.map(n => <option key={n}>{n}</option>)}
              </select>
              <input style={{ ...s.input, flex:1, minWidth:160 }} placeholder="Buscar paciente..." value={filtros.busca} onChange={e => setFiltro("busca", e.target.value)} />
              <button
                style={{ background: t.surface2, color: t.muted, border:`1px solid ${t.border2}`, padding:"8px 14px", fontSize:10, cursor:"pointer", fontFamily: t.mono, letterSpacing:"0.06em" }}
                onClick={notificarRecorrencia}>
                NOTIF. RECORRÊNCIA
              </button>
            </FilterBar>
            {stats && <StatBoxes items={[["TOTAL", stats.total], ["PENDENTES", stats.pendentes, "#C8F500"], ["APROVADAS", stats.aprovadas, "#44FF88"]]} />}
            <div style={{ overflowX:"auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["ID","PACIENTE / MOTIVO","SANGUE","NÍVEL","STATUS","CONTATO","DATA","AÇÕES"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {pedidos.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}><span style={{ color: t.dim, fontFamily: t.mono, fontSize:10 }}>#{u.id}</span></td>
                      <td style={s.td}>
                        <span style={{ fontWeight:600, color:"#E0E0D8" }}>{u.paciente_nome}</span>
                        <div style={{ fontSize:11, color: t.muted, marginTop:3 }}>{u.motivo}</div>
                      </td>
                      <td style={s.td}><span style={{ fontWeight:700, color: t.accent }}>{u.tipo_necessario}</span></td>
                      <td style={s.td}><Bdg cor={nivelCor[u.nivel_urgencia_sugerido] || t.dim} txt={u.nivel_urgencia_sugerido || "—"} /></td>
                      <td style={s.td}><Bdg cor={statusCor[u.status] || t.dim} txt={u.status} /></td>
                      <td style={s.td}><span style={{ fontSize:11, color: t.muted, fontFamily: t.mono }}>{u.contato_solicitante || "—"}</span></td>
                      <td style={s.td}><span style={{ fontSize:11, color: t.dim, fontFamily: t.mono }}>{u.criado_em ? new Date(u.criado_em).toLocaleDateString("pt-BR") : "—"}</span></td>
                      <td style={s.td}>
                        <Btn bg={t.surface2} c="#888" label="LAUDO" onClick={() => verLaudo(u.id)} />
                        {u.status === "Pendente" && <>
                          <Btn bg={t.accent} c="#000" label="APROVAR" onClick={() => setModalAprovar(u.id)} />
                          <Btn bg={t.red} c="#fff" label="RECUSAR" onClick={() => recusar(u.id)} />
                        </>}
                        {u.status === "Aprovada" && (
                          <Btn bg="#2244AA" c="#fff" label="NOTIFICAR" onClick={() => { setModalNotificar(u); setNotifResult(null); }} />
                        )}
                      </td>
                    </tr>
                  ))}
                  {pedidos.length === 0 && <tr><td colSpan={8} style={{ ...s.td, color: t.dim, fontFamily: t.mono, fontSize:11, padding:"24px 14px" }}>NENHUM PEDIDO ENCONTRADO</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* DOADORES */}
        {aba === "doadores" && !loading && (
          <>
            <FilterBar>
              <select style={s.select} value={filtros.tipo_sangue} onChange={e => setFiltro("tipo_sangue", e.target.value)}>
                <option value="">Tipo sanguíneo</option>{TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select style={s.select} value={filtros.nivel} onChange={e => setFiltro("nivel", e.target.value)}>
                <option value="">Nível</option>{NIVEIS_DOA.map(n => <option key={n}>{n}</option>)}
              </select>
              <select style={s.select} value={filtros.ordem} onChange={e => setFiltro("ordem", e.target.value)}>
                <option value="nome">A–Z</option>
                <option value="nivel">Por nível</option>
                <option value="ultima_doacao">Última doação</option>
              </select>
              <input style={{ ...s.input, flex:1 }} placeholder="Buscar cidade..." value={filtros.busca} onChange={e => setFiltro("busca", e.target.value)} />
            </FilterBar>
            <div style={{ overflowX:"auto" }}>
              <TabelaUsuarios rows={doadores} onDeletar={deletarUsuario} onDesativar={desativarUsuario} onReativar={reativarUsuario} />
            </div>
          </>
        )}

        {/* RECEPTORES */}
        {aba === "receptores" && !loading && (
          <>
            <FilterBar>
              <select style={s.select} value={filtros.tipo_sangue} onChange={e => setFiltro("tipo_sangue", e.target.value)}>
                <option value="">Tipo sanguíneo</option>{TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
              <input style={{ ...s.input, width:90 }} placeholder="Idade mín" type="number" value={filtros.idade_min} onChange={e => setFiltro("idade_min", e.target.value)} />
              <input style={{ ...s.input, width:90 }} placeholder="Idade máx" type="number" value={filtros.idade_max} onChange={e => setFiltro("idade_max", e.target.value)} />
              <select style={s.select} value={filtros.ordem} onChange={e => setFiltro("ordem", e.target.value)}>
                <option value="nome">A–Z</option>
                <option value="idade">Por idade</option>
              </select>
            </FilterBar>
            <div style={{ overflowX:"auto" }}>
              <TabelaUsuarios rows={receptores} onDeletar={deletarUsuario} onDesativar={desativarUsuario} onReativar={reativarUsuario} />
            </div>
          </>
        )}

        {/* USUÁRIOS */}
        {aba === "usuarios" && !loading && (
          <>
            <FilterBar>
              <select style={s.select} value={filtros.tipo} onChange={e => setFiltro("tipo", e.target.value)}>
                <option value="">Todos</option>
                <option value="DOADOR">Doadores</option>
                <option value="RECEPTOR">Receptores</option>
              </select>
              <select style={s.select} value={filtros.tipo_sangue} onChange={e => setFiltro("tipo_sangue", e.target.value)}>
                <option value="">Tipo sanguíneo</option>{TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select style={s.select} value={filtros.online} onChange={e => setFiltro("online", e.target.value)}>
                <option value="">Status</option>
                <option value="1">Ativas</option>
                <option value="0">Desativadas</option>
              </select>
              <input style={{ ...s.input, flex:1 }} placeholder="Buscar nome ou email..." value={filtros.busca} onChange={e => setFiltro("busca", e.target.value)} />
            </FilterBar>
            {stats && <StatBoxes items={[["TOTAL", stats.total], ["ATIVAS", stats.doadores, "#44FF88"], ["DESATIVADAS", stats.receptores, "#FF3333"], ["ONLINE", stats.online, "#C8F500"]]} />}
            <div style={{ overflowX:"auto" }}>
              <TabelaUsuarios rows={usuarios} onDeletar={deletarUsuario} onDesativar={desativarUsuario} onReativar={reativarUsuario} />
            </div>
          </>
        )}

        {/* DOAÇÕES */}
        {aba === "doacoes" && !loading && (
          <>
            <FilterBar>
              <input style={{ ...s.input, flex:1 }} placeholder="Buscar nome ou email..." value={filtros.busca} onChange={e => setFiltro("busca", e.target.value)} />
            </FilterBar>
            <div style={{ overflowX:"auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["ID","DOADOR","EMAIL","SANGUE","SEXO","DATA DOAÇÃO","STATUS","ATESTADO","AÇÕES"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {doacoes.map(d => (
                    <tr key={d.id}>
                      <td style={s.td}><span style={{ color: t.dim, fontFamily: t.mono, fontSize:10 }}>#{d.id}</span></td>
                      <td style={s.td}><span style={{ fontWeight:600, color:"#E0E0D8" }}>{d.nome_completo || "—"}</span></td>
                      <td style={s.td}><span style={{ fontSize:11, color: t.muted, fontFamily: t.mono }}>{d.doador_email}</span></td>
                      <td style={s.td}><span style={{ fontWeight:700, color: t.accent }}>{d.tipo_sangue || "—"}</span></td>
                      <td style={s.td}><span style={{ color: t.muted, fontSize:12 }}>{d.genero === "M" ? "Masculino" : d.genero === "F" ? "Feminino" : "—"}</span></td>
                      <td style={s.td}><span style={{ fontFamily: t.mono, fontSize:11, color: t.muted }}>{d.data_doacao || "—"}</span></td>
                      <td style={s.td}>
                        <Bdg
                          cor={d.status === "Aprovada" ? t.green : d.status === "Reprovada" ? t.red : t.accent}
                          txt={d.status || "Pendente"}
                        />
                      </td>
                      <td style={s.td}>
                        {d.atestado_url
                          ? <Btn bg={t.surface2} c="#888" label="VER" onClick={async () => {
                              const j = await api(`/doadores/atestado/${d.id}`);
                              if (j.success && j.url) window.open(j.url, "_blank");
                              else alert("Atestado não disponível.");
                            }} />
                          : <span style={{ color: t.border2, fontSize:11 }}>—</span>}
                      </td>
                      <td style={s.td}>
                        {(!d.status || d.status === "Pendente") && <>
                          <Btn bg={t.green} c="#000" label="APROVAR" onClick={() => aprovarDoacao(d.id)} />
                          <Btn bg={t.red} c="#fff" label="REPROVAR" onClick={() => reprovarDoacao(d.id)} />
                        </>}
                      </td>
                    </tr>
                  ))}
                  {doacoes.length === 0 && <tr><td colSpan={9} style={{ ...s.td, color: t.dim, fontFamily: t.mono, fontSize:11, padding:"24px 14px" }}>NENHUMA DOAÇÃO ENCONTRADA</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ONLINE */}
        {aba === "online" && !loading && (
          <div style={{ overflowX:"auto" }}>
            <TabelaUsuarios rows={online} onDeletar={deletarUsuario} onDesativar={desativarUsuario} onReativar={reativarUsuario} />
          </div>
        )}

        {/* STATS */}
        {aba === "stats" && !loading && stats && (
          <div>
            <div style={{ fontFamily: t.mono, fontSize:10, color: t.dim, letterSpacing:"0.1em", marginBottom:20 }}>// VISÃO_GERAL</div>
            <StatBoxes items={[
              ["DOADORES", stats.total_doadores],
              ["RECEPTORES", stats.total_receptores],
              ["PEDIDOS PENDENTES", stats.pedidos_pendentes, "#C8F500"],
              ["PEDIDOS APROVADOS", stats.pedidos_aprovados, "#44FF88"],
              ["DOAÇÕES DECLARADAS", stats.total_doacoes],
              ["ONLINE AGORA", stats.online, "#44FF88"],
            ]} />
            <div style={{ fontFamily: t.mono, fontSize:10, color: t.dim, letterSpacing:"0.1em", marginBottom:20 }}>// NÍVEIS_DE_DOADORES</div>
            <StatBoxes items={[
              ["BRONZE", stats.niveis?.bronze, "#CD7F32"],
              ["PRATA",  stats.niveis?.prata,  "#C0C0C0"],
              ["OURO",   stats.niveis?.ouro,   "#FFD700"],
            ]} />
          </div>
        )}
      </div>

      {/* MODAL APROVAR */}
      {modalAprovar && (
        <Modal onClose={() => setModalAprovar(null)} titulo="NÍVEL DE URGÊNCIA">
          <div style={{ display:"grid", gap:8 }}>
            {NIVEIS_URG.map(n => (
              <button key={n} onClick={() => aprovar(modalAprovar, n)}
                style={{ background: nivelCor[n], color:"#000", border:"none", padding:"13px 16px", cursor:"pointer", fontWeight:900, fontSize:13, fontFamily: t.cond, textTransform:"uppercase", letterSpacing:"0.05em", transition:"opacity 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >{n}</button>
            ))}
          </div>
        </Modal>
      )}

      {/* MODAL NOTIFICAR */}
      {modalNotificar && (
        <Modal onClose={() => { setModalNotificar(null); setNotifResult(null); }} titulo="NOTIFICAR DOADORES">
          <div style={{ background: t.surface2, border:`1px solid ${t.border}`, padding:"10px 14px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontFamily: t.mono, fontSize:10, color: t.muted }}>PEDIDO #{modalNotificar.id}</span>
            <span style={{ color: t.accent, fontFamily: t.cond, fontWeight:700, fontSize:14 }}>{modalNotificar.tipo_necessario}</span>
            <Bdg cor={nivelCor[modalNotificar.nivel_urgencia_sugerido] || t.dim} txt={modalNotificar.nivel_urgencia_sugerido || "—"} />
          </div>
          {!notifResult ? (
            <div style={{ display:"grid", gap:8 }}>
              {[["VIA EMAIL","email"],["VIA WHATSAPP","whatsapp"],["EMAIL + WHATSAPP","ambos"]].map(([l, c]) => (
                <button key={c} onClick={() => notificar(modalNotificar.id, c)}
                  style={{ background: t.accent, color:"#000", border:"none", padding:"12px 16px", cursor:"pointer", fontWeight:900, fontFamily: t.cond, fontSize:14, textTransform:"uppercase", letterSpacing:"0.05em", transition:"opacity 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >{l}</button>
              ))}
            </div>
          ) : (
            <div style={{ fontFamily: t.mono, fontSize:11, lineHeight:2 }}>
              <div style={{ color: t.accent, marginBottom:12, fontWeight:600, letterSpacing:"0.08em" }}>RESULTADO DA FILTRAGEM</div>
              <div style={{ display:"grid", gap:4 }}>
                {[
                  ["Compatíveis", notifResult.total_compativeis],
                  ["Elegíveis", notifResult.total_elegiveis],
                  ["Doações esperadas", notifResult.doacoes_esperadas],
                  ["Probabilidade média", notifResult.probabilidade_media ? (notifResult.probabilidade_media * 100).toFixed(0) + "%" : "—"],
                ].map(([l, v]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${t.border}`, paddingBottom:4 }}>
                    <span style={{ color: t.dim }}>{l}</span>
                    <span style={{ color: t.text, fontWeight:600 }}>{v ?? 0}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color: t.dim }}>Emails enviados</span>
                  <span style={{ color: t.green, fontWeight:700 }}>{notifResult.enviados_email}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color: t.dim }}>WhatsApps enviados</span>
                  <span style={{ color: t.green, fontWeight:700 }}>{notifResult.enviados_whatsapp}</span>
                </div>
                {notifResult.erros > 0 && (
                  <div style={{ color: t.red, marginTop:4 }}>Erros: {notifResult.erros}</div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
