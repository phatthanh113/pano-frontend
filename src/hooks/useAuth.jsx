import { useState, useEffect, useCallback } from "react";
import { buildUrl, getCsrfCookie, getXsrfToken } from "../api/client";

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pano_user") || "null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const checkMe = useCallback(async () => {
    try {
      const token = getXsrfToken();
      const res = await fetch(buildUrl("/api/auth/me"), {
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(token ? { "X-XSRF-TOKEN": token } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("pano_user", JSON.stringify(data.user));
        return;
      }
      setUser(null);
      localStorage.removeItem("pano_user");
    } catch {
      // offline fallback giữ user local
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkMe(); }, [checkMe]);

  const login = (u) => {
    setUser(u);
    localStorage.setItem("pano_user", JSON.stringify(u));
  };

  const logout = async () => {
    try {
      await getCsrfCookie();
      const token = getXsrfToken();
      await fetch(buildUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(token ? { "X-XSRF-TOKEN": token } : {}),
        },
      });
    } catch {
      // offline: bỏ qua lỗi gọi API logout
    }
    setUser(null);
    localStorage.removeItem("pano_user");
  };

  return { user, loading, login, logout, checkMe };
}
