import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { safeFetch } from "../mock/safeFetch.js";

const ROTAS_LIVRES = ["/completar-perfil", "/"];

export default function SyncWrapper({ children }) {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkStatus = async () => {
      try {
        const token = await getToken();
        const authHeader = { Authorization: `Bearer ${token}` };

        const isAdminRes = await safeFetch("/auth/is-admin", { headers: authHeader });
        const isAdminJson = await isAdminRes.json();
        if (isAdminJson.is_admin) { setReady(true); return; }

        await safeFetch("/doadores/sync", {
          method: "POST",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({
            nome_completo: user.fullName,
            email: user.primaryEmailAddress.emailAddress,
          }),
        });

        const res = await safeFetch("/doadores/me", {
          headers: { ...authHeader, "Cache-Control": "no-cache", Pragma: "no-cache" },
        });

        const json = await res.json();
        const data = json.data ?? json;

        if (data && data.online === 0) {
          alert("Esta conta foi desativada.");
          window.location.href = "/";
          return;
        }

        const perfilCompleto =
          data &&
          data.genero && data.genero.trim() !== "" &&
          data.telefone && data.telefone.trim() !== "";

        const rotaAtual = window.location.pathname;
        const rotaLivre = ROTAS_LIVRES.includes(rotaAtual);

        if (!perfilCompleto && !rotaLivre) {
          navigate("/completar-perfil");
        } else {
          setReady(true);
        }
      } catch (err) {
        console.error("[MOVEACRE] Erro ao verificar perfil:", err);
        setReady(true);
      }
    };

    checkStatus();
  }, [isLoaded, user]);

  if (!ready) return null;
  return children;
}
