import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="position-relative overflow-hidden d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a 0%, #151515 100%)",
        padding: "40px 20px"
      }}
    >
      {/* Subtle Grid Overlay */}
      <div 
        className="position-absolute w-100 h-100"
        style={{
           backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
           backgroundSize: "30px 30px",
           opacity: 0.5,
           zIndex: 0
        }}
      />

      {/* Animated Glowing Orbs */}
      <div 
        className="position-absolute rounded-circle" 
        style={{
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, var(--theme-accent) 0%, transparent 60%)",
          opacity: 0.1,
          top: "-10vw",
          right: "-10vw",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "float 10s ease-in-out infinite alternate"
        }}
      />
      <div 
        className="position-absolute rounded-circle" 
        style={{
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(220, 53, 69, 1) 0%, transparent 60%)",
          opacity: 0.05,
          bottom: "-20vw",
          left: "-15vw",
          filter: "blur(80px)",
          pointerEvents: "none",
          animation: "float 12s ease-in-out infinite alternate-reverse"
        }}
      />
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(30px) scale(1.05); }
        }
      `}</style>

      {/* Main Glass Card */}
      <div
        className="container position-relative z-1 rounded-5"
        style={{
          maxWidth: "440px",
          padding: "50px 40px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(15, 15, 15, 0.9) 100%)"
        }}
      >
        {children}
      </div>
    </div>
  );
}
