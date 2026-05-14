export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint, options = {}, getToken) {
  const token = await getToken();

  if (!token) {
    console.error("ERRO: Nenhum token foi gerado pelo Clerk!");
  }

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.error("Erro 401: token rejeitado pelo backend.");
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.message || "Erro na requisição");
  return data;
}
