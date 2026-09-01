import { useState, useEffect, useCallback } from "react";

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 phút

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pano_user") || "null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const checkMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("pano_user", JSON.stringify(data.user));
        localStorage.setItem("pano_last_active", String(Date.now()));
        return;
      }
      setUser(null);
      localStorage.removeItem("pano_user");
      localStorage.removeItem("pano_last_active");
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
    localStorage.setItem("pano_last_active", String(Date.now()));
  };

  const logout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { Accept: "application/json" } }); } catch {}
    setUser(null);
    localStorage.removeItem("pano_user");
    localStorage.removeItem("pano_last_active");
  };

  // Session 10 phút: tự logout nếu không thao tác, reset khi có mousemove/keydown/click/scroll/touch
  useEffect(() => {
    if (!user) return;

    const isExpired = () => {
      const last = parseInt(localStorage.getItem("pano_last_active") || "0", 10);
      return last && Date.now() - last > SESSION_TIMEOUT_MS;
    };

    // check ngay khi mount
    if (isExpired()) {
      logout();
      return;
    }

    let timer;
    const resetTimer = () => {
      localStorage.setItem("pano_last_active", String(Date.now()));
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isExpired()) logout();
      }, SESSION_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => resetTimer();

    // khởi timer
    resetTimer();
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    // kiểm tra định kỳ mỗi 30s phòng khi tab ẩn
    const interval = setInterval(() => {
      if (isExpired()) logout();
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
    };
  }, [user]);

  return { user, loading, login, logout, checkMe };
}
