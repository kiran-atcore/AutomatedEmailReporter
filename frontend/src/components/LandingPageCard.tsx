"use client";

import React, { MouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

interface LandingPageCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  delay?: number;
}

export default function LandingPageCard({ title, desc, icon, delay = 0 }: LandingPageCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className="position-relative h-100 rounded-5 p-1"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.8, type: "spring", bounce: 0.4 }}
      whileHover="hover"
      style={{
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Magic Spotlight Border */}
      <motion.div 
        className="position-absolute top-0 start-0 w-100 h-100 rounded-5 pointer-events-none"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255,87,34,0.5),
              transparent 80%
            )
          `,
          opacity: 0,
          zIndex: 0,
        }}
        variants={{ hover: { opacity: 1 } }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Inner Card content */}
      <div 
        className="position-relative z-1 h-100 rounded-5 p-4 d-flex flex-column overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 40px -10px rgba(0,0,0,0.8)"
        }}
      >
        {/* Subtle glossy top reflection */}
        <div className="position-absolute top-0 start-0 w-100" style={{ height: "30%", background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)", pointerEvents: "none" }} />
        
        {/* Inner Spotlight for content */}
        <motion.div 
          className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(255,255,255,0.04),
                transparent 80%
              )
            `,
            opacity: 0,
            zIndex: 0,
          }}
          variants={{ hover: { opacity: 1 } }}
          transition={{ duration: 0.4 }}
        />

        <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-4 position-relative z-1" style={{ width: "64px", height: "64px", background: "rgba(255,87,34,0.1)", border: "1px solid rgba(255,87,34,0.2)" }}>
          <motion.div
            variants={{ hover: { scale: 1.15, rotate: 10, color: "#fff" } }}
            transition={{ type: "spring", stiffness: 300 }}
            className="fs-3 position-relative z-1"
          >
             {icon}
          </motion.div>
        </div>
        <h3 className="fw-bold h4 mb-3 text-white position-relative z-1" style={{ letterSpacing: "-0.5px" }}>{title}</h3>
        <p className="theme-text-muted mb-0 flex-grow-1 position-relative z-1" style={{ fontSize: "1rem", lineHeight: "1.6" }}>{desc}</p>
      </div>
    </motion.div>
  );
}
