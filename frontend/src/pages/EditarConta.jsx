import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";
import Logo from "../components/Logo";

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

  .ec-root {
    background: #0A0A0A;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .ec-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 32px;
    border-bottom: 1px solid #111;
  }

  .ec-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #555;
    letter-spacing: 0.05em;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;
  }
  .ec-back:hover { color: #C8F500; }

  .ec-body {
    flex: 1;
    padding: 48px 32px;
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
  }

  .ec-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    letter-spacing: 0.12em;
    margin-bottom: 12px;
  }

  .ec-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 44px;
    text-transform: uppercase;
    line-height: 0.95;
    margin-bottom: 6px;
  }

  .ec-title span { color: #C8F500; }

  .ec-divider {
    width: 40px;
    height: 2px;
    background: #C8F500;
    margin-bottom: 40px;
  }

  .ec-section-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 2px;
    padding-bottom: 10px;
    border-bottom: 1px solid #111;
    margin-top: 36px;
  }

  .ec-field-row {
    border-bottom: 1px solid #111;
    transition: background 0.15s;
  }

  .ec-field-row:last-child { border-bottom: none; }

  .ec-field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 0;
    cursor: default;
  }

  .ec-field-left {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .ec-field-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .ec-field-value {
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #F5F5F0;
  }

  .ec-field-value.accent { color: #C8F500; }
  .ec-field-value.empty { color: #333; font-style: italic; font-size: 13px; }

  .ec-edit-btn {
    background: transparent;
    border: 1px solid #222;
    color: #555;
    padding: 7px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.15s;
    flex-shrink: 0;
  }

  .ec-edit-btn:hover {
    border-color: #C8F500;
    color: #C8F500;
  }

  .ec-edit-btn.active {
    border-color: #333;
    color: #333;
  }

  .ec-editor {
    background: #0D0D0D;
    border: 1px solid #1a1a1a;
    border-left: 2px solid #C8F500;
    padding: 20px 20px 20px 20px;
    margin-bottom: 16px;
    animation: slideDown 0.15s ease-out;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ec-input, .ec-select {
    background: #111;
    border: 1px solid #222;
    color: #F5F5F0;
    padding: 11px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 0;
  }

  .ec-input:focus, .ec-select:focus { border-color: #C8F500; }
  .ec-input.error { border-color: #FF4444; }

  .ec-select-wrapper { position: relative; }
  .ec-select-wrapper::after {
    content: '▾';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #555;
    pointer-events: none;
    font-size: 11px;
  }

  .ec-radio-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ec-radio-btn {
    background: #111;
    border: 1px solid #222;
    color: #888;
    padding: 10px 16px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.15s;
  }

  .ec-radio-btn.active {
    background: rgba(200,245,0,0.08);
    border-color: #C8F500;
    color: #C8F500;
  }

  .ec-type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .ec-type-btn {
    background: #111;
    border: 1px solid #222;
    color: #888;
    padding: 11px 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 17px;
    cursor: pointer;
    transition: 0.15s;
    text-align: center;
  }

  .ec-type-btn.active {
    background: rgba(200,245,0,0.08);
    border-color: #C8F500;
    color: #C8F500;
  }

  .ec-editor-actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
  }

  .ec-save-btn {
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 10px 28px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 16px;
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: 0.15s;
  }

  .ec-save-btn:hover:not(:disabled) { background: #d4ff00; }
  .ec-save-btn:disabled { background: #222; color: #555; cursor: not-allowed; }

  .ec-cancel-btn {
    background: transparent;
    color: #555;
    border: 1px solid #222;
    padding: 10px 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.15s;
  }

  .ec-cancel-btn:hover { color: #F5F5F0; border-color: #444; }

  .ec-error-msg {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #FF4444;
    margin-top: 6px;
  }

  .ec-success-toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: #C8F500;
    color: #0A0A0A;
    padding: 14px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    z-index: 1000;
    animation: toastIn 0.2s ease-out;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ec-danger-section {
    margin-top: 48px;
    border: 1px solid #1a1a1a;
    padding: 24px;
  }

  .ec-danger-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 12px;
  }

  .ec-danger-text {
    font-size: 13px;
    color: #444;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .ec-danger-btn {
    background: transparent;
    color: #cc2222;
    border: 1px solid #2a1111;
    padding: 10px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.15s;
    letter-spacing: 0.05em;
  }

  .ec-danger-btn:hover { background: #cc2222; color: #fff; border-color: #cc2222; }

  .ec-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #333;
    letter-spacing: 0.1em;
  }

  @media (max-width: 600px) {
    .ec-nav { padding: 14px 20px; }
    .ec-body { padding: 32px 20px; }
    .ec-title { font-size: 34px; }
    .ec-type-grid { grid-template-columns: repeat(4, 1fr); }
    .ec-success-toast { right: 16px; left: 16px; bottom: 20px; }
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(key, value) {
  if (!value || value === "" || value === "Nao cadastrado") return null;
  if (key === "ultima_doacao" && value) return value.slice(0, 10);
  return value;
}

function displayLabel(key) {
  const map = {
    nome_completo: "Nome completo",
    tipo_sangue: "Tipo sanguíneo",
    genero: "Gênero",
    telefone: "Telefone / WhatsApp",
    cidade: "Cidade",
    idade: "Idade",
    tipo: "Perfil",
    ultima_doacao: "Última doação",
  };
  return map[key] || key;
}

// ── Editores inline por campo ─────────────────────────────────────────────────

function EditorNome({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value || "");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!v.trim() || v.trim().length < 3) { setErr("Mínimo 3 caracteres."); return; }
    onSave({ nome_completo: v.trim() });
  };
  return (
    <div className="ec-editor">
      <input
        className={`ec-input ${err ? "error" : ""}`}
        value={v}
        onChange={e => { setV(e.target.value); setErr(""); }}
        placeholder="Seu nome completo"
        autoFocus
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      {err && <div className="ec-error-msg">{err}</div>}
      <Actions onSave={submit} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function EditorTipoSangue({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value || "");
  const [err, setErr] = useState("");
  return (
    <div className="ec-editor">
      <div className="ec-type-grid">
        {TIPOS_SANGUE.map(t => (
          <button
            key={t}
            className={`ec-type-btn ${v === t ? "active" : ""}`}
            onClick={() => { setV(t); setErr(""); }}
          >{t}</button>
        ))}
      </div>
      {err && <div className="ec-error-msg">{err}</div>}
      <Actions onSave={() => {
        if (!v) { setErr("Selecione um tipo sanguíneo."); return; }
        onSave({ tipo_sangue: v });
      }} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function EditorGenero({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value || "");
  const [err, setErr] = useState("");
  return (
    <div className="ec-editor">
      <div className="ec-radio-group">
        {[["M", "Masculino"], ["F", "Feminino"]].map(([val, label]) => (
          <button
            key={val}
            className={`ec-radio-btn ${v === val ? "active" : ""}`}
            onClick={() => { setV(val); setErr(""); }}
          >{label}</button>
        ))}
      </div>
      {err && <div className="ec-error-msg">{err}</div>}
      <Actions onSave={() => {
        if (!v) { setErr("Selecione um gênero."); return; }
        onSave({ genero: v });
      }} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function EditorTelefone({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value || "");
  const [err, setErr] = useState("");
  const submit = () => {
    const digits = v.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) { setErr("Telefone inválido. Use DDD + número (ex: 68 99999-0000)."); return; }
    onSave({ telefone: digits });
  };
  return (
    <div className="ec-editor">
      <input
        className={`ec-input ${err ? "error" : ""}`}
        type="tel"
        inputMode="numeric"
        value={v}
        onChange={e => { setV(e.target.value.replace(/[^\d\s()\-+]/g, "")); setErr(""); }}
        placeholder="(68) 99999-0000"
        autoFocus
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      {err && <div className="ec-error-msg">{err}</div>}
      <Actions onSave={submit} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function EditorCidade({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value || "");
  const [err, setErr] = useState("");
  return (
    <div className="ec-editor">
      <div className="ec-select-wrapper">
        <select
          className={`ec-select ${err ? "error" : ""}`}
          value={v}
          onChange={e => { setV(e.target.value); setErr(""); }}
        >
          <option value="">Selecione sua cidade</option>
          {CIDADES_AC.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {err && <div className="ec-error-msg">{err}</div>}
      <Actions onSave={() => {
        if (!v) { setErr("Selecione uma cidade."); return; }
        onSave({ cidade: v });
      }} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function EditorIdade({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value ? String(value) : "");
  const [err, setErr] = useState("");
  const submit = () => {
    const n = parseInt(v);
    if (!v || isNaN(n) || n < 16 || n > 100) { setErr("Informe uma idade entre 16 e 100 anos."); return; }
    onSave({ idade: n });
  };
  return (
    <div className="ec-editor">
      <input
        className={`ec-input ${err ? "error" : ""}`}
        type="text"
        inputMode="numeric"
        value={v}
        onChange={e => { setV(e.target.value.replace(/\D/g, "")); setErr(""); }}
        placeholder="Ex: 28"
        maxLength={3}
        autoFocus
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      {err && <div className="ec-error-msg">{err}</div>}
      <Actions onSave={submit} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function EditorTipo({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value || "DOADOR");
  return (
    <div className="ec-editor">
      <div className="ec-radio-group">
        {[["DOADOR", "Quero Doar"], ["RECEPTOR", "Preciso de Sangue"]].map(([val, label]) => (
          <button
            key={val}
            className={`ec-radio-btn ${v === val ? "active" : ""}`}
            onClick={() => setV(val)}
          >{label}</button>
        ))}
      </div>
      <Actions onSave={() => onSave({ tipo: v })} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function EditorUltimaDoacao({ value, onSave, onCancel, saving }) {
  const [v, setV] = useState(value ? value.slice(0, 10) : "");
  const [err, setErr] = useState("");
  const submit = () => {
    if (v && new Date(v) > new Date()) { setErr("A data não pode ser no futuro."); return; }
    onSave({ ultima_doacao: v || null });
  };
  return (
    <div className="ec-editor">
      <input
        className={`ec-input ${err ? "error" : ""}`}
        type="date"
        value={v}
        max={new Date().toISOString().split("T")[0]}
        onChange={e => { setV(e.target.value); setErr(""); }}
        autoFocus
      />
      {err && <div className="ec-error-msg">{err}</div>}
      <Actions onSave={submit} onCancel={onCancel} saving={saving} />
    </div>
  );
}

function Actions({ onSave, onCancel, saving }) {
  return (
    <div className="ec-editor-actions">
      <button className="ec-save-btn" onClick={onSave} disabled={saving}>
        {saving ? "SALVANDO..." : "SALVAR"}
      </button>
      <button className="ec-cancel-btn" onClick={onCancel}>CANCELAR</button>
    </div>
  );
}

// ── Mapa de editores ──────────────────────────────────────────────────────────

const EDITORS = {
  nome_completo: EditorNome,
  tipo_sangue: EditorTipoSangue,
  genero: EditorGenero,
  telefone: EditorTelefone,
  cidade: EditorCidade,
  idade: EditorIdade,
  tipo: EditorTipo,
  ultima_doacao: EditorUltimaDoacao,
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function EditarConta() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null); // qual campo está aberto
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;
    apiFetch("/doadores/me", {}, getToken)
      .then(json => { setPerfil(json.data || {}); setLoading(false); })
      .catch(() => { setPerfil({}); setLoading(false); });
  }, [isLoaded, user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Salva apenas o campo alterado, mantendo todos os outros intactos
  const handleSave = async (campo, novoValor) => {
    setSaving(true);
    try {
      const payload = {
        nome_completo: perfil.nome_completo,
        tipo_sangue: perfil.tipo_sangue,
        genero: perfil.genero,
        telefone: perfil.telefone,
        cidade: perfil.cidade,
        idade: perfil.idade,
        tipo: perfil.tipo,
        ultima_doacao: perfil.ultima_doacao || perfil.data_ultima_doacao || null,
        termos_aceitos: perfil.termos_aceitos ?? true,
        ...novoValor, // sobrescreve só o campo editado
      };

      await apiFetch("/doadores/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      }, getToken);

      // Atualiza estado local sem nova requisição
      setPerfil(prev => ({ ...prev, ...novoValor }));
      setEditando(null);
      showToast("✓ " + displayLabel(campo) + " atualizado");
    } catch (err) {
      showToast("Erro: " + (err.message || "Tente novamente"));
    } finally {
      setSaving(false);
    }
  };

  const handleDesativar = async () => {
    if (!window.confirm("Tem certeza? Sua conta será desativada. Você pode reativá-la depois fazendo login novamente.")) return;
    try {
      await apiFetch("/doadores/desativar", { method: "POST" }, getToken);
      navigate("/");
    } catch (err) {
      showToast("Erro ao desativar conta.");
    }
  };

  // ── Campos a exibir com seus grupos ──────────────────────────────────────

  const sections = [
    {
      title: "Identidade",
      fields: [
        { key: "nome_completo", accent: false },
        { key: "tipo", accent: true },
      ],
    },
    {
      title: "Saúde",
      fields: [
        { key: "tipo_sangue", accent: true },
        { key: "genero", accent: false },
        { key: "idade", accent: false },
        { key: "ultima_doacao", accent: false },
      ],
    },
    {
      title: "Contato",
      fields: [
        { key: "telefone", accent: false },
        { key: "cidade", accent: false },
      ],
    },
  ];

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="ec-root">
          <nav className="ec-nav">
            <Logo />
          </nav>
          <div className="ec-loading">CARREGANDO PERFIL...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ec-root">

        <nav className="ec-nav">
          <Logo />
          <Link to="/perfil" className="ec-back">← VOLTAR</Link>
        </nav>

        <div className="ec-body">
          <div className="ec-eyebrow">// MINHA_CONTA / EDITAR</div>
          <h1 className="ec-title">EDITAR <span>CONTA</span></h1>
          <div className="ec-divider" />

          {sections.map(section => (
            <div key={section.title}>
              <div className="ec-section-title">{section.title}</div>

              {section.fields.map(({ key, accent }) => {
                const raw = key === "ultima_doacao"
                  ? (perfil.ultima_doacao || perfil.data_ultima_doacao)
                  : perfil[key];
                const displayed = formatValue(key, raw);
                const isEditing = editando === key;
                const Editor = EDITORS[key];

                return (
                  <div className="ec-field-row" key={key}>
                    <div className="ec-field-header">
                      <div className="ec-field-left">
                        <span className="ec-field-label">{displayLabel(key)}</span>
                        <span className={`ec-field-value ${accent && displayed ? "accent" : ""} ${!displayed ? "empty" : ""}`}>
                          {displayed
                            ? (key === "genero" ? (displayed === "M" ? "Masculino" : "Feminino") : displayed)
                            : "Não informado"}
                        </span>
                      </div>
                      <button
                        className={`ec-edit-btn ${isEditing ? "active" : ""}`}
                        onClick={() => setEditando(isEditing ? null : key)}
                        disabled={editando !== null && !isEditing}
                      >
                        {isEditing ? "FECHAR" : "EDITAR"}
                      </button>
                    </div>

                    {isEditing && Editor && (
                      <Editor
                        value={key === "ultima_doacao"
                          ? (perfil.ultima_doacao || perfil.data_ultima_doacao)
                          : perfil[key]}
                        onSave={(val) => handleSave(key, val)}
                        onCancel={() => setEditando(null)}
                        saving={saving}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Campos somente leitura do Clerk */}
          <div className="ec-section-title">Conta Clerk (somente leitura)</div>
          <div className="ec-field-row">
            <div className="ec-field-header">
              <div className="ec-field-left">
                <span className="ec-field-label">EMAIL</span>
                <span className="ec-field-value">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
              <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 9, color: "#333", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Gerenciado pelo Clerk
              </span>
            </div>
          </div>
          <div className="ec-field-row">
            <div className="ec-field-header">
              <div className="ec-field-left">
                <span className="ec-field-label">SENHA</span>
                <span className="ec-field-value">••••••••</span>
              </div>
              <a
                href="https://accounts.moveacre.com.br/user"
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "#555", letterSpacing: "0.05em", textDecoration: "none", border: "1px solid #222", padding: "7px 16px", transition: "0.15s" }}
                onMouseEnter={e => { e.target.style.color = "#C8F500"; e.target.style.borderColor = "#C8F500"; }}
                onMouseLeave={e => { e.target.style.color = "#555"; e.target.style.borderColor = "#222"; }}
              >
                ALTERAR
              </a>
            </div>
          </div>

          {/* Zona de perigo */}
          <div className="ec-danger-section">
            <div className="ec-danger-title">Zona de risco</div>
            <p className="ec-danger-text">
              Ao desativar sua conta, você sai da plataforma e não receberá mais notificações.
              Você pode reativar sua conta fazendo login novamente.
            </p>
            <button className="ec-danger-btn" onClick={handleDesativar}>
              DESATIVAR MINHA CONTA
            </button>
          </div>

        </div>
      </div>

      {toast && <div className="ec-success-toast">{toast}</div>}
    </>
  );
}
