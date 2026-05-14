# MOVEACRE — Backend API

API REST do sistema MOVEACRE, plataforma de mobilização de doadores de sangue para o estado do Acre, Brasil. Projeto de extensão universitária desenvolvido por alunos da **Uninorte — Centro Universitário do Norte**.

---

## O que é o MOVEACRE

O MOVEACRE conecta quem precisa de sangue a doadores compatíveis de forma direta, sem depender de grupos de WhatsApp ou posts virais. Quando um pedido de urgência é aprovado, o sistema notifica automaticamente os doadores compatíveis por e-mail e/ou WhatsApp.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Flask (Python) |
| Banco de dados | PostgreSQL via Supabase (SQLite em dev) |
| Autenticação | Clerk (JWT RS256) |
| Storage | Supabase Storage (signed URLs) |
| E-mail | Resend |
| WhatsApp | Twilio ou Z-API |
| Deploy | Gunicorn + Nixpacks (Railway/Render) |
| Rate limiting | flask-limiter |

---

## Funcionalidades

- **Autenticação** via Clerk com verificação de JWT (RS256 + JWKS)
- **Cadastro e perfil de doadores** com tipo sanguíneo, histórico e nível (Bronze/Prata/Ouro)
- **Pedidos de urgência** com upload de laudo médico (PDF/imagem), validação por magic bytes
- **Filtragem inteligente** de doadores por compatibilidade sanguínea e intervalo entre doações
- **Notificações** por e-mail (Resend) e WhatsApp (Twilio/Z-API) com templates HTML
- **Painel administrativo** para aprovar/recusar pedidos, gerenciar usuários e disparar notificações
- **Declaração de doações** com upload de atestado e aprovação manual pelo admin
- **Scheduler** para notificações de recorrência (doadores aptos a doar novamente)
- **Auditoria** de ações administrativas
- **LGPD** — consentimento explícito de termos (Art. 11)

---

## Estrutura

```
MoveAcre/
├── app.py              # Entry point, CORS, rate limiting, security headers
├── auth.py             # Verificação JWT Clerk (RS256 + JWKS cache)
├── config.py           # Conexão DB (Postgres/SQLite), migrations
├── scheduler.py        # Jobs agendados (notificações de recorrência)
├── routes/
│   ├── auth.py         # /auth/is-admin, /auth/termos
│   ├── doadores.py     # /doadores/me, /sync, /declarar-doacao, etc.
│   ├── urgencias.py    # /urgencias (CRUD + upload de laudo)
│   └── admin.py        # /admin/* (painel completo)
├── services/
│   ├── filtragem.py    # Compatibilidade sanguínea e elegibilidade
│   ├── notificacoes.py # E-mail (Resend) e WhatsApp (Twilio/Z-API)
│   ├── storage.py      # Upload/download Supabase Storage (signed URLs)
│   └── auditoria.py    # Log de ações admin
└── database/
    └── *.sql           # Migrations SQL
```

---

## Configuração

### 1. Clone e instale as dependências

```bash
git clone <repo-url>
cd MoveAcre
pip install -r requirements.txt
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

Veja `.env.example` para a lista completa de variáveis necessárias.

### 3. Execute em desenvolvimento

```bash
python app.py
# API disponível em http://localhost:5000
```

### 4. Execute em produção

```bash
gunicorn app:app --bind 0.0.0.0:5000 --workers 2
```

---

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL PostgreSQL (Supabase). Sem ela, usa SQLite local. |
| `CLERK_JWKS_URL` | URL pública JWKS do Clerk |
| `CLERK_SECRET_KEY` | Secret key do Clerk (para buscar chaves de instância) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key do Supabase |
| `RESEND_API_KEY` | API key do Resend para envio de e-mails |
| `ADMIN_EMAILS` | E-mails com acesso admin, separados por vírgula |
| `ALLOWED_ORIGINS` | Origens CORS permitidas, separadas por vírgula |

Veja `.env.example` para todas as variáveis opcionais (Twilio, Z-API, Redis, etc.).

---

## Segurança

- JWT verificado via RS256 + JWKS (nunca aceita token não assinado)
- Upload de arquivos validado por extensão **e** magic bytes
- Arquivos servidos via signed URLs temporárias (1h) — buckets privados no Supabase
- CORS restrito a origens explícitas
- Rate limiting por IP (200 req/min, 1000 req/h)
- Security headers em todas as respostas
- Inputs sanitizados contra injeção NoSQL/path traversal

---

## Equipe

Projeto desenvolvido por alunos da **Uninorte — Rio Branco, Acre**:

- Kelvin Lieberman
- Julio Souza
- Tomas Souza

---

## Licença

Projeto acadêmico sem fins lucrativos. Todos os direitos reservados aos autores.
