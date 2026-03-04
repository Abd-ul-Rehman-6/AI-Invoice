"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, apiDownload } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("recent"); // 'recent' | 'all'

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    console.log("🔍 Dashboard mounted");
    console.log("🔑 Token from localStorage:", token ? "Present ✅" : "Missing ❌");
    
    if (!token) {
      console.log("⛔ No token, redirecting to login");
      router.replace("/login");
      return;
    }

    async function loadDashboard() {
      console.log("📡 Loading dashboard data...");
      
      try {
        // Fetch user data first
        try {
          console.log("👤 Fetching user data from: /dashboard/user/dashboard");
          const userData = await apiFetch("/dashboard/user/dashboard", { token });
          console.log("✅ User data received:", userData);
          setUser(userData.user);
        } catch (userErr) {
          console.error("❌ User data fetch failed:", userErr);
          
          // Check if it's a 401 error
          if (userErr.message?.includes("session has expired") || userErr.message?.includes("401")) {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            router.replace("/login");
            return;
          }
          
          setError(prev => prev + (prev ? '\n' : '') + `User data error: ${userErr.message}`);
        }
        
        // Fetch invoices
        try {
          console.log("📄 Fetching invoices from: /user/results");
          const results = await apiFetch("/user/results", { token });
          console.log("✅ Invoices response:", results);
          console.log("📊 Invoices array:", results.invoices);
          
          // Debug: Log each invoice's vendor fields
          if (results.invoices && results.invoices.length > 0) {
            results.invoices.forEach((inv, index) => {
              console.log(`📝 Invoice ${index + 1}:`, {
                id: inv.id,
                vendor_name: inv.vendor_name,
                client: inv.client,
                invoice_number: inv.invoice_number,
                total_amount: inv.total_amount
              });
            });
          }
          
          setInvoices(results.invoices || []);
        } catch (invErr) {
          console.error("❌ Invoices fetch failed:", invErr);
          
          // Check if it's a 401 error
          if (invErr.message?.includes("session has expired") || invErr.message?.includes("401")) {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            router.replace("/login");
            return;
          }
          
          setError(prev => prev + (prev ? '\n' : '') + `Invoices error: ${invErr.message}`);
        }
        
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        console.log("✅ Loading complete");
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  // Log whenever invoices state changes
  useEffect(() => {
    console.log("📊 Invoices state updated:", invoices.length, "invoices");
  }, [invoices]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    router.replace("/login");
  }

  function handleNewUpload() {
    router.push('/');
  }

  function handleLogoClick() {
    router.push('/');
  }

  async function handleDownload(invoiceId) {
    const token = localStorage.getItem("token");
    if (!token) {
      // no token, go back to login immediately
      router.replace("/login");
      return;
    }

    try {
      console.log(`📥 Downloading invoice id=${invoiceId}`);

      const blob = await apiDownload(`/user/invoice/${encodeURIComponent(invoiceId)}/download`, { token });

      // sanity checks in case the helper returned nothing
      if (!blob || !(blob instanceof Blob)) {
        throw new Error("Did not receive a file from server");
      }

      if (blob.size === 0) {
        // backend returned an empty stream – something went wrong upstream
        throw new Error("Downloaded file is empty");
      }

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Audit_Report_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      console.log("✅ Download finished, bytes=", blob.size);
    } catch (err) {
      console.error("❌ Download failed:", err);

      // if the error came from authentication or status code, clear token too
      const msg = err.message || "Unknown error";
      if (msg.includes("session has expired") || msg.includes("401") || msg.includes("Unauthorized")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        router.replace("/login");
        return;
      }

      alert(`Download failed: ${msg}`);
    }
  }

  async function handleDelete(invoiceId) {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this invoice and its report?")) {
      return;
    }

    try {
      console.log(`🗑️ Deleting invoice: ${invoiceId}`);
      
      await apiFetch(`/user/invoice/${invoiceId}/delete`, {
        method: "DELETE",
        token,
      });
      
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      console.log("✅ Delete successful");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      
      // Check if it's a 401 error
      if (err.message?.includes("session has expired") || err.message?.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        router.replace("/login");
        return;
      }
      
      alert(err.message || "Delete failed");
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#040d1a",
        color: "#e8f4ff",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: "3px solid #00d4ff",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem"
          }} />
          <p>Loading dashboard…</p>
          <p style={{ fontSize: "0.8rem", color: "#6b8fa8", marginTop: "0.5rem" }}>
            Fetching your invoices...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#040d1a",
      color: "#e8f4ff",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2.5rem",
        borderBottom: "1px solid rgba(148,163,184,0.3)",
        background: "#020617",
      }}>
        {/* Logo with click handler */}
        <div 
          onClick={handleLogoClick}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg,#00d4ff,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
          }}>
            🛡️
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>InvoiceGuard</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {user && (
            <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              {user.name || user.email} {user.email && <span style={{ color: "#6b8fa8" }}>({user.email})</span>}
            </span>
          )}
          
          <button
            onClick={handleNewUpload}
            style={{
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg,#00d4ff,#38bdf8)",
              color: "#020617",
              padding: "0.5rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(0,212,255,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(0,212,255,0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,212,255,0.3)";
            }}
          >
            <span>+</span> New Upload
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(255,71,87,0.5)",
              background: "transparent",
              color: "#ff7070",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,71,87,0.1)";
              e.target.style.borderColor = "#ff4757";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "rgba(255,71,87,0.5)";
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main style={{ padding: "2rem 2.5rem" }}>
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.5)",
            color: "#fecaca",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap"
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.3rem", fontWeight: 700 }}>
              Welcome back, {user?.name || "User"}! 👋
            </h1>
            <p style={{ fontSize: "1rem", color: "#9ca3af" }}>
              Here are your uploaded invoices and their AI analysis
            </p>
          </div>
          
          {invoices.length > 0 && (
            <div style={{
              display: "flex",
              gap: "0.5rem",
              background: "#020617",
              padding: "0.25rem",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.3)",
            }}>
              <button
                onClick={() => setActiveCategory("recent")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  background: activeCategory === "recent" ? "linear-gradient(135deg,#00d4ff,#38bdf8)" : "transparent",
                  color: activeCategory === "recent" ? "#020617" : "#9ca3af",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveCategory("all")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  background: activeCategory === "all" ? "linear-gradient(135deg,#00d4ff,#38bdf8)" : "transparent",
                  color: activeCategory === "all" ? "#020617" : "#9ca3af",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                All History
              </button>
            </div>
          )}
        </div>

        <div id="invoice-history">
        {invoices.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "4rem 2rem",
            background: "#020617",
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.3)"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📄</div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              No invoices yet
            </h2>
            <p style={{ fontSize: "1rem", color: "#94a3b8", marginBottom: "2rem" }}>
              Upload your first invoice to see AI analysis
            </p>
            <button
              onClick={handleNewUpload}
              style={{
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg,#00d4ff,#38bdf8)",
                color: "#020617",
                padding: "0.75rem 2rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(0,212,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <span>📤</span> Upload First Invoice
            </button>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: 12,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#9ca3af",
                padding: "0 0.2rem 0.4rem",
                borderBottom: "1px solid rgba(148,163,184,0.3)",
                marginBottom: "1rem",
              }}
            >
              <span>VENDOR / RISK</span>
              <span style={{ textAlign: "center" }}>INVOICE NO</span>
              <span style={{ textAlign: "right" }}>TOTAL AMOUNT</span>
              <span style={{ textAlign: "right" }}>STATUS</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {(activeCategory === "recent" ? invoices.slice(0, 3) : invoices).map((inv) => {
              const riskText =
                typeof inv.risk_score === "string"
                  ? inv.risk_score
                  : inv.risk_score != null
                  ? String(inv.risk_score)
                  : "N/A";

              const riskLower = (riskText || "").toLowerCase();
              let badgeBg = "#e5e7eb";
              let badgeColor = "#111827";

              if (riskLower.includes("low")) {
                badgeBg = "#dcfce7";
                badgeColor = "#166534";
              } else if (riskLower.includes("medium")) {
                badgeBg = "#fef3c7";
                badgeColor = "#92400e";
              } else if (riskLower.includes("high")) {
                badgeBg = "#fee2e2";
                badgeColor = "#b91c1c";
              }

                const statusLabel = inv.risk_tag || "AI Detected";
                
                // FIX: Get vendor name from correct field (now also fall back to the uploaded file name)
                const vendorName = inv.vendor_name || inv.client || inv.file_name || inv.filename || "Unknown vendor";
                
                // Debug log to see what's coming from the API
                console.log(`Invoice ${inv.id} vendor fields:`, {
                  vendor_name: inv.vendor_name,
                  client: inv.client,
                  file_name: inv.file_name,
                  display_name: vendorName
                });

                return (
                <div
                  id={`invoice-${inv.id}`}
                  key={inv.id}
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "#020617",
                    padding: "1.3rem 1.4rem",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#00d4ff";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(148,163,184,0.3)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    {/* Vendor / Risk Column - FIXED */}
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        {vendorName}
                      </div>
                      <div>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          borderRadius: 999,
                          padding: "0.25rem 0.55rem",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background: badgeBg,
                          color: badgeColor,
                        }}>
                          <span>✔</span>
                          {inv.risk_tag || riskText || "Risk"}
                        </span>
                      </div>
                    </div>

                    {/* Invoice No Column */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9ca3af",
                        marginBottom: 2,
                      }}>
                        INVOICE NO
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {inv.invoice_number || "—"}
                      </div>
                    </div>

                    {/* Total Amount Column */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9ca3af",
                        marginBottom: 2,
                      }}>
                        TOTAL AMOUNT
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {inv.total_amount || "—"}
                      </div>
                    </div>

                    {/* Status Column */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9ca3af",
                        marginBottom: 2,
                      }}>
                        STATUS
                      </div>
                      <div style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: badgeColor,
                      }}>
                        {statusLabel}
                      </div>
                    </div>
                  </div>

                  {inv.details_html && (
                    <div
                      style={{
                        marginTop: "1rem",
                        borderRadius: 12,
                        background: "#030712",
                        border: "1px solid rgba(148,163,184,0.4)",
                        padding: "0.9rem 1rem",
                        color: "#e5e7eb",
                        fontSize: "0.85rem",
                        marginBottom: "0.9rem",
                      }}
                      dangerouslySetInnerHTML={{ __html: inv.details_html }}
                    />
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      marginTop: inv.details_html ? 0 : "0.8rem",
                    }}
                  >
                    <button
                      onClick={() => handleDownload(inv.id)}
                      style={{
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.5)",
                        background: "transparent",
                        color: "#e5e7eb",
                        padding: "0.45rem 0.9rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0,212,255,0.1)";
                        e.target.style.borderColor = "#00d4ff";
                        e.target.style.color = "#00d4ff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.borderColor = "rgba(148,163,184,0.5)";
                        e.target.style.color = "#e5e7eb";
                      }}
                    >
                      ⬇ Download report
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      style={{
                        borderRadius: 999,
                        border: "none",
                        background: "linear-gradient(135deg,#ef4444,#b91c1c)",
                        color: "#fef2f2",
                        padding: "0.45rem 0.9rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(239,68,68,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  );
}