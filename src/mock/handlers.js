// Intercepta chamadas de API e retorna dados mock quando o backend está offline
import {
  mockPerfil,
  mockUrgencias,
  mockHistoricoDoacoes,
  mockStats,
  mockDoadores,
  mockReceptores,
  mockDoacoes,
} from "./data.js";

// Simula delay de rede para parecer mais real
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export async function mockFetch(endpoint) {
  await delay();

  // Auth
  if (endpoint.includes("/auth/is-admin")) {
    return { is_admin: false };
  }

  // Doadores
  if (endpoint.includes("/doadores/sync")) {
    return { success: true };
  }
  if (endpoint.includes("/doadores/me")) {
    return { success: true, data: mockPerfil };
  }
  if (endpoint.includes("/doadores/historico-doacoes")) {
    return { success: true, data: mockHistoricoDoacoes };
  }
  if (endpoint.includes("/doadores/declarar-doacao")) {
    return { success: true, message: "Doação declarada com sucesso!" };
  }
  if (endpoint.includes("/doadores/desativar")) {
    return { success: true };
  }
  if (endpoint.includes("/doadores/reativar")) {
    return { success: true };
  }

  // Urgências
  if (endpoint.includes("/urgencias/me")) {
    return { success: true, data: mockUrgencias };
  }
  if (endpoint.match(/\/urgencias\/\d+\/laudo/)) {
    return { success: false, message: "Laudo não disponível no modo demo." };
  }
  if (endpoint.match(/\/urgencias\/\d+\/desativar/)) {
    return { success: true };
  }
  if (endpoint.match(/\/urgencias\/\d+/)) {
    return { success: true };
  }
  if (endpoint.includes("/urgencias")) {
    return { success: true, message: "Pedido criado! (modo demo)" };
  }

  // Admin
  if (endpoint.includes("/admin/pedidos")) {
    return { success: true, data: mockUrgencias, stats: { total: mockUrgencias.length, pendentes: 1, aprovadas: 1 } };
  }
  if (endpoint.includes("/admin/doadores")) {
    return { success: true, data: mockDoadores };
  }
  if (endpoint.includes("/admin/receptores")) {
    return { success: true, data: mockReceptores };
  }
  if (endpoint.includes("/admin/usuarios")) {
    return { success: true, data: [...mockDoadores, ...mockReceptores], stats: mockStats };
  }
  if (endpoint.includes("/admin/doacoes")) {
    return { success: true, data: mockDoacoes };
  }
  if (endpoint.includes("/admin/online")) {
    return { success: true, data: mockDoadores.filter(d => d.online) };
  }
  if (endpoint.includes("/admin/stats")) {
    return { success: true, data: mockStats };
  }
  if (endpoint.includes("/admin/recorrencia/notificar")) {
    return { aptos: 14, enviados_email: 10, enviados_whatsapp: 8 };
  }
  if (endpoint.match(/\/admin\/pedidos\/\d+\/aprovar/)) {
    return { success: true };
  }
  if (endpoint.match(/\/admin\/pedidos\/\d+\/reprovar/)) {
    return { success: true };
  }
  if (endpoint.match(/\/admin\/pedidos\/\d+\/notificar/)) {
    return { success: true, stats: { enviados_email: 5, enviados_whatsapp: 3 } };
  }
  if (endpoint.match(/\/admin\/doacoes\/\d+\/aprovar/)) {
    return { success: true, nivel: "PRATA" };
  }
  if (endpoint.match(/\/admin\/doacoes\/\d+\/reprovar/)) {
    return { success: true };
  }
  if (endpoint.match(/\/admin\/usuarios\/\d+\/desativar/)) {
    return { success: true };
  }
  if (endpoint.match(/\/admin\/usuarios\/\d+\/reativar/)) {
    return { success: true };
  }
  if (endpoint.match(/\/admin\/usuarios\/\d+/)) {
    return { success: true };
  }

  return { success: false, message: "Endpoint não encontrado no modo demo." };
}
