"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        color: "white",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent pt-4 px-4">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand fw-bold fs-3">
            AutoReporter
          </Link>
          <div className="d-flex gap-3">
            <Link href="/login" className="btn btn-outline-light rounded-pill px-4">
              Login
            </Link>
            <Link href="/register" className="btn btn-light text-primary rounded-pill px-4 fw-bold">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: "80vh" }}>
        <motion.h1
          className="display-3 fw-bold mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }}
        >
          Automate Your Data Reporting
        </motion.h1>
        
        <motion.p
          className="lead mb-5 w-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Say goodbye to manual data pulls. Ingest from APIs, automatically generate beautiful PDF reports, and schedule delivery to your team or clients without writing a single line of code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="d-flex gap-3"
        >
          <Link href="/register" className="btn btn-light btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg text-primary">
            Start Automating for Free
          </Link>
        </motion.div>
      </div>

      {/* Features Section (Glassmorphism) */}
      <div className="container pb-5">
        <div className="row g-4">
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
              <motion.div
                className="p-4 h-100 rounded-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                }}
              >
                <div className="fs-1 mb-3">{feature.icon}</div>
                <h3 className="fw-bold h5 mb-3">{feature.title}</h3>
                <p className="text-light" style={{ opacity: 0.9 }}>{feature.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
