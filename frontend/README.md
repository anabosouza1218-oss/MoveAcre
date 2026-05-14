# MOVEACRE — Frontend

Interface web do sistema MOVEACRE, plataforma de mobilização de doadores de sangue para o estado do Acre, Brasil. Projeto de extensão universitária desenvolvido por alunos da **Uninorte — Centro Universitário do Norte**.

---

## O que é o MOVEACRE

O MOVEACRE conecta quem precisa de sangue a doadores compatíveis de forma direta, sem depender de grupos de WhatsApp ou posts virais. Qualquer pessoa pode se cadastrar como doador ou abrir um pedido de urgência.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Build | Vite |
| Autenticação | Clerk |
| Roteamento | React Router v7 |
| Ícones | Lucide React |
| Deploy | Nixpacks (Railway/Render) |

---

## Funcionalidades

- **Landing page** com informações sobre doação de sangue e cadastro
- **Dashboard do doador** — abrir pedidos, acompanhar status, declarar doações
- **Completar perfil** — tipo sanguíneo, gênero, telefone, cidade, termos LGPD
- **Pedidos de urgência** — criar, editar e acompanhar pedidos com upload de laudo
- **Histórico de doações** — visualizar doações declaradas e status de aprovação
- **Painel administrativo** — gerenciar pedidos, doadores, usuários e disparar notificações
- **Páginas institucionais** — Critérios de doação, Sobre, Termos de uso, Privacidade
- **Responsivo** — adaptado para mobile e desktop

---

## Estrutura

```
moveacre-front/
├── src/
│   ├── App.jsx              # Roteamento principal
│   ├── main.jsx             # Entry point + ClerkProvider
│   ├── api.js               # Helper de fetch autenticado
│   ├── components/
│   │   ├── Logo.jsx
│   │   └── SyncWrapper.jsx  # Sincroniza usuário Clerk com o backend
│   ├── hooks/
│   │   └── useIsAdmin.js    # Verifica se o usuário logado é admin
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── DoadorDashboard.jsx
│   │   ├── CompletarPerfil.jsx
│   │   ├── CriarUrgencia.jsx
│   │   ├── EditarPedido.jsx
│   │   ├── MinhasUrgencias.jsx
│   │   ├── Perfil.jsx
│   │   ├── HistoricoDoador.jsx
│   │   ├── EditarConta.jsx
│   │   ├── ListarUrgencias.jsx
│   │   ├── Criterios.jsx
│   │   ├── Sobre.jsx
│   │   ├── Termos.jsx
│   │   └── Privacidade.jsx
│   └── services/
│       └── api.js           # Configuração base da API
└── public/
    ├── favicon.svg
    ├── icons.svg
    └── logo.svg
```

---

## Configuração

### 1. Clone e instale as dependências

```bash
git clone <repo-url>
cd moveacre-front
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

Veja `.env.example` para a lista completa de variáveis necessárias.

### 3. Execute em desenvolvimento

```bash
npm run dev
# App disponível em http://localhost:5173
```

### 4. Build para produção

```bash
npm run build
npm run preview  # para testar o build localmente
```

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Publishable key do Clerk (obrigatória) |
| `VITE_API_URL` | URL base da API backend |
| `VITE_ADMIN_EMAILS` | E-mails admin separados por vírgula |

---

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Landing page (ou dashboard se logado) |
| `/admin` | Painel administrativo (restrito) |
| `/criar-urgencia` | Abrir pedido de sangue |
| `/minhas-urgencias` | Pedidos do usuário logado |
| `/perfil` | Perfil e histórico de doações |
| `/completar-perfil` | Onboarding após primeiro login |
| `/editar-pedido/:id` | Editar pedido pendente |
| `/editar-conta` | Editar dados da conta |
| `/criterios` | Critérios de elegibilidade para doação |
| `/sobre` | Sobre o projeto |
| `/termos` | Termos de uso |
| `/privacidade` | Política de privacidade |

---

## Equipe

Projeto desenvolvido por alunos da **Uninorte — Rio Branco, Acre**:

- Kelvin Lieberman
- Julio Souza
- Tomas Souza

---

## Licença

Projeto acadêmico sem fins lucrativos. Todos os direitos reservados aos autores.
