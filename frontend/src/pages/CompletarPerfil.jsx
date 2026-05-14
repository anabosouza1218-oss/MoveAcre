/**
 * CompletarPerfil.jsx
 * Exibido logo após o cadastro. Deve aparecer de forma "obrigatória".
 * Correções aplicadas:
 *  - Campo de data de última doação NÃO é opcional: pergunta-se primeiro se já doou
 *  - Campos numéricos (idade, telefone) têm validação para não aceitar texto
 *  - Layout com aviso bem destacado de que o perfil está incompleto
 */
import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const TIPOS_SANGUE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CIDADES_AC = [
  "Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá",
  "Feijó", "Brasileia", "Epitaciolândia", "Xapuri", "Senador Guiomard",
  "Plácido de Castro", "Acrelândia", "Bujari", "Porto Acre",
  "Capixaba", "Rodrigues Alves", "Mâncio Lima", "Marechal Thaumaturgo",
  "Porto Walter", "Santa Rosa do Purus", "Jordão", "Outra",
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cp-root {
    background: #0A0A0A;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 40px 20px 60px;
  }

  .cp-alert-banner {
    width: 100%;
    max-width: 540px;
    background: rgba(200,245,0,0.08);
    border: 1px solid rgba(200,245,0,0.3);
    border-left: 4px solid #C8F500;
    padding: 16px 20px;
    margin-bottom: 32px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .cp-alert-icon { font-size: 20px; flex-shrink: 0; }

  .cp-alert-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cp-alert-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
    color: #C8F500;
    letter-spacing: 0.05em;
  }

  .cp-alert-sub {
    font-size: 13px;
    color: #888;
    line-height: 1.5;
  }

  .cp-logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 22px;
    color: #C8F500;
    letter-spacing: 0.1em;
    margin-bottom: 32px;
    text-transform: uppercase;
    width: 100%;
    max-width: 540px;
  }

  .cp-card {
    background: #0D0D0D;
    border: 1px solid #1a1a1a;
    width: 100%;
    max-width: 540px;
    padding: 40px;
  }

  .cp-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .cp-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 32px;
    text-transform: uppercase;
    color: #F5F5F0;
    margin-bottom: 6px;
    line-height: 1;
  }

  .cp-subtitle {
    font-size: 14px;
    color: #555;
    margin-bottom: 32px;
    line-height: 1.5;
  }

  .cp-section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 16px;
    margin-top: 28px;
    padding-bottom: 8px;
    border-bottom: 1px solid #111;
  }

  .cp-field {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .cp-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cp-required {
    color: #C8F500;
    font-size: 12px;
  }

  .cp-input, .cp-select {
    background: #111;
    border: 1px solid #222;
    color: #F5F5F0;
    padding: 12px 16px;
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 0;
  }

  .cp-input:focus, .cp-select:focus { border-color: #C8F500; }
  .cp-input.error, .cp-select.error { border-color: #FF4444; }
  .cp-input:disabled { opacity: 0.4; cursor: not-allowed; }

  .cp-error-msg {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #FF4444;
    letter-spacing: 0.05em;
  }

  .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .cp-radio-group {
    display: flex;
    gap: 12px;
  }

  .cp-radio-btn {
    flex: 1;
    background: #111;
    border: 1px solid #222;
    color: #888;
    padding: 12px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: 0.15s;
    text-align: center;
  }

  .cp-radio-btn.active {
    background: rgba(200,245,0,0.08);
    border-color: #C8F500;
    color: #C8F500;
  }

  .cp-radio-btn:hover { border-color: #333; color: #F5F5F0; }
  .cp-radio-btn.active:hover { border-color: #C8F500; }

  .cp-type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .cp-type-btn {
    background: #111;
    border: 1px solid #222;
    color: #888;
    padding: 12px 8px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 18px;
    cursor: pointer;
    transition: 0.15s;
    text-align: center;
  }

  .cp-type-btn.active {
    background: rgba(200,245,0,0.08);
    border-color: #C8F500;
    color: #C8F500;
  }

  .cp-doacao-pergunta {
    background: #111;
    border: 1px solid #1a1a1a;
    padding: 20px;
    margin-bottom: 8px;
  }

  .cp-doacao-pergunta-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 17px;
    text-transform: uppercase;
    color: #F5F5F0;
    margin-bottom: 4px;
  }

  .cp-doacao-pergunta-sub {
    font-size: 13px;
    color: #555;
    margin-bottom: 16px;
  }

  .cp-date-reveal {
    background: rgba(200,245,0,0.04);
    border: 1px solid rgba(200,245,0,0.15);
    padding: 16px;
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cp-date-reveal-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .cp-btn {
    width: 100%;
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 18px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 22px;
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: 0.15s;
    margin-top: 32px;
  }

  .cp-btn:hover:not(:disabled) { background: #d4ff00; }
  .cp-btn:disabled { background: #333; color: #666; cursor: not-allowed; }

  .cp-global-error {
    background: rgba(255,68,68,0.08);
    border: 1px solid rgba(255,68,68,0.3);
    border-left: 3px solid #FF4444;
    padding: 12px 16px;
    margin-top: 16px;
    font-size: 13px;
    color: #FF6666;
  }

  .cp-select-wrapper { position: relative; }
  .cp-select-wrapper::after {
    content: '▾';
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #555;
    pointer-events: none;
    font-size: 12px;
  }
`;

export default function CompletarPerfil() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome_completo: "",
    tipo_sangue: "",
    genero: "",
    telefone: "",
    cidade: "",
    idade: "",
    tipo: "DOADOR",
  });

  // Campo de doação anterior separado (lógica obrigatória)
  const [jaDoou, setJaDoou] = useState(null); // null = não respondido, true/false
  const [ultimaDoacao, setUltimaDoacao] = useState("");

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showAviso, setShowAviso] = useState(true);

  const email = user?.primaryEmailAddress?.emailAddress || "";

  // ── Validações ────────────────────────────────────────────────────────────

  const validateTelefone = (val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  };

  const validateIdade = (val) => {
    const n = Number(val);
    return Number.isInteger(n) && n >= 16 && n <= 69;
  };

  const handleTelefone = (e) => {
    // Aceita apenas dígitos e formatação
    const raw = e.target.value.replace(/[^\d\s\(\)\-\+]/g, "");
    setForm(f => ({ ...f, telefone: raw }));
    setErrors(er => ({ ...er, telefone: "" }));
  };

  const handleIdade = (e) => {
    // Aceita apenas dígitos
    const raw = e.target.value.replace(/\D/g, "");
    setForm(f => ({ ...f, idade: raw }));
    setErrors(er => ({ ...er, idade: "" }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};
    if (!form.nome_completo || form.nome_completo.trim().length < 3)
      errs.nome_completo = "Informe seu nome completo.";
    if (!form.genero) errs.genero = "Selecione seu gênero.";
    if (!form.telefone || !validateTelefone(form.telefone))
      errs.telefone = "Informe um telefone válido com DDD (ex: 68 99999-0000).";
    if (!form.cidade) errs.cidade = "Selecione sua cidade.";
    if (!form.idade)
      errs.idade = "Informe sua idade.";
    else if (!validateIdade(form.idade))
      errs.idade = "A idade deve estar entre 16 e 69 anos.";
    else if (parseInt(form.idade) < 16)
      errs.idade = "É necessário ter pelo menos 16 anos para se cadastrar.";

    // Doação anterior: a pergunta é obrigatória
    if (jaDoou === null) errs.jaDoou = "Responda se já doou sangue antes.";
    // Se respondeu SIM, data é obrigatória
    if (jaDoou === true && !ultimaDoacao)
      errs.ultimaDoacao = "Informe a data da sua última doação.";
    // Data não pode ser no futuro
    if (ultimaDoacao && new Date(ultimaDoacao) > new Date())
      errs.ultimaDoacao = "A data não pode ser no futuro.";

    if (!aceitouTermos)
      errs.termos = "Você precisa aceitar os Termos e a Política de Privacidade.";

    return errs;
  };

  const handleSubmit = async () => {
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const resultado = await apiFetch(
        "/doadores/me",
        {
          method: "PUT",
          body: JSON.stringify({
            email,
            nome_completo: form.nome_completo.trim(),
            tipo_sangue: form.tipo_sangue || null,
            genero: form.genero,
            telefone: form.telefone.replace(/\D/g, ""),
            cidade: form.cidade,
            idade: form.idade ? parseInt(form.idade) : null,
            tipo: form.tipo,
            ultima_doacao: jaDoou === true ? ultimaDoacao : null,
            termos_aceitos: aceitouTermos,
          }),
        },
        getToken
      );

      // Só redireciona se o backend confirmou que o perfil foi salvo
      if (resultado.perfil_completo) {
        navigate("/", { replace: true });
      } else {
        setServerError("Perfil salvo parcialmente. Verifique os campos e tente novamente.");
      }
    } catch (e) {
      setServerError(e.message || "Erro ao salvar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="cp-root">
      <style>{styles}</style>

      {/* Modal de aviso inicial */}
      {showAviso && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div style={{ background:'#0D0D0D', border:'1px solid #222', borderLeft:'4px solid #C8F500', padding:'40px', maxWidth:'480px', width:'100%' }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'10px', color:'#C8F500', letterSpacing:'0.1em', marginBottom:'16px' }}>// AVISO IMPORTANTE</div>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'28px', textTransform:'uppercase', color:'#F5F5F0', marginBottom:'20px', lineHeight:1 }}>
              Antes de continuar
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px' }}>
              <p style={{ fontSize:'13px', color:'#888', lineHeight:1.7, borderLeft:'2px solid #333', paddingLeft:'12px' }}>
                O MOVEACRE é uma plataforma de <strong style={{color:'#F5F5F0'}}>gestão e envio de notificações</strong>. Não somos um serviço de saúde e não temos vínculo direto com o Hemoacre ou qualquer hemocentro.
              </p>
              <p style={{ fontSize:'13px', color:'#888', lineHeight:1.7, borderLeft:'2px solid #333', paddingLeft:'12px' }}>
                <strong style={{color:'#F5F5F0'}}>Não garantimos a efetivação de doações.</strong> Ao receber uma notificação, o doador decide livremente se vai ou não ao Hemoacre. A doação ocorre exclusivamente nas dependências do hemocentro.
              </p>
              <p style={{ fontSize:'13px', color:'#888', lineHeight:1.7, borderLeft:'2px solid #333', paddingLeft:'12px' }}>
                Ao continuar, você confirma que leu e aceita nossos{' '}
                <a href="/termos" target="_blank" style={{color:'#C8F500'}}>Termos de Uso</a>
                {' '}e nossa{' '}
                <a href="/privacidade" target="_blank" style={{color:'#C8F500'}}>Política de Privacidade</a>.
              </p>
            </div>
            <button
              onClick={() => setShowAviso(false)}
              style={{ width:'100%', background:'#C8F500', color:'#0A0A0A', border:'none', padding:'16px', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'18px', textTransform:'uppercase', cursor:'pointer' }}
            >
              ENTENDI, CONTINUAR
            </button>
          </div>
        </div>
      )}

      <div className="cp-logo">MOVEACRE</div>

      {/* Banner de alerta obrigatório */}
      <div className="cp-alert-banner">
        <span className="cp-alert-icon">!</span>
        <div className="cp-alert-text">
          <span className="cp-alert-title">Complete seu cadastro para continuar</span>
          <span className="cp-alert-sub">
            Sem essas informações não conseguimos conectar você a pedidos de sangue compatíveis.
            Leva menos de 2 minutos.
          </span>
        </div>
      </div>

      <div className="cp-card">
        <div className="cp-eyebrow">// Perfil do doador</div>
        <h1 className="cp-title">Complete seu perfil</h1>
        <p className="cp-subtitle">
          Olá, {user?.firstName || "doador"}! Precisamos de mais algumas informações.
        </p>

        {/* Nome completo */}
        <div className="cp-section-label">Seus dados <span className="cp-required">*</span></div>
        <div className="cp-field">
          <label className="cp-label">Nome completo <span className="cp-required">*</span></label>
          <input
            type="text"
            placeholder="Ex: João da Silva"
            className={`cp-input ${errors.nome_completo ? "error" : ""}`}
            value={form.nome_completo}
            onChange={e => { setForm(f => ({ ...f, nome_completo: e.target.value })); setErrors(er => ({ ...er, nome_completo: "" })); }}
          />
          {errors.nome_completo && <span className="cp-error-msg">{errors.nome_completo}</span>}
        </div>

        {/* Tipo de usuário */}
        <div className="cp-section-label">Você é:</div>
        <div className="cp-field">
          <div className="cp-radio-group">
            {["DOADOR", "RECEPTOR"].map(t => (
              <button
                key={t}
                className={`cp-radio-btn ${form.tipo === t ? "active" : ""}`}
                onClick={() => setForm(f => ({ ...f, tipo: t }))}
              >
                {t === "DOADOR" ? "Quero Doar" : "Preciso de Sangue"}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo sanguíneo */}
        <div className="cp-section-label">Informações médicas</div>

        <div className="cp-field">
          <label className="cp-label">Tipo Sanguíneo <span style={{color:'#555', fontSize:'9px'}}>(opcional — pode preencher depois)</span></label>
          <div className="cp-type-grid">
            {TIPOS_SANGUE.map(t => (
              <button
                key={t}
                className={`cp-type-btn ${form.tipo_sangue === t ? "active" : ""}`}
                onClick={() => { setForm(f => ({ ...f, tipo_sangue: t })); setErrors(e => ({ ...e, tipo_sangue: "" })); }}
              >
                {t}
              </button>
            ))}
          </div>
          {errors.tipo_sangue && <span className="cp-error-msg">{errors.tipo_sangue}</span>}
        </div>

        {/* Gênero */}
        <div className="cp-field">
          <label className="cp-label">Gênero <span className="cp-required">*</span></label>
          <div className="cp-radio-group">
            {[["M", "Masculino"], ["F", "Feminino"]].map(([val, label]) => (
              <button
                key={val}
                className={`cp-radio-btn ${form.genero === val ? "active" : ""}`}
                onClick={() => { setForm(f => ({ ...f, genero: val })); setErrors(e => ({ ...e, genero: "" })); }}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.genero && <span className="cp-error-msg">{errors.genero}</span>}
        </div>

        {/* Doação anterior — pergunta obrigatória */}
        <div className="cp-section-label">Histórico de doação <span className="cp-required">*</span></div>

        <div className="cp-field">
          <div className="cp-doacao-pergunta">
            <div className="cp-doacao-pergunta-title">Você já doou sangue antes?</div>
            <div className="cp-doacao-pergunta-sub">
              Isso define quando você pode doar novamente (60 dias para homens, 90 para mulheres).
            </div>
            <div className="cp-radio-group">
              <button
                className={`cp-radio-btn ${jaDoou === true ? "active" : ""}`}
                onClick={() => { setJaDoou(true); setErrors(e => ({ ...e, jaDoou: "" })); }}
              >
                Sim, já doei
              </button>
              <button
                className={`cp-radio-btn ${jaDoou === false ? "active" : ""}`}
                onClick={() => { setJaDoou(false); setUltimaDoacao(""); setErrors(e => ({ ...e, jaDoou: "", ultimaDoacao: "" })); }}
              >
                ✕ Não, primeira vez
              </button>
            </div>

            {/* Campo de data aparece apenas se já doou */}
            {jaDoou === true && (
              <div className="cp-date-reveal">
                <span className="cp-date-reveal-label">Data da última doação <span className="cp-required">*</span></span>
                <input
                  type="date"
                  className={`cp-input ${errors.ultimaDoacao ? "error" : ""}`}
                  value={ultimaDoacao}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={e => { setUltimaDoacao(e.target.value); setErrors(er => ({ ...er, ultimaDoacao: "" })); }}
                />
                {errors.ultimaDoacao && <span className="cp-error-msg">{errors.ultimaDoacao}</span>}
              </div>
            )}
          </div>
          {errors.jaDoou && <span className="cp-error-msg">{errors.jaDoou}</span>}
        </div>

        {/* Contato e localização */}
        <div className="cp-section-label">Contato e localização <span className="cp-required">*</span></div>

        <div className="cp-field">
          <label className="cp-label">Telefone / WhatsApp <span className="cp-required">*</span></label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="(68) 99999-0000"
            className={`cp-input ${errors.telefone ? "error" : ""}`}
            value={form.telefone}
            onChange={handleTelefone}
          />
          {errors.telefone && <span className="cp-error-msg">{errors.telefone}</span>}
        </div>

        <div className="cp-field">
          <label className="cp-label">Cidade <span className="cp-required">*</span></label>
          <div className="cp-select-wrapper">
            <select
              className={`cp-select ${errors.cidade ? "error" : ""}`}
              value={form.cidade}
              onChange={e => { setForm(f => ({ ...f, cidade: e.target.value })); setErrors(er => ({ ...er, cidade: "" })); }}
            >
              <option value="">Selecione sua cidade</option>
              {CIDADES_AC.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {errors.cidade && <span className="cp-error-msg">{errors.cidade}</span>}
        </div>

        <div className="cp-field">
          <label className="cp-label">Idade <span className="cp-required">*</span> <span style={{color:'#555', fontSize:'9px'}}>(entre 16 e 69 anos)</span></label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex: 28"
            className={`cp-input ${errors.idade ? "error" : ""}`}
            value={form.idade}
            onChange={handleIdade}
            maxLength={3}
          />
          {errors.idade && <span className="cp-error-msg">{errors.idade}</span>}
        </div>

        {serverError && <div className="cp-global-error">{serverError}</div>}

        {/* Aceite dos termos */}
        <div style={{ marginTop:24, display:"flex", alignItems:"flex-start", gap:12 }}>
          <input
            type="checkbox"
            id="termos"
            checked={aceitouTermos}
            onChange={e => setAceitouTermos(e.target.checked)}
            style={{ marginTop:2, accentColor:"#C8F500", width:16, height:16, flexShrink:0, cursor:"pointer" }}
          />
          <label htmlFor="termos" style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"#555", lineHeight:1.6, cursor:"pointer" }}>
            Li e aceito os{" "}
            <a href="/termos" target="_blank" style={{ color:"#C8F500", textDecoration:"none" }}>Termos e Condições</a>
            {" "}e a{" "}
            <a href="/privacidade" target="_blank" style={{ color:"#C8F500", textDecoration:"none" }}>Política de Privacidade</a>
            {" "}do MOVEACRE, e <strong style={{color:"#888"}}>consinto com o tratamento dos meus dados de saúde</strong> para fins de notificação de doação de sangue.
          </label>
        </div>
        {errors.termos && <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#FF4444", letterSpacing:"0.05em" }}>{errors.termos}</span>}

        <button
          className="cp-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "SALVANDO..." : "SALVAR E CONTINUAR"}
        </button>
      </div>
    </div>
  );
}
