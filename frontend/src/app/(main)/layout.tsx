"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Simple client-side auth check
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
    }

    // Auto-close sidebar on window resize (Bootstrap lg breakpoint = 992px)
    const handleResize = () => {
      if (window.innerWidth >= 992 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router, isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Analytics", href: "/Analytics" },
    { name: "Data Sources", href: "/DataSources" },
    { name: "Templates", href: "/Templates" },
    { name: "Scheduler", href: "/Scheduler" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7f6",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-dark shadow-sm position-relative z-3" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
        <div className="container-fluid px-4 py-2 d-flex justify-content-between align-items-center">
          <Link href="/Dashboard" className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 m-0">
            <span>📊</span> AutoReporter
          </Link>
          
          {/* Desktop Menu */}
          <div className="d-none d-lg-flex align-items-center">
            <ul className="navbar-nav flex-row align-items-center gap-4 m-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li className="nav-item" key={link.name}>
                    <Link
                      href={link.href}
                      className={`nav-link p-0 ${isActive ? "text-white fw-bold border-bottom border-2" : "text-white-50"}`}
                      style={{ transition: "all 0.2s ease" }}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
              <li className="nav-item ms-2">
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm rounded-pill px-4 py-2">
                  Logout
                </button>
              </li>
            </ul>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="btn btn-link text-white d-lg-none p-0 border-0"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Toggle Menu"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark z-2"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="position-fixed top-0 end-0 h-100 bg-white shadow-lg z-3 d-flex flex-column"
              style={{ width: "280px" }}
            >
              <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
                <h5 className="m-0 fw-bold" style={{ color: "#1e3c72" }}>Menu</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="p-4 flex-grow-1 d-flex flex-column gap-3">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-decoration-none fs-5 ${isActive ? "fw-bold text-primary" : "text-dark"}`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-top">
                <button onClick={handleLogout} className="btn btn-outline-danger w-100 rounded-pill py-2 fw-bold">
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {children}
    </div>
  );
}
