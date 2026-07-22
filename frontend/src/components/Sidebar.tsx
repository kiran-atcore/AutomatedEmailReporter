import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LogoName from './LogoName';
import api from '@/services/axios';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

const navLinks = [
  { name: "Dashboard", href: "/Dashboard", icon: "bi-grid-1x2" },
  { name: "Analytics", href: "/Analytics", icon: "bi-graph-up" },
  { name: "Data Sources", href: "/DataSources", icon: "bi-database" },
  { name: "Templates", href: "/Templates", icon: "bi-file-earmark-richtext" },
  { name: "Scheduler", href: "/Scheduler", icon: "bi-calendar-check" },
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [userData, setUserData] = useState<{ first_name?: string; username?: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me/');
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    if (typeof window !== 'undefined' && localStorage.getItem('access')) {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen, setIsMobileOpen]);

  const SidebarContent = () => (
    <div className="d-flex flex-column h-100 w-100 position-relative">
      {/* Stylish Close Button for Mobile - Absolutely positioned to top right */}
      <button
        onClick={() => setIsMobileOpen(false)}
        className="btn d-lg-none rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm position-absolute"
        style={{
          top: "12px", right: "12px",
          width: "24px", height: "24px",
          background: "rgba(255,255,255,0.08)",
          color: "var(--theme-text-secondary)",
          transition: "all 0.2s",
          zIndex: 10
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(220,53,69,0.15)";
          e.currentTarget.style.color = "#dc3545";
          e.currentTarget.style.transform = "rotate(90deg)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "var(--theme-text-secondary)";
          e.currentTarget.style.transform = "rotate(0deg)";
        }}
      >
        <i className="bi bi-x-lg" style={{ fontSize: "0.7rem" }}></i>
      </button>

      <div className="p-4 border-bottom border-secondary mb-1 d-flex justify-content-between align-items-center">
        <LogoName />
      </div>

      <div className="px-3 mb-2 mt-2">
        <motion.div 
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(255,87,34,0.15)" }}
          className="d-flex align-items-center gap-3 p-2 rounded-4 shadow-sm position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 15px rgba(0,0,0,0.2)",
            backdropFilter: "blur(12px)",
            transition: "all 0.3s ease"
          }}
        >
          <div className="position-absolute top-0 end-0" style={{ width: "60px", height: "60px", background: "radial-gradient(circle, var(--theme-accent) 0%, transparent 70%)", opacity: 0.15, filter: "blur(10px)" }}></div>
          
          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 position-relative z-1" 
            style={{ 
              width: "36px", height: "36px", 
              background: "linear-gradient(135deg, rgba(255,87,34,0.2) 0%, rgba(255,138,101,0.05) 100%)", 
              border: "1px solid rgba(255,87,34,0.3)",
              boxShadow: "0 0 15px rgba(255,87,34,0.2), inset 0 0 10px rgba(255,87,34,0.1)"
            }}
          >
            <i className="bi bi-person-bounding-box" style={{ fontSize: "1.05rem", color: "var(--theme-accent)", textShadow: "0 0 10px rgba(255,87,34,0.6)" }}></i>
          </div>
          
          <div className="text-truncate position-relative z-1 pe-2">
            <span className="d-block fw-bold" style={{ fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>Welcome Back</span>
            <span className="d-block text-white fw-bolder text-truncate" style={{ fontSize: "0.9rem", letterSpacing: "-0.2px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              {userData ? (userData.first_name || userData.username) : "..."}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="px-3 flex-grow-1 d-flex flex-column gap-2 overflow-auto">
        <p className="text-white-50 small fw-bold px-2 mb-1 mt-2 text-uppercase" style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>Main Menu</p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <motion.div
              key={link.name}
              whileHover={{ x: 8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-decoration-none px-3 py-2 rounded-3 d-flex align-items-center gap-3 position-relative overflow-hidden"
                style={{
                  color: isActive ? "white" : "var(--theme-text-secondary)",
                  background: isActive ? "linear-gradient(90deg, rgba(255,87,34,0.15) 0%, transparent 100%)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--theme-accent)" : "3px solid transparent",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderLeft = "3px solid rgba(255,255,255,0.3)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--theme-text-secondary)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderLeft = "3px solid transparent";
                  }
                }}
              >
                <i className={`bi ${link.icon} fs-5`} style={{ color: isActive ? "var(--theme-accent)" : "inherit" }}></i>
                <span className={isActive ? "fw-bold" : "fw-medium"}>{link.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <motion.button
          onClick={onLogout}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(220,53,69,0.5)",
            background: "linear-gradient(90deg, #dc3545 0%, #ff4d4d 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.2)"
          }}
          whileTap={{ scale: 0.95 }}
          className="btn w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          style={{
            background: "rgba(220,53,69,0.08)",
            color: "#dc3545",
            border: "1px solid rgba(220,53,69,0.3)",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s ease"
          }}
        >
          <i className="bi bi-box-arrow-right fs-5"></i>
          <span style={{ letterSpacing: "1px" }}>LOGOUT</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div
        className="d-none d-lg-block h-100 position-fixed top-0 start-0 z-1"
        style={{ width: "260px", background: "var(--theme-bg-card)", borderRight: "1px solid var(--theme-border)" }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="position-fixed top-0 start-0 w-100 h-100 bg-black z-3 d-lg-none"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="position-fixed top-0 start-0 h-100 shadow-lg z-3 d-lg-none"
              style={{ width: "280px", background: "var(--theme-bg-card)", borderRight: "1px solid var(--theme-border)" }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
