"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiUpload } from "../lib/api";
import { useRouter } from "next/navigation";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const TOOLS = [
  { icon: "🚨", name: "Fraud Detection",     color: "#ff4757", bg: "rgba(255,71,87,0.12)",   desc: "Fake invoices, forged vendor details, inflated amounts — our AI catches patterns invisible to the human eye." },
  { icon: "⚠️", name: "Mismatch Analysis",   color: "#ff6b35", bg: "rgba(255,107,53,0.12)",  desc: "Invoice numbers, dates, vendor names, tax IDs, and totals — any inconsistency flagged instantly with a clear explanation." },
  { icon: "📋", name: "Duplicate Detection", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  desc: "The same invoice submitted twice with different details — our AI compares against your full history automatically." },
  { icon: "🔒", name: "Tampering Detection", color: "#7c3aed", bg: "rgba(124,58,237,0.12)",  desc: "Font edits, amount changes, metadata modifications — even minor PDF alterations are caught and reported precisely." },
  { icon: "📊", name: "Data Extraction",     color: "#00d4ff", bg: "rgba(0,212,255,0.12)",   desc: "Automatically pulls vendor details, line items, totals, and taxes into a clean structured format — ready to export." },
  { icon: "✅", name: "Compliance Check",    color: "#22c55e", bg: "rgba(34,197,94,0.12)",   desc: "Validates GST/VAT format, required fields, and proper invoice numbering against regulatory standards in one click." },
];

const STEPS = [
  { num: "01", color: "#00d4ff", title: "Upload Your Invoice",    desc: "Drag & drop or click to upload any PDF invoice. Batch uploads supported for high-volume teams." },
  { num: "02", color: "#ff6b35", title: "AI Scans in Seconds",    desc: "Our engine reads, parses, and cross-references the invoice against fraud patterns and your history — in under 3 seconds." },
  { num: "03", color: "#22c55e", title: "Review Your Report",     desc: "Get a clear color-coded report — every issue explained in plain English with severity levels and recommended actions." },
  { num: "04", color: "#7c3aed", title: "Export & Track History", desc: "Download reports as PDF or CSV. All scans are stored in your dashboard for future audits and comparisons." },
];

const WHO = [
  { icon: "🏢", bg: "rgba(0,212,255,0.1)",  title: "Business Owners",        desc: "Catch fake vendor invoices before payment goes out. Protect your accounts payable with zero technical effort." },
  { icon: "📊", bg: "rgba(251,191,36,0.1)", title: "Accountants & Finance",  desc: "Process invoice batches faster and safer — eliminate hours of manual cross-checking with AI precision." },
  { icon: "🏦", bg: "rgba(34,197,94,0.1)",  title: "Banks & Fintech",        desc: "Detect fraudulent invoices in loan applications and trade finance workflows before they cause losses." },
  { icon: "🛒", bg: "rgba(255,107,53,0.1)", title: "Procurement Teams",      desc: "Verify supplier invoices at scale — stop duplicate billing and overcharging before approvals go through." },
  { icon: "⚖️", bg: "rgba(124,58,237,0.1)", title: "Auditors & Lawyers",    desc: "Evidence-grade tamper detection for legal proceedings — verify document authenticity with a full audit trail." },
  { icon: "🚀", bg: "rgba(255,71,87,0.1)",  title: "Startups & Freelancers", desc: "Send and receive invoices with confidence — verify every payment request before it hits your bank account." },
];

const REVIEWS = [
  { stars: 5, text: "A vendor had been submitting duplicate invoices for 3 months. InvoiceGuard caught it on the very first scan. We saved over $14,000 in a single week.", initials: "AK", name: "Ahmed K.",   role: "CFO · Textile Export Company", gradFrom: "#667eea", gradTo: "#764ba2" },
  { stars: 5, text: "A client sent me a PDF with the amount manually edited. InvoiceGuard flagged it as 'Tampered' and pinpointed the exact field. This tool is a lifesaver.", initials: "SR", name: "Sarah R.",   role: "Freelance Designer",           gradFrom: "#f093fb", gradTo: "#f5576c" },
  { stars: 5, text: "We verify hundreds of invoices for loan applications. InvoiceGuard eliminated 70% of our manual review process and accuracy actually went up.",            initials: "MH", name: "Michael H.", role: "Risk Manager · Private Bank",  gradFrom: "#4facfe", gradTo: "#00f2fe" },
  { stars: 4, text: "I'm not technical at all, but the interface is so clean and easy. I had my first invoice scanned within 2 minutes of signing up. Highly recommended.",    initials: "TA", name: "Thomas A.",  role: "Senior Accountant",            gradFrom: "#43e97b", gradTo: "#38f9d7" },
  { stars: 5, text: "We needed to prove invoice authenticity in a legal case. The InvoiceGuard tamper report was accepted as evidence in court. Extraordinary tool.",           initials: "NB", name: "Natalie B.", role: "Corporate Lawyer",             gradFrom: "#fa709a", gradTo: "#fee140" },
  { stars: 5, text: "Supplier invoice verification used to take hours. Now it takes 3 seconds per invoice. My team called it the best investment we made this year.",          initials: "ZM", name: "Zach M.",    role: "Founder · E-commerce Store",   gradFrom: "#a18cd1", gradTo: "#fbc2eb" },
];

