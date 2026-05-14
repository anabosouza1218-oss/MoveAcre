# MOVEACRE

Plataforma de mobilização de doadores de sangue para o estado do Acre, Brasil.

Projeto de extensão universitária desenvolvido por alunos da **Uninorte — Centro Universitário do Norte**, Rio Branco, AC.

---

## O problema

Todo dia aparece um pedido de sangue no grupo da família. A gente compartilha, sente o aperto — e fica por isso mesmo. Não por falta de vontade. Por falta de um sistema que funcionasse.

O MOVEACRE resolve isso: conecta quem precisa de sangue a doadores compatíveis de forma direta, sem depender de grupos de WhatsApp ou posts virais.

---

## Como funciona

1. Doadores se cadastram informando tipo sanguíneo, cidade e histórico de doações
2. Quem precisa de sangue abre um pedido de urgência com laudo médico
3. A equipe MOVEACRE revisa e aprova o pedido
4. O sistema notifica automaticamente os doadores compatíveis por **e-mail e WhatsApp**
5. O doador vai ao Hemoacre e realiza a doação presencialmente

---

## Estrutura do repositório

```
MoveAcre/
├── backend/      # API REST — Python + Flask + PostgreSQL (Supabase)
└── frontend/     # Interface web — React 19 + Vite + Clerk
```

---

## Stack

| | Tecnologia |
|---|---|
| Backend | Python, Flask, PostgreSQL (Supabase), Gunicorn |
| Frontend | React 19, Vite, React Router v7 |
| Autenticação | Clerk (JWT RS256) |
| Storage | Supabase Storage (signed URLs) |
| E-mail | Resend |
| WhatsApp | Twilio / Z-API |
| Deploy | Nixpacks (Railway / Render) |

---

## Funcionalidades

- Cadastro de doadores com tipo sanguíneo, nível (Bronze/Prata/Ouro) e histórico
- Pedidos de urgência com upload de laudo médico validado por magic bytes
- Filtragem inteligente por compatibilidade sanguínea e intervalo entre doações
- Notificações automáticas por e-mail e WhatsApp com templates HTML
- Painel administrativo completo (aprovar/recusar pedidos, gerenciar usuários)
- Declaração de doações com upload de atestado e aprovação pelo admin
- Scheduler para lembrar doadores aptos a doar novamente
- Segurança: JWT RS256, CORS restrito, rate limiting, security headers, LGPD

---

## Rodando localmente

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # preencha as variáveis
python app.py
# API em http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # preencha as variáveis
npm run dev
# App em http://localhost:5173
```

Veja os arquivos `.env.example` em cada pasta para a lista completa de variáveis necessárias.

---

## Equipe

Projeto desenvolvido por alunos da **Uninorte — Rio Branco, Acre**:

- Kelvin Lieberman — Desenvolvimento
- Julio Souza — Desenvolvimento
- Tomas Souza — Desenvolvimento

---

## Licença

Projeto acadêmico sem fins lucrativos. Todos os direitos reservados aos autores.
