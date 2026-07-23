"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LogoName from "@/components/LogoName";
import LandingPageCard from "@/components/LandingPageCard";

export default function LandingPage() {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--theme-bg-main)",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: "1rem",
        overflowX: "hidden",
        position: "relative",
        maxWidth: "100vw"
      }}
    >
      <div
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.3,
          zIndex: 0
        }}
      />

      {/* Animated Glowing Orbs */}
      <div
        className="position-absolute rounded-circle"
        style={{
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, var(--theme-accent) 0%, transparent 60%)",
          opacity: 0.08,
          top: "-20vw",
          right: "-10vw",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "float 12s ease-in-out infinite alternate"
        }}
      />

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(40px) scale(1.05); }
        }
        .nav-login-btn {
          background: rgba(255,255,255,0.0);
          border: 1px solid transparent;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .nav-login-btn:hover {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .nav-get-started-btn {
          background: linear-gradient(135deg, var(--theme-accent) 0%, #ff4500 100%);
          border: 1px solid rgba(255,87,34,0.3);
          box-shadow: 0 4px 15px rgba(255, 87, 34, 0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .nav-get-started-btn:hover {
          box-shadow: 0 8px 25px rgba(255, 87, 34, 0.5);
          filter: brightness(1.1);
        }

        @media (max-width: 575.98px) {
          .nav-btn-mobile {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0.35rem 0.45rem !important;
            border: none !important;
            color: white !important;
            border-radius: 50% !important;
            transition: all 0.2s ease-in-out !important;
          }
          .nav-btn-mobile:hover {
            background: rgba(255,87,34,0.15) !important;
            color: var(--theme-accent) !important;
          }
          .hero-btn-mobile {
            padding: 0.4rem 1rem !important;
            font-size: 0.85rem !important;
            width: 100% !important;
          }
          .hero-btns-container {
            flex-direction: column;
            gap: 0.75rem !important;
            width: 100%;
            margin-top: 0.5rem !important;
          }
          .hero-btns-container > div {
            width: 100%;
          }
          .hero-title {
            font-size: 2.3rem !important;
            margin-bottom: 0.75rem !important;
          }
          .hero-desc {
            font-size: 1rem !important;
            width: 95% !important;
            margin-bottom: 1.5rem !important;
            line-height: 1.4 !important;
          }
          .hero-badge {
            margin-bottom: 1rem !important;
            padding: 0.25rem 1rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="pt-4 pe-2 ps-3 px-md-5 position-relative z-1 w-100">
        <div className="container-fluid px-0 px-md-3 d-flex justify-content-between align-items-center">
          <div className="flex-shrink-0">
            <LogoName disableRouting={true} />
          </div>
          <div className="d-flex gap-1 gap-sm-3 align-items-center flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/login" 
                className="btn text-white text-decoration-none fw-medium px-2 px-sm-4 py-sm-2 d-flex align-items-center justify-content-center nav-btn-mobile ms-auto rounded-pill nav-login-btn"
              >
                <span className="d-none d-sm-inline">Login</span>
                <i className="bi bi-box-arrow-in-right d-inline d-sm-none fs-4"></i>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/register" 
                className="btn rounded-pill px-3 px-sm-4 py-2 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center nav-btn-mobile nav-get-started-btn"
              >
                <span className="d-none d-sm-inline">Get Started</span>
                <i className="bi bi-rocket d-inline d-sm-none fs-4"></i>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mt-4 d-flex flex-column align-items-center justify-content-center text-center position-relative z-1" style={{ minHeight: "75vh" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="d-inline-flex align-items-center justify-content-center px-4 py-2 rounded-pill mb-4 hero-badge"
          style={{
            background: "rgba(255,87,34,0.1)",
            border: "1px solid rgba(255,87,34,0.3)",
            color: "var(--theme-accent)"
          }}
        >
          <span className="fw-bold" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>INTRODUCING DISPATCHR</span>
        </motion.div>

        <motion.h1
          className="display-2 fw-bold mb-4 hero-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "var(--font-righteous)",
            background: "linear-gradient(135deg, #fff 0%, #aaa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}
        >
          Automate Your Data Reporting
        </motion.h1>

        <motion.p
          className="lead mb-5 w-75 theme-text-muted hero-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ fontSize: "1.25rem", lineHeight: "1.6" }}
        >
          Say goodbye to manual data pulls. Ingest from APIs, automatically generate beautiful PDF reports, and schedule delivery to your team or clients without writing a single line of code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="d-flex gap-3 align-items-center mt-3 hero-btns-container"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/register"
              className="btn rounded-pill px-4 py-2 fw-bold text-white position-relative overflow-hidden group shadow-sm hero-btn-mobile d-flex align-items-center justify-content-center gap-2"
              style={{
                background: "linear-gradient(135deg, var(--theme-accent) 0%, #ff4500 100%)",
                border: "none",
                boxShadow: "0 8px 25px rgba(255, 87, 34, 0.4)",
                fontSize: "0.95rem"
              }}
            >
              <motion.div
                className="position-absolute top-0 w-50 h-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  transform: "skewX(-20deg)",
                }}
                animate={{ left: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 3 }}
              />
              <span className="position-relative z-1 d-flex align-items-center gap-2">
                Start Automating
                <motion.i
                  className="bi bi-arrow-right"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                />
              </span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                setShowFeatures(true);
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="btn rounded-pill px-4 py-2 fw-bold text-white position-relative overflow-hidden text-decoration-none hero-btn-mobile d-flex align-items-center justify-content-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                fontSize: "0.95rem"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "inset 0 0 0 1px var(--theme-accent), 0 8px 25px rgba(255,87,34,0.3)";
                e.currentTarget.style.background = "rgba(255,87,34,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              Explore Features
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section (Collapsible) */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div id="features" className="container pb-5 pt-5 position-relative z-1">
              <div className="text-center mb-5">
                <h2 className="fw-bold" style={{ fontFamily: "var(--font-righteous)", letterSpacing: "1px" }}>Powerful Automations</h2>
                <p className="theme-text-muted">Everything you need to streamline your reporting workflow.</p>
              </div>
              <div className="row g-4 justify-content-center">
                {[
                  {
                    title: "Data Ingestion",
                    desc: "Connect to RESTful APIs, databases, or web scrapers to gather your raw data automatically.",
                    icon: "🔄"
                  },
                  {
                    title: "Document Generation",
                    desc: "Format raw data into clean, readable PDF documents using dynamic templates.",
                    icon: "📄"
                  },
                  {
                    title: "Automated Delivery",
                    desc: "Schedule the delivery of PDFs to specific email lists at predetermined intervals.",
                    icon: "✉️"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="col-md-4">
                    <LandingPageCard
                      title={feature.title}
                      desc={feature.desc}
                      icon={feature.icon}
                      delay={idx * 0.2}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
