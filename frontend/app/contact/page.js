"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { submitContactForm } from "@/lib/api";


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, success: false, message: "" });

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ show: false, success: false, message: "" });

    // Basic frontend validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({
        show: true,
        success: false,
        message: "All fields are required"
      });
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        show: true,
        success: false,
        message: "Please enter a valid email address"
      });
      setLoading(false);
      return;
    }

    const result = await submitContactForm(formData);

    if (result.success) {
      setStatus({
        show: true,
        success: true,
        message: result.data.message || "Your message has been sent successfully!"
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setStatus({ show: false, success: false, message: "" });
      }, 5000);
    } else {
      setStatus({
        show: true,
        success: false,
        message: result.error || "Failed to send message. Please try again."
      });
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #040d1a;
          color: #e8f4ff;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .gradient-text {
          background: linear-gradient(135deg, #00d4ff, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-a:hover {
          color: #e8f4ff !important;
        }

        .nav-btn:hover {
          background: rgba(0,212,255,0.22) !important;
        }

        .contact-card {
          background: #0a1a2e;
          border: 1px solid rgba(0,212,255,0.1);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s ease;
          height: 100%;
        }

        .contact-card:hover {
          transform: translateY(-5px);
          border-color: #00d4ff;
          box-shadow: 0 20px 40px rgba(0,212,255,0.15);
          background: #0f1f3a;
        }

        .form-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: #0a1a2e;
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 8px;
          color: #e8f4ff;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.1);
          background: #0f1f3a;
        }

        .form-input:hover {
          border-color: #00d4ff;
        }

        .form-input::placeholder {
          color: #6b8fa8;
          opacity: 0.7;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #00d4ff, #7c3aed);
          color: #020617;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,212,255,0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .info-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: rgba(0,212,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          transition: all 0.3s ease;
        }

        .contact-card:hover .info-icon {
          background: rgba(0,212,255,0.2);
          transform: scale(1.1);
        }

        .breadcrumb {
          color: #6b8fa8;
          font-size: 0.9rem;
        }

        .breadcrumb a {
          color: #00d4ff;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .status-message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease;
          font-size: 0.95rem;
        }

        .status-success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid #22c55e;
          color: #22c55e;
        }

        .status-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #ef4444;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .contact-info-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          nav {
            padding: 1rem 2rem !important;
          }
          
          nav ul {
            gap: 1rem !important;
          }
          
          nav ul li:not(:last-child) {
            display: none;
          }
          
          .contact-info-grid {
            grid-template-columns: 1fr !important;
          }
          
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          section {
            padding: 2rem 1.5rem !important;
          }
          
          .contact-card {
            padding: 1.5rem !important;
          }
          
          .submit-btn {
            padding: 0.8rem !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#040d1a",
        color: "#e8f4ff",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Navigation */}
        <nav style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 5rem",
          background: "rgba(4,13,26,0.8)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(0,212,255,0.1)",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#e8f4ff" }}>
              Invoice<span style={{ color: "#00d4ff" }}>Guard</span>
            </span>
          </Link>

          <ul style={{ listStyle: "none", display: "flex", gap: "2.2rem", alignItems: "center" }}>
            <li>
              <Link href="/" className="nav-a" style={{ color: "#6b8fa8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500 }}>Home</Link>
            </li>
            <li>
              <Link href="/about" className="nav-a" style={{ color: "#6b8fa8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500 }}>About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="nav-a" style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}>Contact Us</Link>
            </li>
            <li>
              <Link href="/login" className="nav-a" style={{ color: "#6b8fa8", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500 }}>
                Log in
              </Link>
            </li>
            <li>
              <Link href="/register" className="nav-btn" style={{
                background: "rgba(0,212,255,0.12)",
                color: "#00d4ff",
                border: "1px solid rgba(0,212,255,0.3)",
                padding: "0.45rem 1.15rem",
                borderRadius: 7,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.88rem",
              }}>
                Sign up free
              </Link>
            </li>
          </ul>
        </nav>

        {/* Breadcrumb */}
        <div style={{
          padding: "6rem 5rem 0",
        }}>
          
        </div>

        {/* Hero Section */}
        <section style={{
          padding: "2rem 5rem 3rem",
          textAlign: "center",
        }}>
          <div className="reveal">
            <h1 style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 800,
              marginBottom: "0.5rem",
            }}>
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p style={{
              color: "#6b8fa8",
              fontSize: "1.1rem",
              maxWidth: 600,
              margin: "0 auto",
            }}>
              Get in touch with our team. We're here to help and answer any questions.
            </p>
          </div>
        </section>

        {/* Contact Form and Info Section */}
        <section style={{
          padding: "2rem 5rem 4rem",
        }}>
          <div className="contact-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
          }}>
            {/* Contact Form */}
            <div className="reveal contact-card" style={{ padding: "2.5rem" }}>
              <h2 style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: "2rem",
              }}>
                Send us a <span className="gradient-text">Message</span>
              </h2>

              {/* Status Message */}
              {status.show && (
                <div className={`status-message ${status.success ? 'status-success' : 'status-error'}`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b8fa8" }}>
                    Your Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b8fa8" }}>
                    Email Address <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b8fa8" }}>
                    Subject <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b8fa8" }}>
                    Message <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    rows="5"
                    className="form-input"
                    required
                    disabled={loading}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="loading-spinner"></span>
                      Sending...
                    </span>
                  ) : (
                    'Send Message →'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <div className="reveal" style={{ marginBottom: "2rem" }}>
                <h2 style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}>
                  Get in <span className="gradient-text">Touch</span>
                </h2>
                <p style={{ color: "#6b8fa8", lineHeight: 1.8 }}>
                  Have questions about InvoiceGuard? Our team is ready to help you protect your business from invoice fraud.
                </p>
              </div>

              <div className="contact-info-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1rem",
              }}>
                {/* Phone */}
                <div className="reveal contact-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem" }}>
                  <div className="info-icon">📞</div>
                  <div>
                    <h3 style={{ fontSize: "1rem", color: "#6b8fa8", marginBottom: "0.3rem" }}>Phone Number</h3>
                    <p style={{ fontSize: "1.1rem", color: "#00d4ff", fontWeight: 600 }}>+1 (207) 876-7452</p>
                  </div>
                </div>

                {/* Email */}
                <div className="reveal contact-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem" }}>
                  <div className="info-icon">✉️</div>
                  <div>
                    <h3 style={{ fontSize: "1rem", color: "#6b8fa8", marginBottom: "0.3rem" }}>Email Address</h3>
                    <p style={{ fontSize: "1.1rem", color: "#00d4ff", fontWeight: 600 }}>support@invoiceguard.com</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="reveal contact-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem" }}>
                  <div className="info-icon">💬</div>
                  <div>
                    <h3 style={{ fontSize: "1rem", color: "#6b8fa8", marginBottom: "0.3rem" }}>WhatsApp</h3>
                    <p style={{ fontSize: "1.1rem", color: "#00d4ff", fontWeight: 600 }}>+1 (082) 245-7253</p>
                  </div>
                </div>

                {/* Office */}
                <div className="reveal contact-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem" }}>
                  <div className="info-icon">📍</div>
                  <div>
                    <h3 style={{ fontSize: "1rem", color: "#6b8fa8", marginBottom: "0.3rem" }}>Our Office</h3>
                    <p style={{ fontSize: "0.95rem", color: "#e8f4ff" }}>2443 Oak Ridge Omaha, QA 45065</p>
                  </div>
                </div>
              </div>

              {/* Map Link */}
              <div className="reveal" style={{ marginTop: "1.5rem" }}>
                <Link href="#" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#00d4ff",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  transition: "gap 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.gap = "0.8rem";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.gap = "0.5rem";
                }}>
                  <span>📍</span>
                  <span>View on Google Maps →</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        
        {/* Footer */}
        <footer style={{
          background: "#0B0F1C",
          color: "#ffffff",
          padding: "4rem 5rem 2rem",
        }}>
          <div className="footer-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "3rem",
            marginBottom: "3rem",
          }}>
            {/* Company Info */}
            <div>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "#ffffff",
              }}>
                Invoice<span style={{ color: "#00d4ff" }}>Guard</span>
              </h2>
              <p style={{
                color: "#94A3B8",
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}>
                Protecting businesses from invoice fraud with advanced AI technology.
              </p>
            </div>

            {/* Our Store */}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem", color: "#ffffff" }}>Our Store</h3>
              <ul style={{ listStyle: "none" }}>
                <li style={{ marginBottom: "0.8rem" }}>
                  <Link href="/" style={{ color: "#94A3B8", textDecoration: "none" }}>Home</Link>
                </li>
                <li style={{ marginBottom: "0.8rem" }}>
                  <Link href="/about" style={{ color: "#94A3B8", textDecoration: "none" }}>About</Link>
                </li>
                <li style={{ marginBottom: "0.8rem" }}>
                  <Link href="/contact" style={{ color: "#00d4ff", textDecoration: "none" }}>Contact</Link>
                </li>
              </ul>
            </div>

            {/* Get In Touch */}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem", color: "#ffffff" }}>Get In Touch</h3>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#94A3B8" }}>
                <span>📍</span>
                <span>2443 Oak Ridge Omaha, QA 45065</span>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#94A3B8" }}>
                <span>📞</span>
                <span>207-8767-452</span>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", color: "#94A3B8" }}>
                <span>✉️</span>
                <Link href="mailto:support@invoiceguard.com" style={{ color: "#00d4ff", textDecoration: "none" }}>
                  support@invoiceguard.com
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem", color: "#ffffff" }}>Follow Us</h3>
              <div style={{ display: "flex", gap: "1rem" }}>
                {["f", "t", "in", "ig"].map((social) => (
                  <Link
                    key={social}
                    href="#"
                    style={{
                      width: 40,
                      height: 40,
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
                      e.target.style.background = "#00d4ff";
                      e.target.style.color = "#020617";
                      e.target.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#1E2433";
                      e.target.style.color = "#94A3B8";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    {social}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-bottom" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "2rem",
            borderTop: "1px solid #1E2433",
            color: "#64748B",
            fontSize: "0.9rem",
          }}>
            <p>© 2025 InvoiceGuard. All rights reserved.</p>
            <div style={{ display: "flex", gap: "2rem" }}>
              <Link href="/privacy" style={{ color: "#64748B", textDecoration: "none" }}>Privacy</Link>
              <Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}