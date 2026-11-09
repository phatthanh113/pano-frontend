import React, { useState, useEffect } from "react";
import { buildUrl, getCsrfCookie, getXsrfToken } from "../../api/client";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin, initialId = "", lockId = false, projectName = "", onCancel = null, externalError = "" }) {
  const [id, setId] = useState(initialId);

  // Prefill ID khi vào link /:slug trực tiếp
  useEffect(() => {
    if (initialId && !id) setId(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  // Logo công ty từ site-settings (chỉ hiện khi có dữ liệu)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-settings", { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.logo_url) return;
        setLogoUrl(data.logo_url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const demoUser = () =>
    ({ id: id.trim(), name: id.trim() || "Demo User", slug: id.trim(), demo: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Sanctum statefulApi yêu cầu csrf-cookie trước (backend/bootstrap/app.php:25)
      // Host tĩnh: /sanctum/csrf-cookie trả HTML (SPA fallback) -> vẫn gọi, không sao
      await getCsrfCookie();
      const xsrfToken = getXsrfToken();
      const res = await fetch(buildUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ id: id.trim(), password }),
      });
      const raw = await res.text();
      let data = {};
      try { data = JSON.parse(raw); } catch { data = { message: raw.slice(0, 500) }; }
      if (!res.ok) {
        // Host tĩnh (Netlify...) không có /api: trả 404 (body rỗng/HTML) -> demo login
        if (res.status === 404 || /^\s*</.test(raw)) {
          onLogin(demoUser());
          return;
        }
        throw new Error(data.message || `Server Error ${res.status}: ${raw.slice(0, 300)}`);
      }
      // Ok nhưng không phải JSON (SPA HTML fallback của host tĩnh) -> demo login
      if (!(res.headers.get("content-type") || "").includes("application/json") || !data.user) {
        onLogin(demoUser());
        return;
      }
      onLogin(data.user);
    } catch (err) {
      // Không có backend (dev offline): cho phép demo login bằng mọi ID/password
      if (isBackendUnavailable(err)) {
        onLogin(demoUser());
        return;
      }
      setError(err.message || "Server Error - check Network tab");
      console.error("[Login] failed", err);
    } finally {
      setLoading(false);
    }
  };

  /** Backend down (không phản hồi) - phân biệt với 40x/500 khi backend đang chạy */
  const isBackendUnavailable = (err) => {
    if (err instanceof TypeError) return true; // fetch: Failed to fetch / CORS
    const raw = String(err?.message || "");
    const lower = raw.toLowerCase();
    if (
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("load failed") ||
      lower.includes("error occurred while trying to proxy")
    ) {
      return true;
    }
    // Vite proxy khi target chết: trả 500 với body rỗng -> message "Server Error 5xx: "
    const m = raw.match(/^Server Error (\d{3}):?\s*([\s\S]*)$/);
    return !!m && m[1][0] === "5" && m[2].trim() === "";
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        {logoUrl && <img src={logoUrl} alt="Company logo" className="login-logo" loading="lazy" decoding="async"/>}
        <div className="login-title">{projectName ? "PROJECT LOGIN" : "WELCOME"}</div>

        {projectName && (
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            {projectName}
          </div>
        )}
        {onCancel && (
          <div style={{ textAlign: "center", fontSize: 10, color: "#6b7280", marginBottom: 14 }}>
            Please sign in again to switch to this project
          </div>
        )}

        <div className="login-field">
          <label className="login-label">ID</label>
          <div className="login-input-wrap">
            <span className="login-input-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#6b7280"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </span>
            <input className="login-input" placeholder="Enter your ID" onChange={(e) => setId(e.target.value)} />
          </div>
        </div>

        <div className="login-field">
          <label className="login-label">Password</label>
          <div className="login-input-wrap">
            <span className="login-input-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#6b7280"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </span>
            <input className="login-input" type={showPw ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="login-eye-btn" onClick={() => setShowPw((v) => !v)} tabIndex={-1} aria-label="toggle password">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        {error && <div className="login-error">{error}</div>}
        {externalError && !error && <div className="login-error">{externalError}</div>}

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "..." : "Sign In"}
        </button>
        <div style={{ textAlign: "center", fontSize: 10, color: "#9ca3af", marginTop: 10 }}>
          Demo mode: nếu backend không chạy (VITE_PROXY_TARGET), mọi ID/password đều được chấp nhận
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ width: "100%", height: 32, marginTop: 8, background: "transparent", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
