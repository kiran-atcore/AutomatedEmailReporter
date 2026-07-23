import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll } from 'framer-motion';
import LogoName from './LogoName';
import { useAlert } from '@/components/AlertModal';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  onLogout: () => void;
  isHidden?: boolean;
}

export default function Navbar({ onMobileMenuToggle, onLogout, isHidden = false }: NavbarProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { showConfirm } = useAlert();

  const handleLogoutClick = async () => {
    const confirmed = await showConfirm("Are you sure you want to securely logout?", "Logout");
    if (confirmed) {
      onLogout();
    }
  };

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 10);
    });
  }, [scrollY]);
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: isHidden ? -100 : 0,
        opacity: isHidden ? 0 : 1
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="navbar navbar-dark shadow-sm position-fixed top-0 end-0 z-3 p-0 py-1"
      style={{
        width: "inherit",
        background: isScrolled ? "rgba(21, 21, 21, 0.85)" : "rgba(21, 21, 21, 0.5)",
        backdropFilter: "blur(12px)",
        transition: "background 0.3s ease"
      }}
    >
      {/* Scroll Progress Glass Glow */}
      <div className="position-absolute bottom-0 start-0 w-100 overflow-hidden" style={{ height: "2px", background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          className="h-100"
          style={{
            width: "100%",
            scaleX: scrollYProgress,
            transformOrigin: "0%",
            background: "linear-gradient(90deg, transparent, var(--theme-accent), #ff4500, transparent)",
            boxShadow: "0 0 12px var(--theme-accent)",
            opacity: isScrolled ? 1 : 0
          }}
          transition={{ opacity: { duration: 0.3 } }}
        />
      </div>

      <div className="container-fluid px-4 py-2 d-flex justify-content-between align-items-center">
        {/* Mobile menu toggle */}
        <motion.button
          whileHover="hover"
          whileTap={{ scale: 0.9 }}
          className="btn d-lg-none p-0 border-0 me-3 d-flex align-items-center justify-content-center bg-transparent"
          onClick={onMobileMenuToggle}
          aria-label="Toggle Menu"
          style={{
            color: "var(--theme-text-secondary)"
          }}
          variants={{
            hover: { color: "var(--theme-accent)" }
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <motion.line x1={4} y1={7} x2={20} y2={7} />
            {/* Staggered middle line that expands on hover */}
            <motion.line
              x1={12} y1={12} x2={20} y2={12}
              variants={{ hover: { x1: 4 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <motion.line x1={4} y1={17} x2={20} y2={17} />
          </svg>
        </motion.button>

        {/* Brand for mobile only, desktop has it in sidebar */}
        <div className="d-lg-none d-flex align-items-center flex-grow-1">
          <LogoName />
        </div>

        {/* Right side user actions */}
        <div className="d-flex align-items-center ms-auto gap-4">
          {/* <div className="d-none d-md-flex align-items-center gap-2 text-white-50 small">
            <div className="rounded-circle bg-primary bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", color: "var(--theme-accent)" }}>
              <i className="bi bi-person-fill"></i>
            </div>
            <span className="fw-medium text-white">Admin</span>
          </div> */}
          <button onClick={handleLogoutClick} className="btn btn-outline-danger btn-sm rounded-pill px-4 py-1 fw-bold d-none d-md-block">
            Logout
          </button>
          <button onClick={handleLogoutClick} className="btn btn-link text-danger d-md-none p-0">
            <i className="bi bi-box-arrow-right fs-4"></i>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
