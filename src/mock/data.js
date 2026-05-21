// Dados de demonstração — usados quando o backend está offline

export const mockPerfil = {
  id: 1,
  nome_completo: "Ana Silva",
  email: "ana.silva@demo.com",
  tipo: "DOADOR",
  tipo_sangue: "O+",
  genero: "F",
  telefone: "68999990001",
  cidade: "Rio Branco",
  idade: 28,
  ultima_doacao: "2025-11-10",
  nivel: "PRATA",
  online: 1,
  desativado_por: null,
  termos_aceitos: true,
};

export const mockUrgencias = [
  {
    id: 1,
    paciente_nome: "Carlos Mendes",
    idade: 45,
    motivo: "Cirurgia de emergência — perda de sangue severa",
    tipo_necessario: "O+",
    nivel_urgencia_sugerido: "CRITICA",
    contato_solicitante: "68999990002",
    email_solicitante: "carlos@demo.com",
    status: "Aprovada",
    motivo_recusa: null,
    criado_em: "2026-04-10T14:30:00",
  },
  {
    id: 2,
    paciente_nome: "Maria Oliveira",
    idade: 32,
    motivo: "Tratamento oncológico — quimioterapia",
    tipo_necessario: "A+",
    nivel_urgencia_sugerido: "ALTA",
    contato_solicitante: "68999990003",
    email_solicitante: "maria@demo.com",
    status: "Pendente",
    motivo_recusa: null,
    criado_em: "2026-05-01T09:15:00",
  },
  {
    id: 3,
    paciente_nome: "João Ferreira",
    idade: 60,
    motivo: "Anemia grave — necessidade urgente",
    tipo_necessario: "B-",
    nivel_urgencia_sugerido: "MEDIA",
    contato_solicitante: "68999990004",
    email_solicitante: "joao@demo.com",
    status: "Recusada",
    motivo_recusa: "Documentação incompleta. Reenvie o laudo médico atualizado.",
    criado_em: "2026-03-22T11:00:00",
  },
];

export const mockHistoricoDoacoes = [
  {
    id: 1,
    data_doacao: "2025-11-10",
    criado_em: "2025-11-11T08:00:00",
    atestado_url: null,
    status: "Aprovada",
  },
  {
    id: 2,
    data_doacao: "2025-07-04",
    criado_em: "2025-07-05T10:30:00",
    atestado_url: null,
    status: "Aprovada",
  },
  {
    id: 3,
    data_doacao: "2025-02-14",
    criado_em: "2025-02-15T09:00:00",
    atestado_url: null,
    status: "Aprovada",
  },
];

export const mockStats = {
  total: 42,
  pendentes: 8,
  aprovadas: 31,
  total_doadores: 120,
  total_receptores: 45,
  pedidos_pendentes: 8,
  pedidos_aprovados: 31,
  total_doacoes: 87,
  online: 14,
  niveis: { bronze: 70, prata: 38, ouro: 12 },
};

export const mockDoadores = [
  { id: 1, nome_completo: "Ana Silva", email: "ana@demo.com", tipo: "DOADOR", tipo_sangue: "O+", genero: "F", nivel: "PRATA", cidade: "Rio Branco", idade: 28, online: 1 },
  { id: 2, nome_completo: "Pedro Costa", email: "pedro@demo.com", tipo: "DOADOR", tipo_sangue: "A-", genero: "M", nivel: "OURO", cidade: "Cruzeiro do Sul", idade: 35, online: 1 },
  { id: 3, nome_completo: "Lucia Ramos", email: "lucia@demo.com", tipo: "DOADOR", tipo_sangue: "B+", genero: "F", nivel: "BRONZE", cidade: "Rio Branco", idade: 22, online: 0 },
];

export const mockReceptores = [
  { id: 4, nome_completo: "Carlos Mendes", email: "carlos@demo.com", tipo: "RECEPTOR", tipo_sangue: "O+", genero: "M", nivel: null, cidade: "Rio Branco", idade: 45, online: 1 },
  { id: 5, nome_completo: "Maria Oliveira", email: "maria@demo.com", tipo: "RECEPTOR", tipo_sangue: "A+", genero: "F", nivel: null, cidade: "Sena Madureira", idade: 32, online: 1 },
];

export const mockDoacoes = [
  { id: 1, doador_email: "ana@demo.com", nome_completo: "Ana Silva", tipo_sangue: "O+", genero: "F", data_doacao: "2025-11-10", status: "Aprovada", atestado_url: null, criado_em: "2025-11-11T08:00:00" },
  { id: 2, doador_email: "pedro@demo.com", nome_completo: "Pedro Costa", tipo_sangue: "A-", genero: "M", data_doacao: "2026-04-20", status: "Pendente", atestado_url: null, criado_em: "2026-04-21T10:00:00" },
];
