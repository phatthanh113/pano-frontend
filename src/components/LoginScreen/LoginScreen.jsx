import React, { useState } from "react";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id.trim() || !password) {
      setError("Vui lòng nhập ID và Password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: id.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        <div className="login-title">WELCOME</div>

        <div className="login-field">
          <label className="login-label">ID</label>
          <div className="login-input-wrap">
            <span className="login-input-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#6b7280"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </span>
            <input className="login-input" placeholder="Enter your ID" value={id} onChange={(e) => setId(e.target.value)} />
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

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
