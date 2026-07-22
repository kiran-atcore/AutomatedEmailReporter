"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Simple client-side auth check
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "var(--theme-bg-main)" }}>
      {/* Sidebar handles both desktop (persistent) and mobile (overlay) states */}
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        setIsMobileOpen={setIsMobileMenuOpen} 
        onLogout={handleLogout} 
      />

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 992px) {
          .main-content-wrapper {
            margin-left: 260px !important;
            width: calc(100% - 260px) !important;
          }
        }
      `}} />

      {/* Main Content Wrapper */}
      <div 
        className="main-content-wrapper flex-grow-1 d-flex flex-column position-relative"
        style={{ marginLeft: "0", transition: "margin-left 0.3s ease, width 0.3s ease", width: "100%" }}
      >
        <Navbar 
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)} 
          onLogout={handleLogout}
          isHidden={isMobileMenuOpen}
        />
        
        <main className="flex-grow-1 position-relative z-1 overflow-x-hidden pt-5 mt-3">
          {children}
        </main>
      </div>
    </div>
  );
}
