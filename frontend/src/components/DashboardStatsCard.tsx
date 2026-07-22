import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  trend: string;
  color: string;
  href: string;
  icon: string;
}

export default function DashboardStatsCard({ title, value, trend, color, href, icon }: DashboardStatsCardProps) {
  return (
    <Link href={href} className="text-decoration-none">
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={{
          rest: { y: 0, scale: 1 },
          hover: { y: -12, scale: 1.05 },
          tap: { scale: 0.98 }
        }}
        className="h-100 p-4 position-relative overflow-hidden rounded-4"
        style={{
          background: "rgba(21, 21, 21, 0.6)",
          border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          transition: "border 0.3s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        onHoverStart={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          if (target) {
            target.style.border = `1px solid ${color}88`;
            target.style.boxShadow = `0 15px 40px ${color}33`;
          }
        }}
        onHoverEnd={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          if (target) {
            target.style.border = "1px solid rgba(255,255,255,0.05)";
            target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)";
          }
        }}
      >
        {/* Abstract background glow - the color splash effect */}
        <motion.div 
          className="position-absolute rounded-circle pointer-events-none"
          variants={{
             rest: { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
             hover: { scale: 1.8, opacity: 1, filter: "brightness(1.3)", transition: { duration: 0.4, ease: "easeOut" } }
          }}
          style={{
            width: "160px",
            height: "160px",
            background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
            top: "-60px",
            right: "-60px",
            zIndex: 0
          }}
        />

        {/* Glossy sweep shine effect on hover */}
        <motion.div 
          className="position-absolute top-0 pointer-events-none"
          variants={{
             rest: { left: "-100%", opacity: 0 },
             hover: { left: "100%", opacity: 1, transition: { duration: 0.7, ease: "easeInOut" } }
          }}
          style={{
            width: "50%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transform: "skewX(-20deg)",
            zIndex: 10
          }}
        />

        <div className="position-relative z-1 d-flex justify-content-between align-items-start mb-4">
           <h6 className="text-white-50 fw-bold mb-0 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.75rem", letterSpacing: "1.5px" }}>
             {title}
           </h6>
           <motion.div 
             variants={{
                rest: { rotate: 0, scale: 1 },
                hover: { rotate: -15, scale: 1.15, backgroundColor: `${color}33` }
             }}
             className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
             style={{ width: "42px", height: "42px", backgroundColor: `${color}15`, border: `1px solid ${color}33`, color: color }}
           >
             <i className={`bi ${icon} fs-5`}></i>
           </motion.div>
        </div>

        <div className="position-relative z-1 mt-auto">
          <motion.h2 
            variants={{
               rest: { scale: 1, originX: 0 },
               hover: { scale: 1.05, originX: 0 }
            }}
            className="display-5 fw-bolder mb-2 text-white" 
            style={{ 
              letterSpacing: "-1px", 
              fontFamily: "var(--font-righteous), sans-serif",
              background: `linear-gradient(135deg, #fff 0%, ${color} 150%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            {value}
          </motion.h2>
          
          <div className="mt-4 d-flex align-items-center">
            <motion.span 
              variants={{
                 rest: { backgroundColor: "rgba(255,255,255,0.05)" },
                 hover: { backgroundColor: "rgba(255,255,255,0.1)" }
              }}
              className="badge rounded-pill fw-medium d-flex align-items-center gap-2 px-3 py-2 shadow-sm" 
              style={{ 
                color: "var(--theme-text-secondary)", 
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "0.75rem",
                letterSpacing: "0.5px"
              }}
            >
              <motion.div 
                variants={{
                  rest: { scale: 1, boxShadow: `0 0 10px ${color}` },
                  hover: { scale: 1.5, boxShadow: `0 0 20px ${color}` }
                }}
                className="rounded-circle" style={{ width: "6px", height: "6px", backgroundColor: color }}
              />
              {trend}
            </motion.span>
          </div>
        </div>
        
        {/* Subtle bottom border highlight */}
        <motion.div 
          variants={{
             rest: { opacity: 0.5, height: "3px" },
             hover: { opacity: 1, height: "5px" }
          }}
          className="position-absolute bottom-0 start-0 w-100" 
          style={{ background: `linear-gradient(90deg, ${color}88 0%, transparent 100%)` }}
        />
      </motion.div>
    </Link>
  );
}
