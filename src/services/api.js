import { mockFetch } from "../mock/handlers.js";

export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

let _backendOnline = null;
let _lastCheck = 0;

async function isBackendOnline() {
  const now = Date.now();
  if (_backendOnline !== null && now - _lastCheck < 30_000) return _backendOnline;
  try {
    const res = await fetch(`${API}/auth/is-admin`, {
      signal: AbortSignal.timeout(3000),
      headers: { Authorization: "Bearer demo" },
    });
    _backendOnline = res.status !== 0;
  } catch {
    _backendOnline = false;
  }
  _lastCheck = now;
  return _backendOnline;
}

export async function apiFetch(endpoint, options = {}, getToken) {
  const online = await isBackendOnline();
  if (!online) return mockFetch(endpoint, options);

  const token = await getToken();
  if (!token) console.error("ERRO: Nenhum token foi gerado pelo Clerk!");

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API}${endpoint}`, { ...options, headers });
  if (response.status === 401) console.error("Erro 401: token rejeitado pelo backend.");

  const data = await response.json();
  if (!data.success) throw new Error(data.message || "Erro na requisição");
  return data;
}
