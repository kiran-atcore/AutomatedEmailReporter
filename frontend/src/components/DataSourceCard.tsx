import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DataSourceCardProps {
  source: any;
  onDelete: (e: React.MouseEvent, id: number) => void;
  variants?: any;
}

export default function DataSourceCard({ source, onDelete, variants }: DataSourceCardProps) {
  return (
    <motion.div
      variants={variants}
      whileHover="hover"
      className="theme-card h-100 p-4 position-relative overflow-hidden"
      style={{ 
        background: "rgba(10, 10, 12, 0.6)", 
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        borderRadius: "24px"
      }}
    >
      {/* Animated Glowing Orb */}
      <motion.div 
        className="position-absolute top-0 start-50 translate-middle"
        style={{ width: "200px", height: "100px", background: "var(--theme-accent)", filter: "blur(60px)", borderRadius: "50%", opacity: 0.15 }}
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Holographic Data Grid Pattern Overlay */}
      <div 
        className="position-absolute inset-0 w-100 h-100 pointer-events-none" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", 
          backgroundSize: "20px 20px", 
          opacity: 0.5 
        }} 
      />
      
      <div className="d-flex justify-content-between align-items-start mb-4 position-relative z-1">
        <h5 className="fw-bolder mb-0 text-white" style={{ fontSize: "1.4rem", letterSpacing: "0.5px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{source.name}</h5>
        <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" style={{ background: "rgba(25, 135, 84, 0.15)", border: "1px solid rgba(25, 135, 84, 0.3)", boxShadow: "0 0 15px rgba(25, 135, 84, 0.2)" }}>
          <motion.div 
            className="rounded-circle bg-success" 
            style={{ width: "6px", height: "6px", boxShadow: "0 0 8px #198754" }} 
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-success fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase" }}>
            Connected
          </span>
        </div>
      </div>
      
      <div className="theme-text-muted small mb-4 position-relative z-1 lh-lg d-flex flex-column gap-3">
        <motion.div variants={{ hover: { x: 5 } }} className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)" }}>
             <i className="bi bi-hdd-network text-white" style={{ fontSize: "0.9rem" }}></i>
          </div>
          <div>
             <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.4)" }}>Type</div>
             <span className="text-uppercase fw-bold text-white-50">{source.connection_type}</span>
          </div>
        </motion.div>
        <motion.div variants={{ hover: { x: 5 } }} transition={{ delay: 0.05 }} className="d-flex align-items-center gap-3 text-truncate">
          <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)" }}>
             <i className="bi bi-link-45deg text-white" style={{ fontSize: "1rem" }}></i>
          </div>
          <div className="text-truncate w-100">
             <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.4)" }}>Endpoint</div>
             <span className="fw-medium text-white-50 text-truncate">{source.endpoint}</span>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-auto pt-4 border-top border-secondary border-opacity-50 d-flex flex-wrap flex-xl-nowrap gap-2 position-relative z-1">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-grow-1" style={{ minWidth: "120px" }}>
          <Link 
            href={`/EditDataSource/${source.id}`} 
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
          onClick={(e) => onDelete(e, source.id)}
          title="Delete"
          style={{ background: "linear-gradient(135deg, rgba(220,53,69,0.2) 0%, rgba(220,53,69,0.05) 100%)", border: "1px solid rgba(220,53,69,0.3)", backdropFilter: "blur(10px)", transition: "all 0.2s", fontSize: "0.85rem", minWidth: "120px" }}
        >
          <i className="bi bi-trash3"></i> Delete
        </motion.button>
      </div>
    </motion.div>
  );
}
