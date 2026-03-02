"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
      }

      // Redirect to home page after successful login
      router.push("/");
      
    } catch (err) {
      setError(err.message || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#040d1a",
        color: "#e8f4ff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2.5rem",
          borderRadius: 16,
          background: "#071222",
          border: "1px solid rgba(0,212,255,0.18)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            marginBottom: "0.5rem",
            fontWeight: 700,
          }}
        >
          Sign in
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#6b8fa8", marginBottom: "1.6rem" }}>
          Use your InvoiceIQ account to access your dashboard.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#fecaca",
              borderRadius: 8,
              padding: "0.7rem 0.9rem",
              fontSize: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block", color: "#94a3b8" }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "0.7rem 0.8rem",
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.3)",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#00d4ff"}
            onBlur={(e) => e.target.style.borderColor = "rgba(148,163,184,0.3)"}
          />
        </div>

        <div style={{ marginBottom: "1.4rem" }}>
          <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block", color: "#94a3b8" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "0.7rem 0.8rem",
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.3)",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#00d4ff"}
            onBlur={(e) => e.target.style.borderColor = "rgba(148,163,184,0.3)"}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: 999,
            border: "none",
            background: loading 
              ? "linear-gradient(135deg, #64748b, #475569)" 
              : "linear-gradient(135deg, #00d4ff, #38bdf8)",
            color: "#020617",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginBottom: "0.9rem",
            transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 12px rgba(0,212,255,0.3)",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 20, height: 20, marginRight: 8, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
              Signing in…
            </span>
          ) : "Sign in"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#64748b" }}>
          <span>
            Don't have an account?{" "}
            <a
              href="/register"
              style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 500 }}
              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.target.style.textDecoration = "none"}
            >
              Create one
            </a>
          </span>
          <a
            href="/forgot-password"
            style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 500 }}
            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          >
            Forgot password?
          </a>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}