import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { safeFetch } from "../mock/safeFetch.js";

export function useIsAdmin() {
  const { getToken, isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) { setIsAdmin(false); setLoading(false); return; }
    getToken().then(token =>
      safeFetch("/auth/is-admin", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(j => setIsAdmin(j.is_admin === true))
        .catch(() => setIsAdmin(false))
        .finally(() => setLoading(false))
    );
  }, [isSignedIn]);

  return { isAdmin, loading };
}
