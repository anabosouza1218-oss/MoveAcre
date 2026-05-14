import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cu-root {
    background: #0A0A0A;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .cu-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 32px;
    border-bottom: 1px solid #1a1a1a;
  }

  .cu-logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 22px;
    letter-spacing: 0.05em;
    color: #C8F500;
    text-transform: uppercase;
    text-decoration: none;
  }

  .cu-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #555;
    letter-spacing: 0.05em;
    text-decoration: none;
    cursor: pointer;
  }

  .cu-back:hover { color: #F5F5F0; }

  .cu-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
  }

  .cu-card {
    width: 100%;
    max-width: 480px;
  }

  .cu-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #C8F500;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
  }

  .cu-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 40px;
    line-height: 0.95;
    text-transform: uppercase;
    color: #F5F5F0;
    margin-bottom: 8px;
  }

  .cu-title span { color: #C8F500; }

  .cu-divider {
    width: 40px;
    height: 2px;
    background: #C8F500;
    margin-bottom: 32px;
  }

  .cu-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .cu-field {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #1a1a1a;
    padding: 16px 0;
  }

  .cu-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #555;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .cu-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid #2a2a2a;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    padding: 8px 0;
    outline: none;
    width: 100%;
    transition: border-color 0s;
  }

  .cu-input:focus { border-bottom-color: #C8F500; }
  .cu-input::placeholder { color: #333; }

  .cu-select {
    background: #0A0A0A;
    border: none;
    border-bottom: 1px solid #2a2a2a;
    color: #F5F5F0;
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    padding: 8px 0;
    outline: none;
    width: 100%;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }

  .cu-select:focus { border-bottom-color: #C8F500; }

  .cu-select option {
    background: #111;
    color: #F5F5F0;
  }

  .cu-file-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .cu-file-btn {
    background: transparent;
    color: #C8F500;
    border: 1px solid #C8F500;
    padding: 8px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
  }

  .cu-file-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #555;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cu-file-name.selected { color: #C8F500; }

  .cu-submit {
    background: #C8F500;
    color: #0A0A0A;
    border: none;
    padding: 16px 32px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 18px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 0;
    width: 100%;
    margin-top: 32px;
  }

  .cu-submit:hover { background: #d4ff00; }
  .cu-submit:active { background: #b8e000; }
  .cu-submit:disabled {
    background: #2a2a2a;
    color: #555;
    cursor: not-allowed;
  }

  .cu-footer {
    padding: 16px 32px;
    border-top: 1px solid #1a1a1a;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cu-footer-copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #333;
    letter-spacing: 0.05em;
  }
`;

export default function CriarUrgencia() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [showDoacaoModal, setShowDoacaoModal] = useState(false);
  const [showAvisoModal, setShowAvisoModal] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    if (user?.primaryEmailAddress?.emailAddress) {
      formData.append("email_solicitante", user.primaryEmailAddress.emailAddress);
    }

    try {
      const token = await getToken();
      const res = await fetch(`${API}/urgencias`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setShowDoacaoModal(true); // Pergunta se já doou
      } else {
        const body = await res.json();
        console.error("ERRO API:", res.status, body);
        alert(`Erro ${res.status}: ${body.message}`);
      }
    } catch (err) {
      console.error("CATCH:", err);
      alert("Erro de rede: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="cu-root">

        {/* MODAL: Aviso sobre o serviço */}
        {showAvisoModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
            <div style={{ background:'#0D0D0D', border:'1px solid #222', borderLeft:'4px solid #C8F500', padding:'40px', maxWidth:'480px', width:'100%' }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'10px', color:'#C8F500', letterSpacing:'0.1em', marginBottom:'16px' }}>// AVISO IMPORTANTE</div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'26px', textTransform:'uppercase', color:'#F5F5F0', marginBottom:'20px', lineHeight:1 }}>
                Sobre os pedidos de doação
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px' }}>
                <p style={{ fontSize:'13px', color:'#888', lineHeight:1.7, borderLeft:'2px solid #333', paddingLeft:'12px' }}>
                  O MOVEACRE <strong style={{color:'#F5F5F0'}}>não garante a efetivação de doações</strong>. Somos uma plataforma de notificação — conectamos seu pedido a doadores compatíveis, mas a decisão de doar é sempre do doador.
                </p>
                <p style={{ fontSize:'13px', color:'#888', lineHeight:1.7, borderLeft:'2px solid #333', paddingLeft:'12px' }}>
                  <strong style={{color:'#F5F5F0'}}>Não temos vínculo com o Hemoacre</strong> ou qualquer serviço de saúde. Em emergências médicas, ligue para o <strong style={{color:'#F5F5F0'}}>SAMU (192)</strong> ou vá ao pronto-socorro.
                </p>
                <p style={{ fontSize:'13px', color:'#888', lineHeight:1.7, borderLeft:'2px solid #333', paddingLeft:'12px' }}>
                  Pedidos falsos ou com informações incorretas violam nossos{' '}
                  <a href="/termos" target="_blank" style={{color:'#C8F500'}}>Termos de Uso</a>
                  {' '}e podem ser removidos.
                </p>
              </div>
              <button
                onClick={() => setShowAvisoModal(false)}
                style={{ width:'100%', background:'#C8F500', color:'#0A0A0A', border:'none', padding:'16px', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'18px', textTransform:'uppercase', cursor:'pointer' }}
              >
                ENTENDI, CONTINUAR
              </button>
            </div>
          </div>
        )}

        {/* MODAL: Você já doou sangue? */}
        {showDoacaoModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111', border: '1px solid #333', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#C8F500', marginBottom: '16px', letterSpacing: '0.05em' }}>// CONFIRMAÇÃO</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: '#F5F5F0', marginBottom: '12px' }}>
                Você já doou <span style={{ color: '#C8F500' }}>sangue</span>?
              </h2>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#555', marginBottom: '32px', lineHeight: 1.6 }}>
                Pedido enviado com sucesso! Caso tenha doado recentemente, declare sua doação para atualizar seu nível.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => { setShowDoacaoModal(false); navigate('/perfil', { state: { abrirDeclarar: true } }); }}
                  style={{ background: '#C8F500', color: '#0A0A0A', border: 'none', padding: '14px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  SIM, DECLARAR DOAÇÃO
                </button>
                <button
                  onClick={() => { setShowDoacaoModal(false); navigate('/minhas-urgencias'); }}
                  style={{ background: 'transparent', color: '#555', border: '1px solid #333', padding: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', cursor: 'pointer' }}
                >
                  NÃO, VER MEUS PEDIDOS
                </button>
              </div>
            </div>
          </div>
        )}
        <nav className="cu-nav">
          <Logo />
          <Link to="/" className="cu-back">← VOLTAR</Link>
        </nav>

        <div className="cu-body">
          <div className="cu-card">
            <div className="cu-tag">// NOVA_SOLICITAÇÃO</div>
            <h1 className="cu-title">
              URGÊNCIA<br />
              DE <span>SANGUE</span>
            </h1>
            <div className="cu-divider" />

            <form className="cu-form" onSubmit={handleSubmit}>
              <div className="cu-field">
                <label className="cu-label">NOME_DO_PACIENTE</label>
                <input
                  className="cu-input"
                  name="paciente_nome"
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="cu-field">
                <label className="cu-label">IDADE_DO_PACIENTE</label>
                <input
                  className="cu-input"
                  type="number"
                  name="idade"
                  placeholder="Idade"
                  required
                />
              </div>

              <div className="cu-field">
                <label className="cu-label">MOTIVO_DA_TRANSFUSÃO</label>
                <input
                  className="cu-input"
                  name="motivo"
                  placeholder="Descreva o motivo (ex: cirurgia, acidente, etc)"
                  required
                />
              </div>

              <div className="cu-field">
                <label className="cu-label">TIPO_SANGUÍNEO_NECESSÁRIO</label>
                <select className="cu-select" name="tipo_necessario" required>
                  <option value="">Selecione</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="cu-field">
                <label className="cu-label">NÍVEL_DE_URGÊNCIA_SUGERIDO</label>
                <select className="cu-select" name="nivel_urgencia_sugerido" required>
                  <option value="">Selecione a urgência</option>
                  <option value="BAIXA">BAIXA</option>
                  <option value="MEDIA">MÉDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="CRITICA">CRÍTICA</option>
                </select>
              </div>

              <div className="cu-field">
                <label className="cu-label">CONTATO_WHATSAPP</label>
                <input
                  className="cu-input"
                  name="contato_solicitante"
                  placeholder="(xx) xxxxx-xxxx"
                  required
                />
              </div>

              <div className="cu-field">
                <label className="cu-label">LAUDO_MÉDICO</label>
                <label className="cu-file-label">
                  <span className="cu-file-btn">ANEXAR ARQUIVO</span>
                  <span className={`cu-file-name ${fileName ? "selected" : ""}`}>
                    {fileName || "PDF, JPG ou PNG"}
                  </span>
                  <input
                    type="file"
                    name="laudo"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    style={{ display: "none" }}
                    onChange={(e) =>
                      setFileName(e.target.files[0]?.name || null)
                    }
                  />
                </label>
              </div>

              <button type="submit" className="cu-submit" disabled={loading}>
                {loading ? "ENVIANDO..." : "ENVIAR SOLICITAÇÃO"}
              </button>
            </form>
          </div>
        </div>

        <footer className="cu-footer">
          <span className="cu-footer-copy">
            © 2024 MOVEACRE_ANALYTICS // SEGURANÇA_DE_DADOS_SEC_01
          </span>
          <span className="cu-footer-copy" style={{ color: "#C8F500" }}>
            V.1.0.0-CINÉTICO
          </span>
        </footer>
      </div>
    </>
  );
}
