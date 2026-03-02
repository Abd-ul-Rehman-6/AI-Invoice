"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        },
      });
      setMessage(data.message || "Registered successfully");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err.message || "Registration failed");
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
          maxWidth: 460,
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
          Create account
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#6b8fa8", marginBottom: "1.6rem" }}>
          Register to start scanning invoices with InvoiceGuard.
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

        {message && (
          <div
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.5)",
              color: "#bbf7d0",
              borderRadius: 8,
              padding: "0.7rem 0.9rem",
              fontSize: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}
            >
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.7rem 0.8rem",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.5)",
                marginBottom: "1rem",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}
            >
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem 0.8rem",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.5)",
                marginBottom: "1rem",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: "0.9rem",
              }}
            />
          </div>
        </div>

        <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.7rem 0.8rem",
            borderRadius: 8,
            border: "1px solid rgba(148,163,184,0.5)",
            marginBottom: "1rem",
            background: "#020617",
            color: "#e5e7eb",
            fontSize: "0.9rem",
          }}
        />

        <label style={{ fontSize: "0.8rem", marginBottom: 4, display: "block" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.7rem 0.8rem",
            borderRadius: 8,
            border: "1px solid rgba(148,163,184,0.5)",
            marginBottom: "1.4rem",
            background: "#020617",
            color: "#e5e7eb",
            fontSize: "0.9rem",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg,rgba(0,212,255,1),rgba(56,189,248,1))",
            color: "#020617",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginBottom: "0.9rem",
          }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 500 }}
          >
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}

