"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── DATA ─────────────────────────────────────────────────────────────────────



const VALUES = [
  {
    icon: "🔍",
    title: "Radical Transparency",
    desc: "We don't just tell you an invoice is suspicious — we show you exactly why, with clear explanations you can act on.",
  },
  {
    icon: "⚡",
    title: "Speed Without Compromise",
    desc: "3 seconds per invoice. No delays, no waiting. Because in finance, time is literally money.",
  },
  {
    icon: "🛡️",
    title: "Bank-Grade Security",
    desc: "AES-256 encryption, GDPR compliant, and we never store your actual invoice data without permission.",
  },
  {
    icon: "🎯",
    title: "Built for Real People",
    desc: "Our team includes accountants and auditors. We built this for ourselves first — then for you.",
  },
];

const MILESTONES = [
  { year: "2022", event: "InvoiceGuard founded in London, UK" },
  { year: "2023", event: "Launched AI fraud detection engine — processed 10,000+ invoices in first month" },
  { year: "2024", event: "Secured $5M in seed funding from top fintech VCs" },
  { year: "2025", event: "Now protecting 5,000+ businesses across 30 countries" },
];

// ─── ABOUT US PAGE ────────────────────────────────────────────────────────────

export default function AboutUsPage() {
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
        @keyframes fadeUp     { from{opacity:0;transform:translateY(24px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }

        .anim-fadeUp   { animation: fadeUp  0.8s ease 0.15s both; }
        .anim-fadeIn   { animation: fadeIn  1s   ease 0.5s  both; }

        .team-card:hover { transform: translateY(-8px) !important; border-color: #00d4ff !important; box-shadow: 0 20px 40px rgba(0,212,255,0.2) !important; }
        .value-card:hover { border-color: rgba(124,58,237,0.4) !important; background: #0f1f3a !important; }
        .nav-a:hover     { color: #e8f4ff !important; }
        .nav-btn:hover   { background: rgba(0,212,255,0.22) !important; }
        .foot-a:hover    { color: #00d4ff !important; }
        
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
            font-size: 0.8rem;
          }
        }
      `}</style>

      <div style={{ background: "#040d1a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#e8f4ff" }}>

        {/* ══ NAV (Same as home page) ═══════════════════════════════════════ */}
        <nav className="ig-nav" style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1.1rem 5rem",
          background: "rgba(4,13,26,0.8)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(0,212,255,0.1)",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#e8f4ff" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#00d4ff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", boxShadow: "0 0 20px rgba(0,212,255,0.35)" }}>🛡️</div>
            Invoice<em style={{ color: "#00d4ff", fontStyle: "normal" }}>Guard</em>
          </Link>
          <ul className="ig-nav-list" style={{ listStyle: "none", display: "flex", gap: "2.2rem", alignItems: "center" }}>
            <li>
              <Link href="/" className="nav-a" style={{ color: "#6b8fa8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, transition: "color 0.2s" }}>Home</Link>
            </li>
            <li>
              <Link href="/about" className="nav-a" style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, transition: "color 0.2s" }}>About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="nav-a" style={{ color: "#6b8fa8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, transition: "color 0.2s" }}>Contact Us</Link>
            </li>
            <li>
              <Link href="/login" className="nav-a" style={{ color: "#6b8fa8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500 }}>
                Log in
              </Link>
            </li>
            <li>
              <Link href="/register" className="nav-btn" style={{ background: "rgba(0,212,255,0.12)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.3)", padding: "0.45rem 1.15rem", borderRadius: 7, fontWeight: 600, textDecoration: "none", fontSize: "0.88rem", transition: "all 0.2s" }}>
                Sign up free
              </Link>
            </li>
          </ul>
        </nav>

        {/* ══ HERO SECTION ════════════════════════════════════════════════ */}
        <div style={{ 
          padding: "8rem 2rem 4rem", 
          textAlign: "center", 
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #040d1a 0%, #071222 100%)"
        }}>
          {/* Background orbs */}
          <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,0.08) 0%,transparent 65%)", top: -200, left: -100, pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 65%)", bottom: -150, right: -50, pointerEvents: "none" }} />

          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            
            
            <h1 className="anim-fadeUp" style={{ 
              fontFamily: "Syne, sans-serif", 
              fontSize: "clamp(2.5rem, 5vw, 4rem)", 
              fontWeight: 800, 
              lineHeight: 1.1, 
              marginBottom: "1.5rem" 
            }}>
              
              <span style={{ background: "linear-gradient(135deg,#00d4ff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                About Us
              </span>
            </h1>
            
            <p className="anim-fadeUp2" style={{ 
              color: "#9fb6c8", 
              fontSize: "1.2rem", 
              lineHeight: 1.7, 
              marginBottom: "2.5rem",
              maxWidth: 850,
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              What started as a frustration with manual invoice checking became a mission: 
              build AI that protects businesses from fraud, in seconds."Every day, businesses lose millions to invoice fraud. We built InvoiceGuard to give
              <span style={{ color: "#00d4ff" }}> finance teams, accountants, and business owners </span> 
              a weapon against it — without slowing down their workflow."
            </p>
          </div>
        </div>

        

        {/* ══ OUR STORY ════════════════════════════════════════════════════ */}
        <section style={{ padding: "3rem 2rem", background: "#040d1a" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="ig-reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
              <div>
                
                <h2 style={{ 
                  fontFamily: "Syne, sans-serif", 
                  fontSize: "clamp(2rem, 4vw, 2.8rem)", 
                  fontWeight: 700, 
                  lineHeight: 1.2, 
                  marginBottom: "1.5rem" 
                }}>
                  From frustration to{" "}
                  <span style={{ color: "#ff6b35" }}>solution</span>
                </h2>
                <p style={{ color: "#9fb6c8", fontSize: "1rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                  In 2022, our co-founders Alex and Sarah were working at different companies — 
                  both drowning in manual invoice verification. Alex's team at Google was building 
                  AI systems while manually checking vendor invoices. Sarah's team at Stripe was 
                  catching payment fraud but had no tools for invoice fraud.
                </p>
                <p style={{ color: "#9fb6c8", fontSize: "1rem", lineHeight: 1.8 }}>
                  They realized the problem wasn't a lack of data — it was a lack of AI 
                  specifically trained to understand invoices. So they built it themselves. 
                  Today, InvoiceGuard scans thousands of invoices daily, saving businesses 
                  millions in potential fraud losses.
                </p>
              </div>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(2, 1fr)", 
                gap: "1.5rem"
              }}>
                {MILESTONES.map((m, i) => (
                  <div key={i} style={{ 
                    background: "#0a1a2e", 
                    border: "1px solid rgba(0,212,255,0.1)", 
                    borderRadius: 16, 
                    padding: "1.5rem",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.borderColor = "#00d4ff";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,212,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(0,212,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  >
                    <p style={{ color: "#00d4ff", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>{m.year}</p>
                    <p style={{ color: "#e8f4ff", fontSize: "0.9rem", lineHeight: 1.6 }}>{m.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
{/* Stats Section */}
<section style={{
  padding: "4rem 5rem",
  background: "#071222",
  borderTop: "1px solid rgba(0,212,255,0.1)",
  borderBottom: "1px solid rgba(0,212,255,0.1)",
}}>
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
    maxWidth: 1000,
    margin: "0 auto",
  }}>
    {[
      { value: "50K+", label: "Invoices Scanned" },
      { value: "99.2%", label: "Detection Accuracy" },
      { value: "5K+", label: "Happy Customers" },
      { value: "24/7", label: "AI Protection" },
    ].map((stat, index) => (
      <div 
        key={index} 
        className="reveal" 
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "#0a1a2e",
          borderRadius: 16,
          border: "1px solid rgba(0,212,255,0.1)",
          transition: "all 0.3s ease",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.background = "#0f1f3a";
          e.currentTarget.style.borderColor = "#00d4ff";
          e.currentTarget.style.boxShadow = "0 20px 30px rgba(0, 212, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.background = "#0a1a2e";
          e.currentTarget.style.borderColor = "rgba(0,212,255,0.1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <p style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "2.5rem",
          fontWeight: 800,
          color: "#00d4ff",
          marginBottom: "0.5rem",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.color = "#7c3aed";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.color = "#00d4ff";
        }}
        >
          {stat.value}
        </p>
        <p style={{ 
          color: "#94a3b8", 
          fontSize: "0.9rem",
          transition: "color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.color = "#e8f4ff";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "#94a3b8";
        }}
        >
          {stat.label}
        </p>
      </div>
    ))}
  </div>
</section>
        {/* ══ OUR VALUES ════════════════════════════════════════════════════ */}
        <section style={{ padding: "2rem 1rem", background: "#071222" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="ig-reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
            
              <h2 style={{ 
                fontFamily: "Syne, sans-serif", 
                fontSize: "clamp(2rem, 4vw, 2.8rem)", 
                fontWeight: 700, 
                lineHeight: 1.2, 
                marginBottom: "1rem" 
              }}>
                Our core <span style={{ color: "#7c3aed" }}>values</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
              {VALUES.map((v, i) => (
                <div key={i} className="ig-reveal value-card" style={{ 
                  background: "#0a1a2e", 
                  border: "1px solid rgba(0,212,255,0.1)", 
                  borderRadius: 20, 
                  padding: "2rem",
                  transition: "all 0.3s",
                  display: "flex",
                  gap: "1.5rem"
                }}>
                  <div style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 15, 
                    background: "rgba(0,212,255,0.1)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "2rem",
                    flexShrink: 0
                  }}>
                    {v.icon}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>{v.title}</h3>
                    <p style={{ color: "#9fb6c8", fontSize: "0.9rem", lineHeight: 1.7 }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ══ CTA SECTION ═══════════════════════════════════════════════════ */}
        <section style={{ padding: "5rem 2rem", textAlign: "center", background: "#040d1a" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 className="ig-reveal" style={{ 
              fontFamily: "Syne, sans-serif", 
              fontSize: "clamp(2rem, 4vw, 2.5rem)", 
              fontWeight: 700, 
              lineHeight: 1.3, 
              marginBottom: "1.5rem" 
            }}>
              Ready to protect your business from invoice fraud?
            </h2>
            <p className="ig-reveal" style={{ color: "#9fb6c8", fontSize: "1.1rem", marginBottom: "2rem" }}>
              Join thousands of businesses that trust InvoiceGuard to catch fraud before it costs them.
            </p>
            <div className="ig-reveal" style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/register" style={{
                background: "linear-gradient(135deg,#00d4ff,#0099cc)",
                color: "#040d1a",
                padding: "1rem 2rem",
                borderRadius: 9,
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(0,212,255,0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}>
                Start free trial →
              </Link>
              <Link href="/contact" style={{
                background: "transparent",
                color: "#e8f4ff",
                padding: "1rem 2rem",
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "1rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.05)";
                e.target.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
              }}>
                Contact sales
              </Link>
            </div>
          </div>
        </section>

        {/* Footer - ATARAXIS Style */}
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
          {["Home", "About", "Contact"].map((item, index) => (
            <li key={item} style={{ marginBottom: "0.8rem" }}>
              <Link 
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                style={{
                  color: index === 1 ? "#00d4ff" : "#94A3B8", // About link ko blue
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  transition: "color 0.2s",
                  fontWeight: index === 1 ? 600 : 400,
                }}
                onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                onMouseLeave={(e) => e.target.style.color = index === 1 ? "#00d4ff" : "#94A3B8"}
              >
                {item}
              </Link>
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
              <Link 
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
              </Link>
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
          <span>📞</span>
          <span style={{ fontSize: "0.9rem" }}>082-245-7253</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#94A3B8" }}>
          <span>✉️</span>
          <Link 
            href="mailto:support@invoiceguard.com" 
            style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.9rem" }}
            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          >
            support@invoiceguard.com
          </Link>
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
          <Link
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
          </Link>
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