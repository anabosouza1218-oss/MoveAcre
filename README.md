# Moveacre — Frontend

Plataforma de doação de sangue para o estado do Acre. Conecta doadores e receptores em situações de urgência.

## Sobre o projeto

Sistema fullstack com:
- **Frontend**: React + Vite + React Router
- **Backend**: Python (Flask) + SQLite — repositório separado
- **Autenticação**: Clerk
- **Deploy**: Railway (backend) + GitHub Pages (frontend demo)

## Modo demo

Quando o backend está offline, o frontend ativa automaticamente um modo de demonstração com dados fictícios. Isso permite visualizar a interface completa sem depender do servidor.

## Funcionalidades

- Cadastro e login via Clerk
- Dashboard do doador/receptor
- Abertura e acompanhamento de pedidos de sangue urgentes
- Declaração de doações com upload de atestado
- Histórico de doações com sistema de níveis (Bronze → Prata → Ouro)
- Painel administrativo completo (aprovação de pedidos, gestão de usuários, notificações)

## Rodando localmente

```bash
npm install
npm run dev
```

Crie um `.env.local` com:

```
VITE_CLERK_PUBLISHABLE_KEY=sua_chave_clerk
VITE_API_URL=http://localhost:5000
```

## Build para GitHub Pages

```bash
VITE_BASE_PATH=/nome-do-repo npm run build
```

Ou instale `gh-pages` e rode:

```bash
npm install --save-dev gh-pages
npm run deploy
```
