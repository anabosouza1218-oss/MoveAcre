import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useIsAdmin() {
  const { getToken, isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) { setIsAdmin(false); setLoading(false); return; }
    getToken().then(token =>
      fetch(`${API}/auth/is-admin`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(j => setIsAdmin(j.is_admin === true))
        .catch(() => setIsAdmin(false))
        .finally(() => setLoading(false))
    );
  }, [isSignedIn]);

  return { isAdmin, loading };
}