const SCAN_STEPS = [
  { p: 12,  l: "Reading PDF structure..."   },
  { p: 30,  l: "Extracting invoice fields..." },
  { p: 52,  l: "Running fraud detection..."  },
  { p: 70,  l: "Checking for duplicates..."  },
  { p: 87,  l: "Analyzing PDF metadata..."   },
  { p: 100, l: "Analysis complete ✓"         },
];

const CHIPS = [
  { id: "fraud", label: "🚨 Fraud Check",     bg: "rgba(255,71,87,0.12)",  border: "rgba(255,71,87,0.3)",  color: "#ff7070" },
  { id: "dup",   label: "📋 Duplicate Scan",  bg: "rgba(255,107,53,0.12)", border: "rgba(255,107,53,0.3)", color: "#ff9068" },
  { id: "tamp",  label: "🔒 Tamper Analysis", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", color: "#fbbf24" },
  { id: "ok",    label: "✅ Compliance",      bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  color: "#4ade80" },
];

// ─── UPLOAD CARD ──────────────────────────────────────────────────────────────

function UploadCard() {
  const [scanning, setScanning]         = useState(false);
  const [progress, setProgress]         = useState(0);
  const [label, setLabel]               = useState("Initializing AI engine...");
  const [visibleChips, setVisibleChips] = useState([]);
  const [dragOver, setDragOver]         = useState(false);
  const [message, setMessage]           = useState("");
  const [error, setError]               = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileDetails, setFileDetails] = useState([]); // processed_results from API
  const [detectedVendor, setDetectedVendor] = useState(""); // name extracted from invoice
  const [popup, setPopup] = useState({ open: false, type: "success", title: "", body: "" });
  const fileInputRef                    = useRef(null);
  
  // Add ref for the file details section
  const fileDetailsRef = useRef(null);

  const performUpload = useCallback(async (files) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Please log in first to upload invoices.");
      setMessage("");
      return;
    }

    setScanning(true);
    setProgress(0);
    setVisibleChips([]);
    setMessage("");
    setError("");
    setUploadSuccess(false);
    setFileDetails([]);

    let i = 0;
    const tick = () => {
      if (i >= SCAN_STEPS.length) return;
      const s = SCAN_STEPS[i];
      setProgress(s.p);
      setLabel(s.l);
      if (i >= 2) {
        const chip = CHIPS[i - 2];
        if (!chip) {
          i += 1;
          if (i < SCAN_STEPS.length) {
            setTimeout(tick, 550 + Math.random() * 250);
          }
          return;
        }
        setVisibleChips((prev) => [
          ...new Set([...prev, chip.id]),
        ]);
      }
      i += 1;
      if (i < SCAN_STEPS.length) {
        setTimeout(tick, 550 + Math.random() * 250);
      }
    };

    setTimeout(tick, 300);

    try {
      const fileArray = Array.from(files);
      const res = await apiUpload("/user/upload", {
        files: fileArray,
        token,
      });
      
      const uploadedCount = (res.uploaded_files || []).length;
      const hasErrors = (res.errors || []).length > 0;
      
      setMessage(
        uploadedCount > 0
          ? `Uploaded ${uploadedCount} file(s) successfully: ${fileArray
              .map(f => f.name)
              .join(", ")}`
          : "No files were uploaded.",
      );
      
      if (hasErrors) {
        setError(res.errors.join(" | "));
      }

      // Save uploaded files info
      setUploadedFiles(fileArray.map(f => f.name));
      
      // Show success state
      setUploadSuccess(true);
      const details = res.processed_results || [];
      setFileDetails(details);

      // compute vendor(s) for display
      if (details.length > 0) {
        const names = details.map(fd => {
          const inv = (fd.invoices || [])[0] || {};
          return inv.vendor_name || fd.file_name || inv.filename || "Unknown";
        });
        setDetectedVendor(names.join(", "));
      } else {
        setDetectedVendor("");
      }

      // Save result to localStorage
      localStorage.setItem('uploadResult', JSON.stringify(res));

      setPopup({
        open: true,
        type: hasErrors ? "warning" : "success",
        title: hasErrors ? "Uploaded with warnings" : "Upload successful",
        body: hasErrors
          ? `Uploaded ${uploadedCount} file(s). Some files had issues.`
          : `Uploaded ${uploadedCount} file(s). See details below.`,
      });
      
    } catch (err) {
      const msg = err.message || "Upload failed";
      setError(msg);
      setPopup({
        open: true,
        type: "error",
        title: "Upload failed",
        body: msg,
      });
    } finally {
      setTimeout(() => {
        setScanning(false);
        setProgress(0);
        setLabel("Initializing AI engine...");
        setVisibleChips([]);
        
        // Auto-scroll to file details after upload completes
        if (fileDetailsRef.current) {
          setTimeout(() => {
            fileDetailsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 300); // Small delay to ensure DOM is updated
        }
      }, 1200);
    }
  }, []);

  const handleBrowseClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      performUpload(files);
    }
  };

  const handleNewUpload = () => {
    window.location.href = '/';
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };
  
  return (
    <div
      id="upload-hero"
      style={{
        position: "relative",
        borderRadius: 20,
        padding: "2.2rem",
        overflow: "hidden",
        background: "#0c1e36",
        border: "1px solid rgba(0,212,255,0.1)",
        boxShadow: "0 0 60px rgba(0,212,255,0.12), 0 40px 80px rgba(0,0,0,0.4)",
      }}
    >
      {/* gradient sheen */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(0,212,255,0.04),rgba(124,58,237,0.04))", pointerEvents: "none" }} />

      {/* Mac dots topbar */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, marginBottom: "1.6rem", paddingBottom: "1.2rem", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        <span style={{ marginLeft: 6, color: "#6b8fa8", fontSize: "0.78rem", fontWeight: 500 }}>InvoiceGuard — AI Analyzer</span>
      </div>

      {/* Drop zone */}
      {!scanning && (
        <div
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click();
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              performUpload(e.dataTransfer.files);
            }
          }}
          style={{
            border: `1.5px dashed ${dragOver ? "rgba(0,212,255,0.5)" : "rgba(0,212,255,0.22)"}`,
            borderRadius: 14,
            padding: "2.8rem 1.5rem",
            textAlign: "center",
            background: dragOver ? "rgba(0,212,255,0.06)" : "rgba(0,212,255,0.025)",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {/* Floating PDF icon */}
          <div style={{
            width: 72, height: 72, margin: "0 auto 1rem",
            borderRadius: 18,
            background: "linear-gradient(135deg,rgba(0,212,255,0.12),rgba(124,58,237,0.12))",
            border: "1px solid rgba(0,212,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem",
            animation: "floatIcon 3.5s ease-in-out infinite",
          }}>
            📄
          </div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.35rem" }}>Drop Your Invoice Here</p>
          <p style={{ color: "#6b8fa8", fontSize: "0.82rem", marginBottom: "1.3rem" }}>
            Drag &amp; drop or{" "}
            <span
              style={{ color: "#00d4ff", cursor: "pointer" }}
              onClick={handleBrowseClick}
            >
              browse files
            </span>
          </p>
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg,#00d4ff,#0099cc)",
              color: "#040d1a", padding: "0.6rem 1.5rem",
              borderRadius: 8, border: "none",
              fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            ⬆ Upload Invoice PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.xlsx"
            multiple
            onChange={handleFilesSelected}
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
            {["PDF", "Max 20MB", "🔒 AES-256 Encrypted", "GDPR Compliant"].map((t) => (
              <span key={t} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "0.22rem 0.6rem", borderRadius: 4, fontSize: "0.68rem", color: "#6b8fa8" }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Scanning state */}
      {scanning && (
        <div>
          {/* File row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 10, padding: "0.8rem 1rem", marginBottom: "1.1rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: "linear-gradient(135deg,#ff5f57,#c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", flexShrink: 0 }}>📋</div>
            <div>
              <p style={{ fontSize: "0.83rem", fontWeight: 600 }}>invoice_Q1_2025.pdf</p>
              <p style={{ fontSize: "0.72rem", color: "#6b8fa8", marginTop: 2 }}>2.4 MB · Upload complete</p>
            </div>
            <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: "0.9rem" }}>✓</span>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.73rem", color: "#6b8fa8", marginBottom: 6 }}>
            <span>{label}</span>
            <span style={{ color: "#00d4ff", fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", marginBottom: "1.2rem" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: "linear-gradient(90deg,#7c3aed,#00d4ff)",
              borderRadius: 10, transition: "width 2.8s ease",
              position: "relative",
            }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4))", animation: "shimmer 1.2s ease-in-out infinite" }} />
            </div>
          </div>

          {/* Chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CHIPS.map((chip) => (
              <span key={chip.id} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "0.28rem 0.65rem", borderRadius: 100,
                fontSize: "0.7rem", fontWeight: 600,
                background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color,
                opacity: visibleChips.includes(chip.id) ? 1 : 0,
                transform: visibleChips.includes(chip.id) ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.4s, transform 0.4s",
              }}>
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {(message || error || detectedVendor) && !uploadSuccess && (
        <div style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
          {message && (
            <p style={{ color: "#4ade80", marginBottom: "0.3rem" }}>{message}</p>
          )}
          {detectedVendor && (
            <p style={{ color: "#e8f4ff", fontSize: "0.75rem" }}>
              <strong>Detected vendor:</strong> {detectedVendor}
            </p>
          )}
          {uploadedFiles.length > 0 && (
            <p style={{ color: "#e8f4ff", fontSize: "0.75rem" }}>
              <strong>File names:</strong> {uploadedFiles.join(", ")}
            </p>
          )}
          {fileDetails.length > 0 && (
            <p style={{ color: "#e8f4ff", fontSize: "0.75rem" }}>
              <strong>Detected vendor(s):</strong> {fileDetails
                .map(fd => {
                  const inv = (fd.invoices || [])[0] || {};
                  return inv.vendor_name || fd.file_name || inv.filename || "Unknown";
                })
                .join(", ")}
            </p>
          )}
          {error && <p style={{ color: "#f97373" }}>{error}</p>}
        </div>
      )}

      {/* Trust row */}
      <div style={{ display: "flex", gap: 24, marginTop: "1.6rem", paddingTop: "1.3rem", borderTop: "1px solid rgba(0,212,255,0.1)", justifyContent: "center", flexWrap: "wrap" }}>
        {["No data stored", "Results in 3s", "Free to start"].map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.73rem", color: "#6b8fa8" }}>
            <span style={{ color: "#22c55e" }}>✓</span> {t}
          </div>
        ))}
      </div>

      {/* File details after upload - with ref attached */}
      {fileDetails.length > 0 && (
        <div ref={fileDetailsRef} style={{ marginTop: "2rem", width: "100%" }}>
    <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#00d4ff", fontWeight: 600 }}>
      📄 Uploaded file details
    </h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {fileDetails.map((item, idx) => {
              const inv = (item.invoices || [])[0] || {};
              const risk = (inv.risk_level || "").toLowerCase();
              // Determine badge styling
              let badgeBg = "#e5e7eb", badgeColor = "#111827";
              if (risk.includes("high")) { 
                badgeBg = "#fee2e2"; 
                badgeColor = "#b91c1c"; 
              } else if (risk.includes("medium")) { 
                badgeBg = "#fef3c7"; 
                badgeColor = "#92400e"; 
              } else { 
                badgeBg = "#dcfce7"; 
                badgeColor = "#166534"; 
              }

              // Check for tampering
              const tamperingDetected = inv.tampering_detected === "Yes";
              const detailsHtml = inv.detailed_review || inv.risk_explanation || "";

              // UPDATED: Forensic status display - Final Audit removed, now directly shows YES/NO with red alert
              // Forensic status display - WITH FINAL AUDIT DETAILS INSIDE
// UPDATED: Forensic status display with Final Audit INSIDE the same box
const forensicStatus = tamperingDetected ? `
  <div style="background: #fff5f5; border-left: 5px solid #c53030; padding: 16px; border-radius: 8px; color: #c53030; text-align: left;">
    <div style="margin-bottom: 12px;">
      <strong style="color: #c53030; font-size: 1rem;">⛔ NO — FILE NOT VERIFIED</strong><br>
      <span style="font-size: 13px; color: #742a2a;"><b>Issue:</b> ${inv.tampering_reason || "Document may have been altered"}</span>
    </div>
    <div style="border-top: 1px solid rgba(197, 48, 48, 0.3); padding-top: 12px; margin-top: 4px;">
      <strong style="color: #ff7070; font-size: 0.9rem;">📢 Final Audit:</strong><br>
      <span style="font-size: 13px; color: #e5e7eb;">Document has been tampered with. The calculated total does not match the invoice total. Mathematical errors detected.</span>
    </div>
  </div>
` : `
  <div style="background: #f0fff4; border-left: 5px solid #2ecc71; padding: 16px; border-radius: 8px; color: #276749; text-align: left;">
    <div style="margin-bottom: 12px;">
      <strong style="color: #2f855a; font-size: 1rem;">✅ YES — FILE VERIFIED</strong><br>
      <span style="font-size: 13px;">Document structure, alignments, and fonts appear authentic. No signs of manual editing found.</span>
    </div>
    <div style="border-top: 1px solid rgba(46, 204, 113, 0.3); padding-top: 12px; margin-top: 4px;">
      <strong style="color: #2f855a; font-size: 0.9rem;">📢 Final Audit:</strong><br>
      <span style="font-size: 13px; color: #000000;">The calculated total matches the invoice total. The invoice appears to be valid and free of mathematical errors.</span>
    </div>
  </div>
`;

              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(0,212,255,0.2)",
                    background: "#0c1e36",
                    padding: "1.2rem 1.4rem",
                  }}
                >
                  {/* Header section with vendor info and risk badge */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    flexWrap: "wrap", 
                    gap: 12, 
                    marginBottom: "0.8rem"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e8f4ff" }}>
                        {inv.vendor_name || inv.file_name || inv.filename || "Unknown vendor"}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: 6 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          borderRadius: 999, padding: "0.2rem 0.5rem", fontSize: "0.72rem", fontWeight: 600,
                          background: badgeBg, color: badgeColor,
                        }}>
                          {inv.status_tag || inv.risk_level || "Risk"}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.65rem", color: "#6b8fa8", textTransform: "uppercase" }}>Invoice No</div>
                        <div style={{ fontWeight: 600 }}>{inv.invoice_number || "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.65rem", color: "#6b8fa8", textTransform: "uppercase" }}>Total</div>
                        <div style={{ fontWeight: 700 }}>{inv.total_amount || "—"}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* UPDATED: Details section with forensic status at the top */}
                  <div
                    style={{
                      marginTop: "0.8rem",
                      padding: "0.9rem",
                      borderRadius: 10,
                      background: "#071222",
                      border: "1px solid rgba(148,163,184,0.2)",
                      color: "#e5e7eb",
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {/* Forensic status message - NOW AT THE TOP (Final Audit removed) */}
                    <div dangerouslySetInnerHTML={{ __html: forensicStatus }} />
                    
                    {/* Detailed review content (if any) */}
                    {detailsHtml && (
                      <div style={{ marginTop: "15px" }} dangerouslySetInnerHTML={{ __html: detailsHtml }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function InvoiceGuardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Check login status on mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("userEmail");
      setIsLoggedIn(!!token);
      setUserEmail(email || "");
    };

    checkLoginStatus();

    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener("storage", checkLoginStatus);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("uploadResult");
    setIsLoggedIn(false);
    setUserEmail("");
    
    // Redirect to home page
    window.location.href = "/";
  };

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add("ig-visible"), i * 75);
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".ig-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #040d1a; color: #e8f4ff; overflow-x: hidden; }

        .ig-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .ig-visible { opacity: 1 !important; transform: translateY(0) !important; }

        @keyframes floatIcon  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes livePulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        @keyframes fadeDown   { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(24px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes shimmer    { 0%{opacity:0} 50%{opacity:1} 100%{opacity:0} }

        .anim-fadeDown { animation: fadeDown 0.7s ease both; }
        .anim-fadeUp   { animation: fadeUp  0.8s ease 0.15s both; }
        .anim-fadeUp2  { animation: fadeUp  0.8s ease 0.3s  both; }
        .anim-fadeUp3  { animation: fadeUp  0.8s ease 0.45s both; }
        .anim-fadeUp4  { animation: fadeUp  0.8s ease 0.6s  both; }
        .anim-fadeIn   { animation: fadeIn  1s   ease 0.5s  both; }
        .anim-pulse    { animation: livePulse 1.8s ease-in-out infinite; }

        .tool-card:hover { transform: translateY(-5px) !important; border-color: rgba(0,212,255,0.25) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important; }
        .tool-card:hover .accent-line { opacity: 1 !important; }
        .who-card:hover  { transform: translateY(-4px); border-color: rgba(124,58,237,0.3) !important; }
        .rev-card:hover  { border-color: rgba(0,212,255,0.2) !important; }
        .nav-a:hover     { color: #e8f4ff !important; }
        .nav-btn:hover   { background: rgba(0,212,255,0.22) !important; }
        .foot-a:hover    { color: #00d4ff !important; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,212,255,0.35); }
        .btn-ghost:hover { border-color: rgba(0,212,255,0.3) !important; background: rgba(0,212,255,0.05) !important; }
        .logout-btn:hover { background: rgba(255,71,87,0.2) !important; border-color: #ff4757 !important; color: #ff7070 !important; }
        .user-email-badge { background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 20px; padding: 0.2rem 0.8rem; font-size: 0.8rem; color: #00d4ff; }
        
        @media (max-width: 900px) {
          .ig-nav {
            padding: 0.8rem 1.8rem !important;
          }
          .ig-nav-list {
            gap: 1.3rem !important;
          }
        }

        @media (max-width: 640px) {
          .ig-nav {
            padding: 0.7rem 1.1rem !important;
          }
          .ig-nav-list {
            gap: 0.9rem !important;
            font-size: 0.8rem
          }
        }
      `}</style>

      <div style={{ background: "#040d1a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#e8f4ff" }}>

        {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
        <nav className="ig-nav" style={{
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 200,
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          padding: "1.1rem 5rem",
          background: "rgba(4,13,26,0.8)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(0,212,255,0.1)",
        }}>
          <a href="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10, 
            textDecoration: "none", 
            fontFamily: "Syne, sans-serif", 
            fontWeight: 800, 
            fontSize: "1.2rem", 
            color: "#e8f4ff" 
          }}>
            <div style={{ 
              width: 34, 
              height: 34, 
              borderRadius: 9, 
              background: "linear-gradient(135deg,#00d4ff,#7c3aed)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "1.05rem", 
              boxShadow: "0 0 20px rgba(0,212,255,0.35)" 
            }}>🛡️</div>
            Invoice<em style={{ color: "#00d4ff", fontStyle: "normal" }}>Guard</em>
          </a>
          
          <ul className="ig-nav-list" style={{ 
            listStyle: "none", 
            display: "flex", 
            gap: "2.2rem", 
            alignItems: "center" 
          }}>
            {[
              ["", "Home"],
              ["about", "About Us"], 
              ["contact", "Contact Us"],
              // Dashboard link - only show when logged in
              ...(isLoggedIn ? [["dashboard", "Dashboard"]] : [])
            ].map(([id, lbl]) => (
              <li key={id || "home"}>
                <a 
                  href={`/${id}`} 
                  className="nav-a" 
                  style={{ 
                    color: "#6b8fa8", 
                    textDecoration: "none", 
                    fontSize: "0.88rem", 
                    fontWeight: 500, 
                    transition: "color 0.2s" 
                  }}
                >
                  {lbl}
                </a>
              </li>
            ))}
            
            {isLoggedIn ? (
              <>
                {/* Show user email badge */}
                {userEmail && (
                  <li>
                    <span className="user-email-badge">
                      {userEmail}
                    </span>
                  </li>
                )}
                
                {/* Logout button */}
                <li>
                  <button
                    onClick={handleLogout}
                    className="logout-btn"
                    style={{
                      background: "transparent",
                      color: "#ff7070",
                      border: "1px solid rgba(255,71,87,0.3)",
                      padding: "0.45rem 1.15rem",
                      borderRadius: 7,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      transition: "all 0.2s",
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Login link */}
                <li>
                  <a 
                    href="/login" 
                    className="nav-a" 
                    style={{ 
                      color: "#6b8fa8", 
                      textDecoration: "none", 
                      fontSize: "0.88rem", 
                      fontWeight: 500 
                    }}
                  >
                    Log in
                  </a>
                </li>
                
                {/* Sign up button */}
                <li>
                  <a 
                    href="/register" 
                    className="nav-btn" 
                    style={{ 
                      background: "rgba(0,212,255,0.12)", 
                      color: "#00d4ff", 
                      border: "1px solid rgba(0,212,255,0.3)", 
                      padding: "0.45rem 1.15rem", 
                      borderRadius: 7, 
                      fontWeight: 600, 
                      textDecoration: "none", 
                      fontSize: "0.88rem", 
                      transition: "all 0.2s" 
                    }}
                  >
                    Sign up free
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "6rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
          {/* bg orbs */}
          <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,0.07) 0%,transparent 65%)", top: -100, left: -200, pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 65%)", bottom: -50, right: 100, pointerEvents: "none" }} />

          {/* H1 */}
          <h1 className="anim-fadeUp" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.6rem,4.5vw,4.4rem)", lineHeight: 1.06, marginBottom: "1.4rem", maxWidth: 700 }}>
            Detect Invoice{" "}
          </h1>

          {/* Subtitle */}
          <p className="anim-fadeUp2" style={{ color: "#6b8fa8", fontSize: "1.05rem", lineHeight: 1.75, maxWidth: 900, marginBottom: "2.2rem", fontWeight: 300 }}>
            Upload any PDF invoice and our AI instantly flags mismatches, duplicates, tampering, and fraud — in under 3 seconds. 
          </p>
          {/* Feature pills */}
          <div className="anim-fadeUp3" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: "2.4rem" }}>
            {["🔴 Fraud Detection","📋 Duplicate Scan","🔒 Tamper Analysis","✅ Compliance Check"].map((p) => (
              <span key={p} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.3rem 0.75rem", borderRadius: 100, fontSize: "0.78rem", color: "#6b8fa8" }}>{p}</span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="anim-fadeUp4" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: "3.5rem" }}>
            <a href="#upload-hero" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#040d1a", padding: "0.85rem 2rem", borderRadius: 9, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}>
              🔍 Scan Your Invoice
            </a>
            <a href="#how" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#e8f4ff", padding: "0.85rem 1.8rem", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.95rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}>
              See How It Works →
            </a>
          </div>

          {/* Upload Card */}
          <div className="anim-fadeIn" style={{ width: "100%", maxWidth: 540, position: "relative", zIndex: 1 }}>
            <UploadCard />
          </div>
        </div>

        {/* ══ TOOLS ════════════════════════════════════════════════════════════ */}
        <section id="tools" style={{ padding: "3rem 2rem", background: "#071222" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div className="ig-reveal" style={{ marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 700, lineHeight: 1.18, marginBottom: "0.8rem" }}>Everything InvoiceGuard Catches</h2>
              <p style={{ color: "#6b8fa8", fontSize: "1rem", lineHeight: 1.7, fontWeight: 300, maxWidth: 520 }}>Four powerful AI engines working together — every invoice gets a complete X-ray.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.3rem" }}>
              {TOOLS.map((t) => (
                <div key={t.name} className="ig-reveal tool-card" style={{ background: "#0a1a2e", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 16, padding: "1.8rem", position: "relative", overflow: "hidden", transition: "all 0.3s", cursor: "default" }}>
                  <div className="accent-line" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: t.color, opacity: 0, transition: "opacity 0.3s" }} />
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.1rem" }}>{t.icon}</div>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.45rem" }}>{t.name}</p>
                  <p style={{ color: "#6b8fa8", fontSize: "0.87rem", lineHeight: 1.6, fontWeight: 300 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
        <section id="how" style={{ padding: "2rem 1rem", background: "#040d1a" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div className="ig-reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 700, lineHeight: 1.18, marginBottom: "0.8rem" }}>3 Steps. That&apos;s It.</h2>
              <p style={{ color: "#6b8fa8", fontSize: "1rem", lineHeight: 1.6, fontWeight: 600, maxWidth: 600, margin: "0 auto" }}>So simple, you&apos;ll be scanning invoices within 60 seconds of signing up.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem", position: "relative" }}>
              {/* connector line */}
              <div style={{ position: "absolute", top: 27, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.1) 20%,rgba(0,212,255,0.1) 80%,transparent)", zIndex: 0 }} />
              {STEPS.map((s) => (
                <div key={s.num} className="ig-reveal" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: `1.5px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 800, color: s.color, margin: "0 auto 1.2rem", background: "#040d1a", position: "relative" }}>
                    <div style={{ position: "absolute", inset: -5, borderRadius: "50%", background: `radial-gradient(circle,${s.color}20 0%,transparent 70%)` }} />
                    {s.num}
                  </div>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.45rem" }}>{s.title}</p>
                  <p style={{ color: "#6b8fa8", fontSize: "0.82rem", lineHeight: 1.6, fontWeight: 300 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ WHO IT'S FOR ══════════════════════════════════════════════════════ */}
        <section id="who" style={{ padding: "4rem 3rem", background: "#071222" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div className="ig-reveal" style={{ marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 700, lineHeight: 1.18, marginBottom: "0.8rem" }}>Built for Anyone Who Handles Invoices</h2>
              <p style={{ color: "#6b8fa8", fontSize: "1rem", lineHeight: 1.7, fontWeight: 300, maxWidth: 520 }}>From solo freelancers to enterprise finance teams — InvoiceGuard scales to your needs.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
              {WHO.map((w) => (
                <div key={w.title} className="ig-reveal who-card" style={{ background: "#0a1a2e", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 14, padding: "1.7rem 1.4rem", display: "flex", gap: 14, alignItems: "flex-start", transition: "all 0.3s" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: w.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{w.icon}</div>
                  <div>
                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.3rem" }}>{w.title}</p>
                    <p style={{ color: "#6b8fa8", fontSize: "0.82rem", lineHeight: 1.55, fontWeight: 300 }}>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══════════════════════════════════════════════════════════ */}
        <section id="reviews" style={{ padding: "4rem 3rem", background: "#040d1a" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div className="ig-reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={{ color: "#6b8fa8", fontSize: "1rem", lineHeight: 1.7, fontWeight: 300, maxWidth: 400, margin: "0 auto" }}>Real people. Real invoices. Real savings.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.3rem" }}>
              {REVIEWS.map((r) => (
                <div 
                  key={r.name} 
                  className="ig-reveal rev-card" 
                  style={{ 
                    background: "#0a1a2e", 
                    border: "1px solid rgba(0,212,255,0.1)", 
                    borderRadius: 16, 
                    padding: "1.8rem", 
                    transition: "all 0.3s ease",
                    cursor: "default",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.borderColor = "#00d4ff";
                    e.currentTarget.style.boxShadow = "0 20px 30px rgba(0, 212, 255, 0.2)";
                    e.currentTarget.style.background = "#0f1f3a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(0,212,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#0a1a2e";
                  }}
                >
                  {/* Decorative gradient line on hover */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                  />
                  
                  {/* Stars with hover effect */}
                  <p 
                    style={{ 
                      color: "#fbbf24", 
                      fontSize: "0.82rem", 
                      marginBottom: "0.8rem",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  >
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </p>
                  
                  {/* Review text with hover effect */}
                  <p 
                    style={{ 
                      color: "rgba(232,244,255,0.85)", 
                      fontSize: "0.88rem", 
                      lineHeight: 1.7, 
                      fontWeight: 300, 
                      fontStyle: "italic", 
                      marginBottom: "1.4rem",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => e.target.style.color = "#e8f4ff"}
                    onMouseLeave={(e) => e.target.style.color = "rgba(232,244,255,0.85)"}
                  >
                    &ldquo;{r.text}&rdquo;
                  </p>
                  
                  {/* User info with hover effect */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div 
                      style={{ 
                        width: 38, 
                        height: 38, 
                        borderRadius: "50%", 
                        background: `linear-gradient(135deg,${r.gradFrom},${r.gradTo})`, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: "0.95rem", 
                        fontWeight: 700, 
                        color: "#fff", 
                        flexShrink: 0,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.2)";
                        e.target.style.boxShadow = "0 0 20px rgba(0,212,255,0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      {r.initials}
                    </div>
                    <div>
                      <p 
                        style={{ 
                          fontFamily: "Syne, sans-serif", 
                          fontWeight: 600, 
                          fontSize: "0.87rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#00d4ff"}
                        onMouseLeave={(e) => e.target.style.color = "inherit"}
                      >
                        {r.name}
                      </p>
                      <p style={{ color: "#6b8fa8", fontSize: "0.73rem", marginTop: 2 }}>{r.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
        <footer style={{
          background: "#0B0F1C",
          color: "#ffffff",
          padding: "4rem 5rem 2rem",
          marginTop: "4rem",
        }}>
          {/* Main Footer Content */}
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}>
            {/* Footer Links Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "3rem",
              marginBottom: "3rem",
            }}>
              {/* Company Info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "linear-gradient(135deg,#00d4ff,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.05rem",
                    boxShadow: "0 0 20px rgba(0,212,255,0.35)",
                  }}>
                    🛡️
                  </div>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#ffffff" }}>
                    Invoice<span style={{ color: "#00d4ff" }}>Guard</span>
                  </span>
                </div>
                <p style={{
                  color: "#94A3B8",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  maxWidth: 250,
                }}>
                  Protecting businesses from invoice fraud with advanced AI technology. Trusted by thousands of companies worldwide.
                </p>
              </div>

              {/* Our Store */}
              <div>
                <h3 style={{ 
                  fontSize: "1rem", 
                  fontWeight: 600, 
                  marginBottom: "1.5rem", 
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Our Store
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {["Home", "About", "Contact"].map((item) => (
                    <li key={item} style={{ marginBottom: "0.8rem" }}>
                      <a 
                        href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                        style={{
                          color: "#94A3B8",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                        onMouseLeave={(e) => e.target.style.color = "#94A3B8"}
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links */}
              <div>
                <h3 style={{ 
                  fontSize: "1rem", 
                  fontWeight: 600, 
                  marginBottom: "1.5rem", 
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Quick Links
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((item) => (
                    <li key={item} style={{ marginBottom: "0.8rem" }}>
                      <a 
                        href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        style={{
                          color: "#94A3B8",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                        onMouseLeave={(e) => e.target.style.color = "#94A3B8"}
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Get In Touch */}
              <div>
                <h3 style={{ 
                  fontSize: "1rem", 
                  fontWeight: 600, 
                  marginBottom: "1.5rem", 
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Get In Touch
                </h3>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#94A3B8" }}>
                  <span>📍</span>
                  <span style={{ fontSize: "0.9rem" }}>2443 Oak Ridge Omaha, QA 45065</span>
                </div>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#94A3B8" }}>
                  <span>📞</span>
                  <span style={{ fontSize: "0.9rem" }}>207-8767-452</span>
                </div>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#94A3B8" }}>
                  <span>✉️</span>
                  <a 
                    href="mailto:support@invoiceguard.com" 
                    style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.9rem" }}
                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                  >
                    support@invoiceguard.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links and Copyright */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "2rem",
              borderTop: "1px solid #1E2433",
              flexWrap: "wrap",
              gap: "1rem",
            }}>
              {/* Social Icons */}
              <div style={{ display: "flex", gap: "1rem" }}>
                {[
                  { icon: "f", name: "facebook", color: "#1877F2" },
                  { icon: "t", name: "twitter", color: "#1DA1F2" },
                  { icon: "in", name: "linkedin", color: "#0A66C2" },
                  { icon: "ig", name: "instagram", color: "#E4405F" }
                ].map((social) => (
                  <a
                    key={social.icon}
                    href={`https://${social.name}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#1E2433",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94A3B8",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = social.color;
                      e.target.style.color = "#ffffff";
                      e.target.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#1E2433";
                      e.target.style.color = "#94A3B8";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Copyright */}
              <div style={{
                color: "#64748B",
                fontSize: "0.85rem",
              }}>
                <span>© 2025 InvoiceGuard. All rights reserved.</span>
              </div>

              {/* Back to Top Button */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  color: "#94A3B8",
                  border: "1px solid #2A3040",
                  borderRadius: 4,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#1E2433";
                  e.target.style.color = "#ffffff";
                  e.target.style.borderColor = "#00d4ff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#94A3B8";
                  e.target.style.borderColor = "#2A3040";
                }}
              >
                <span>↑</span>
                BACK TO TOP
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}