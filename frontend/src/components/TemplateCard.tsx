import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TemplateCardProps {
  template: any;
  onDelete: (e: React.MouseEvent, id: number) => void;
  variants?: any;
}

export default function TemplateCard({ template, onDelete, variants }: TemplateCardProps) {
  const accentColor = template.branding_color || "var(--theme-accent)";

  return (
    <motion.div
      variants={variants}
      whileHover="hover"
      className="theme-card h-100 p-4 position-relative overflow-hidden d-flex flex-column"
      style={{ 
        background: "rgba(10, 10, 12, 0.6)", 
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        borderRadius: "24px"
      }}
    >
      {/* Deeply Inset 3D Visual Preview Window */}
      <motion.div 
        variants={{ hover: { boxShadow: `inset 0 0 30px rgba(0,0,0,0.8), 0 0 15px ${accentColor}40` } }}
        className="mb-4 d-flex justify-content-center align-items-center rounded-4 position-relative overflow-hidden" 
        style={{ 
          height: "140px", 
          background: "rgba(0,0,0,0.4)", 
          border: "1px solid rgba(255,255,255,0.03)",
          boxShadow: "inset 0 10px 30px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)" 
        }}
      >
        {/* Pulsing ambient glow */}
        <motion.div 
          className="position-absolute" 
          style={{ width: "120px", height: "120px", background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`, filter: "blur(20px)" }}
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {template.branding_logo ? (
          <motion.img 
            variants={{ hover: { scale: 1.1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.8))" } }}
            src={template.branding_logo} alt="Logo" className="position-relative z-1" 
            style={{ maxHeight: "70%", maxWidth: "70%", objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }} 
          />
        ) : (
          <div className="position-relative z-1 d-flex flex-column align-items-center w-100 h-100 p-3">
            {template.layout === 'Grid' ? (
              // Animated CSS Grid Wireframe
              <div className="d-grid gap-2 w-100 h-100" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 2fr" }}>
                <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} className="rounded" style={{ background: accentColor, border: `1px solid ${accentColor}80` }}></motion.div>
                <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="rounded" style={{ background: accentColor, border: `1px solid ${accentColor}80` }}></motion.div>
                <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="rounded" style={{ background: accentColor, border: `1px solid ${accentColor}80`, gridColumn: "span 2" }}></motion.div>
              </div>
            ) : (
              // Animated CSS Document Wireframe
              <div className="d-flex flex-column gap-2 w-100 h-100 justify-content-center px-3">
                <div className="rounded-pill mb-2 w-50" style={{ height: "12px", background: accentColor, opacity: 0.8, boxShadow: `0 0 10px ${accentColor}80` }}></div>
                <motion.div animate={{ width: ["30%", "100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "circOut" }} className="rounded-pill" style={{ height: "6px", background: "rgba(255,255,255,0.3)" }}></motion.div>
                <motion.div animate={{ width: ["20%", "85%", "85%"] }} transition={{ duration: 3, repeat: Infinity, ease: "circOut", delay: 0.2 }} className="rounded-pill" style={{ height: "6px", background: "rgba(255,255,255,0.3)" }}></motion.div>
                <motion.div animate={{ width: ["40%", "60%", "60%"] }} transition={{ duration: 3, repeat: Infinity, ease: "circOut", delay: 0.4 }} className="rounded-pill" style={{ height: "6px", background: "rgba(255,255,255,0.3)" }}></motion.div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <h5 className="fw-bolder mb-3 text-white" style={{ fontSize: "1.4rem", letterSpacing: "0.5px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{template.name}</h5>
      
      <div className="theme-text-muted small mb-4 position-relative z-1 lh-lg d-flex flex-column gap-3 flex-grow-1">
        <motion.div variants={{ hover: { x: 5 } }} className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)" }}>
             <i className="bi bi-layout-text-window-reverse text-white" style={{ fontSize: "0.9rem" }}></i>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.4)" }}>Layout</div>
            <span className="fw-bold text-white-50">{template.layout}</span>
          </div>
        </motion.div>
        <motion.div variants={{ hover: { x: 5 } }} transition={{ delay: 0.05 }} className="d-flex align-items-center gap-3 text-truncate">
          <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)" }}>
             <i className="bi bi-fonts text-white" style={{ fontSize: "1rem" }}></i>
          </div>
          <div className="text-truncate w-100">
            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.4)" }}>Header</div>
            <span className="fw-medium text-white-50 text-truncate">{template.header_text || "None"}</span>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-auto pt-4 border-top border-secondary border-opacity-50 d-flex flex-wrap flex-xl-nowrap gap-2 position-relative z-1">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-grow-1" style={{ minWidth: "120px" }}>
          <Link 
            href={`/EditTemplate/${template.id}`} 
            className="btn btn-sm text-white w-100 fw-bold rounded-pill text-decoration-none text-center d-flex align-items-center justify-content-center gap-2 shadow" 
            title="Edit Settings"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", transition: "all 0.2s", fontSize: "0.85rem" }}
          >
            <i className="bi bi-pencil-square"></i> Edit
          </Link>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="btn btn-sm flex-grow-1 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 shadow text-white"
          onClick={(e) => onDelete(e, template.id)}
          title="Delete"
          style={{ background: "linear-gradient(135deg, rgba(220,53,69,0.2) 0%, rgba(220,53,69,0.05) 100%)", border: "1px solid rgba(220,53,69,0.3)", backdropFilter: "blur(10px)", transition: "all 0.2s", fontSize: "0.85rem", minWidth: "120px" }}
        >
          <i className="bi bi-trash3"></i> Delete
        </motion.button>
      </div>
    </motion.div>
  );
}
