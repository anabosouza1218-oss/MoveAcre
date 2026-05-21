import { mockFetch } from "./handlers.js";
import { API } from "../services/api.js";

let _online = null;
let _lastCheck = 0;

export async function safeFetch(endpoint, options = {}) {
  const now = Date.now();
  if (_online === null || now - _lastCheck > 30_000) {
    try {
      const res = await fetch(`${API}/auth/is-admin`, {
        signal: AbortSignal.timeout(3000),
        headers: { Authorization: "Bearer demo" },
      });
      _online = res.status !== 0;
    } catch {
      _online = false;
    }
    _lastCheck = now;
  }

  if (!_online) {
    const data = await mockFetch(endpoint, options);
    return { ok: true, json: async () => data };
  }

  return fetch(`${API}${endpoint}`, options);
}
