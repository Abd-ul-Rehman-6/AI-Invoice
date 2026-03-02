"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role =
      typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role !== "admin") {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          apiFetch("/dashboard/admin/stats", { token }),
          apiFetch("/dashboard/admin/dashboard", { token }),
        ]);
        setStats(statsRes);
        setLogs(logsRes.login_logs || []);
      } catch (err) {
        setError(err.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    router.replace("/login");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#040d1a",
          color: "#e8f4ff",
        }}
      >
        Loading admin dashboard…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2.5rem",
          borderBottom: "1px solid rgba(55,65,81,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg,#f97316,#ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            ⚙️
          </div>
          <span style={{ fontWeight: 700 }}>Admin · InvoiceGuard</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.5)",
            background: "transparent",
            color: "#e5e7eb",
            padding: "0.35rem 0.9rem",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </header>

      <main style={{ padding: "2rem 2.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>
          System overview
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
          High-level stats across all users and invoices.
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

        {stats && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              gap: 14,
              marginBottom: "2rem",
            }}
          >
            {[
              ["Users", stats.total_users],
              ["Invoices", stats.total_invoices],
              ["Reports", stats.total_reports],
              ["Risky invoices", stats.total_risky_reports],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(55,65,81,1)",
                  background:
                    "radial-gradient(circle at top,rgba(248,250,252,0.02),transparent)",
                  padding: "1rem 1.1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </p>
                <p style={{ fontSize: "1.4rem", fontWeight: 700 }}>{value}</p>
              </div>
            ))}
          </section>
        )}

        <section>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.7rem" }}>
            Recent logins
          </h2>
          {logs.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              No recent login activity.
            </p>
          ) : (
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(55,65,81,1)",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead
                  style={{
                    background: "#020617",
                    textAlign: "left",
                  }}
                >
                  <tr>
                    <th style={{ padding: "0.7rem 0.9rem" }}>User</th>
                    <th style={{ padding: "0.7rem 0.9rem" }}>Email</th>
                    <th style={{ padding: "0.7rem 0.9rem" }}>Role</th>
                    <th style={{ padding: "0.7rem 0.9rem" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr
                      key={idx}
                      style={{ borderTop: "1px solid rgba(31,41,55,1)" }}
                    >
                      <td style={{ padding: "0.6rem 0.9rem" }}>{log.user}</td>
                      <td style={{ padding: "0.6rem 0.9rem" }}>{log.email}</td>
                      <td style={{ padding: "0.6rem 0.9rem" }}>{log.role}</td>
                      <td style={{ padding: "0.6rem 0.9rem" }}>{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

