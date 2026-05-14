import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Logo from "../components/Logo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TIPOS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export default function EditarPedido() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ motivo:"", tipo_necessario:"", idade:"", nivel_urgencia_sugerido:"" });
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [showDesativar, setShowDesativar] = useState(false);
  const [motivoDesativar, setMotivoDesativar] = useState("");

  useEffect(() => {
    const carregar = async () => {
      const token = await getToken();
      const res = await fetch(`${API}/urgencias/me`, { headers: { Authorization:`Bearer ${token}` } });
      const j = await res.json();
      if (j.success) {
        const pedido = j.data.find(p => String(p.id) === String(id));
        if (pedido) setForm({ motivo:pedido.motivo||"", tipo_necessario:pedido.tipo_necessario||"", idade:pedido.idade||"", nivel_urgencia_sugerido:pedido.nivel_urgencia_sugerido||"" });
      }
      setCarregando(false);
    };
    carregar();
  }, [id, getToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      Object.entries(form).forEach(([k,v]) => formData.append(k, v));
      if (e.target.laudo?.files[0]) formData.append("laudo", e.target.laudo.files[0]);

      const res = await fetch(`${API}/urgencias/${id}`, {
        method: "PUT",
        headers: { Authorization:`Bearer ${token}` },
        body: formData,
      });
      const j = await res.json();
      if (j.success) { alert("Pedido atualizado!"); navigate("/minhas-urgencias"); }
      else alert("Erro: " + j.message);
    } finally { setLoading(false); }
  };

  const handleDesativar = async () => {
    if (!motivoDesativar.trim()) { alert("Informe o motivo."); return; }
    const token = await getToken();
    const res = await fetch(`${API}/urgencias/${id}/desativar`, {
      method: "POST",
      headers: { Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
      body: JSON.stringify({ motivo: motivoDesativar }),
    });
    const j = await res.json();
    if (j.success) { alert("Pedido desativado."); navigate("/minhas-urgencias"); }
    else alert("Erro: " + j.message);
  };

  const inp = { background:"transparent", border:"none", borderBottom:"1px solid #2a2a2a", color:"#F5F5F0", fontFamily:"Barlow,sans-serif", fontSize:15, padding:"8px 0", outline:"none", width:"100%" };
  const sel = { ...inp, background:"#0A0A0A", cursor:"pointer", appearance:"none", WebkitAppearance:"none" };

  return (
    <div style={{ background:"#0A0A0A", color:"#F5F5F0", minHeight:"100vh", fontFamily:"Barlow,sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap');`}</style>

      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 32px", borderBottom:"1px solid #1a1a1a" }}>
        <Logo />
        <Link to="/minhas-urgencias" style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"#555", textDecoration:"none" }}>← VOLTAR</Link>
      </nav>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 32px" }}>
        <div style={{ width:"100%", maxWidth:480 }}>
          <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#C8F500", letterSpacing:"0.05em", marginBottom:12 }}>// EDITAR_PEDIDO</div>
          <h1 style={{ fontFamily:"Barlow Condensed,sans-serif", fontWeight:900, fontSize:40, textTransform:"uppercase", lineHeight:0.95, marginBottom:8 }}>
            ALTERAR <span style={{ color:"#C8F500" }}>PEDIDO</span>
          </h1>
          <div style={{ width:40, height:2, background:"#C8F500", marginBottom:32 }} />

          {carregando ? <p style={{ color:"#555", fontFamily:"JetBrains Mono,monospace", fontSize:11 }}>CARREGANDO...</p> : (
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column" }}>
              {[
                { label:"MOTIVO DA TRANSFUSÃO", key:"motivo", type:"text", placeholder:"Descreva o motivo" },
                { label:"IDADE DO PACIENTE",    key:"idade",  type:"number", placeholder:"Idade" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={{ borderTop:"1px solid #1a1a1a", padding:"16px 0" }}>
                  <label style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#555", letterSpacing:"0.05em", display:"block", marginBottom:8 }}>{label}</label>
                  <input style={inp} type={type} placeholder={placeholder} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} required />
                </div>
              ))}

              <div style={{ borderTop:"1px solid #1a1a1a", padding:"16px 0" }}>
                <label style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#555", letterSpacing:"0.05em", display:"block", marginBottom:8 }}>TIPO SANGUÍNEO NECESSÁRIO</label>
                <select style={sel} value={form.tipo_necessario} onChange={e=>setForm(f=>({...f,tipo_necessario:e.target.value}))} required>
                  <option value="">Selecione</option>
                  {TIPOS.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ borderTop:"1px solid #1a1a1a", padding:"16px 0" }}>
                <label style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#555", letterSpacing:"0.05em", display:"block", marginBottom:8 }}>NÍVEL DE URGÊNCIA</label>
                <select style={sel} value={form.nivel_urgencia_sugerido} onChange={e=>setForm(f=>({...f,nivel_urgencia_sugerido:e.target.value}))} required>
                  <option value="">Selecione</option>
                  {["BAIXA","MEDIA","ALTA","CRITICA"].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>

              <div style={{ borderTop:"1px solid #1a1a1a", padding:"16px 0" }}>
                <label style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#555", letterSpacing:"0.05em", display:"block", marginBottom:8 }}>COMPROVANTE / LAUDO (opcional)</label>
                <label style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                  <span style={{ background:"transparent", color:"#C8F500", border:"1px solid #C8F500", padding:"8px 16px", fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase" }}>ANEXAR</span>
                  <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color: fileName?"#C8F500":"#555" }}>{fileName||"PDF, JPG ou PNG"}</span>
                  <input type="file" name="laudo" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>setFileName(e.target.files[0]?.name||null)} />
                </label>
              </div>

              <button type="submit" disabled={loading}
                style={{ background:"#C8F500", color:"#0A0A0A", border:"none", padding:"16px 32px", fontFamily:"Barlow Condensed,sans-serif", fontWeight:900, fontSize:18, textTransform:"uppercase", cursor:"pointer", marginTop:32, width:"100%" }}>
                {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
              </button>
            </form>
          )}

          {/* Desativar pedido */}
          <div style={{ marginTop:32, borderTop:"1px solid #1a1a1a", paddingTop:24 }}>
            {!showDesativar ? (
              <button onClick={()=>setShowDesativar(true)}
                style={{ background:"transparent", color:"#FF3333", border:"1px solid #FF3333", padding:"12px 24px", fontFamily:"JetBrains Mono,monospace", fontSize:11, cursor:"pointer", textTransform:"uppercase", width:"100%" }}>
                DESATIVAR PEDIDO (IRREVERSÍVEL)
              </button>
            ) : (
              <div>
                <p style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"#FF3333", marginBottom:12 }}>AÇÃO IRREVERSÍVEL — informe o motivo:</p>
                <input
                  style={{ ...inp, borderBottom:"1px solid #FF3333", marginBottom:12 }}
                  placeholder="Motivo da desativação"
                  value={motivoDesativar}
                  onChange={e=>setMotivoDesativar(e.target.value)}
                />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleDesativar}
                    style={{ background:"#FF3333", color:"#fff", border:"none", padding:"12px 24px", fontFamily:"JetBrains Mono,monospace", fontSize:11, cursor:"pointer", flex:1 }}>
                    CONFIRMAR DESATIVAÇÃO
                  </button>
                  <button onClick={()=>setShowDesativar(false)}
                    style={{ background:"transparent", color:"#555", border:"1px solid #333", padding:"12px 24px", fontFamily:"JetBrains Mono,monospace", fontSize:11, cursor:"pointer" }}>
                    CANCELAR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
