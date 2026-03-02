"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isActive = (path) => {
    return pathname === path;
  };

  return (
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
      {/* Logo - Home page link */}
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
        <span style={{ 
          fontFamily: "Syne, sans-serif", 
          fontWeight: 800, 
          fontSize: "1.2rem", 
          color: "#e8f4ff" 
        }}>
          Invoice<span style={{ color: "#00d4ff" }}>Guard</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <ul style={{ 
        listStyle: "none", 
        display: "flex", 
        gap: "2.2rem", 
        alignItems: "center",
        margin: 0,
        padding: 0,
      }}>
        {/* Home Link */}
        <li>
          <Link 
            href="/" 
            style={{ 
              color: isActive("/") ? "#00d4ff" : "#6b8fa8", 
              textDecoration: "none", 
              fontSize: "0.88rem", 
              fontWeight: isActive("/") ? 600 : 500,
              transition: "all 0.2s",
              borderBottom: isActive("/") ? "2px solid #00d4ff" : "2px solid transparent",
              paddingBottom: "0.25rem",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/")) e.target.style.color = "#e8f4ff";
            }}
            onMouseLeave={(e) => {
              if (!isActive("/")) e.target.style.color = "#6b8fa8";
            }}
          >
            Home
          </Link>
        </li>

        {/* About Us Link */}
        <li>
          <Link 
            href="/about" 
            style={{ 
              color: isActive("/about") ? "#00d4ff" : "#6b8fa8", 
              textDecoration: "none", 
              fontSize: "0.88rem", 
              fontWeight: isActive("/about") ? 600 : 500,
              transition: "all 0.2s",
              borderBottom: isActive("/about") ? "2px solid #00d4ff" : "2px solid transparent",
              paddingBottom: "0.25rem",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/about")) e.target.style.color = "#e8f4ff";
            }}
            onMouseLeave={(e) => {
              if (!isActive("/about")) e.target.style.color = "#6b8fa8";
            }}
          >
            About Us
          </Link>
        </li>

        {/* Contact Us Link */}
        <li>
          <Link 
            href="/contact" 
            style={{ 
              color: isActive("/contact") ? "#00d4ff" : "#6b8fa8", 
              textDecoration: "none", 
              fontSize: "0.88rem", 
              fontWeight: isActive("/contact") ? 600 : 500,
              transition: "all 0.2s",
              borderBottom: isActive("/contact") ? "2px solid #00d4ff" : "2px solid transparent",
              paddingBottom: "0.25rem",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/contact")) e.target.style.color = "#e8f4ff";
            }}
            onMouseLeave={(e) => {
              if (!isActive("/contact")) e.target.style.color = "#6b8fa8";
            }}
          >
            Contact Us
          </Link>
        </li>

        {/* Features Link */}
        <li>
          <Link 
            href="/features" 
            style={{ 
              color: isActive("/features") ? "#00d4ff" : "#6b8fa8", 
              textDecoration: "none", 
              fontSize: "0.88rem", 
              fontWeight: isActive("/features") ? 600 : 500,
              transition: "all 0.2s",
              borderBottom: isActive("/features") ? "2px solid #00d4ff" : "2px solid transparent",
              paddingBottom: "0.25rem",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/features")) e.target.style.color = "#e8f4ff";
            }}
            onMouseLeave={(e) => {
              if (!isActive("/features")) e.target.style.color = "#6b8fa8";
            }}
          >
            Features
          </Link>
        </li>

        {/* Pricing Link */}
        <li>
          <Link 
            href="/pricing" 
            style={{ 
              color: isActive("/pricing") ? "#00d4ff" : "#6b8fa8", 
              textDecoration: "none", 
              fontSize: "0.88rem", 
              fontWeight: isActive("/pricing") ? 600 : 500,
              transition: "all 0.2s",
              borderBottom: isActive("/pricing") ? "2px solid #00d4ff" : "2px solid transparent",
              paddingBottom: "0.25rem",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/pricing")) e.target.style.color = "#e8f4ff";
            }}
            onMouseLeave={(e) => {
              if (!isActive("/pricing")) e.target.style.color = "#6b8fa8";
            }}
          >
            Pricing
          </Link>
        </li>

        {/* Login Link */}
        <li>
          <Link 
            href="/login" 
            style={{ 
              color: "#6b8fa8", 
              textDecoration: "none", 
              fontSize: "0.88rem", 
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.color = "#e8f4ff"}
            onMouseLeave={(e) => e.target.style.color = "#6b8fa8"}
          >
            Log in
          </Link>
        </li>

        {/* Sign Up Button */}
        <li>
          <Link 
            href="/register" 
            style={{
              background: "rgba(0,212,255,0.12)",
              color: "#00d4ff",
              border: "1px solid rgba(0,212,255,0.3)",
              padding: "0.45rem 1.15rem",
              borderRadius: 7,
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.88rem",
              transition: "all 0.2s",
              display: "inline-block",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0,212,255,0.22)";
              e.target.style.border = "1px solid rgba(0,212,255,0.5)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 5px 15px rgba(0,212,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0,212,255,0.12)";
              e.target.style.border = "1px solid rgba(0,212,255,0.3)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Sign up free
          </Link>
        </li>
      </ul>
    </nav>
  );
}