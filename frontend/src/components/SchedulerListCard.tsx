import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SchedulerListCardProps {
  schedule: any;
  onDelete: (e: React.MouseEvent, id: number) => void;
  variants?: any;
}

export default function SchedulerListCard({ schedule, onDelete, variants }: SchedulerListCardProps) {
  const recipientsCount = schedule.recipients ? schedule.recipients.split(',').length : 0;

  return (
    <motion.div
      variants={variants}
      whileHover="hover"
      className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between p-4 mb-3 position-relative overflow-hidden"
      style={{ 
        background: "rgba(10, 10, 12, 0.6)", 
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        borderRadius: "16px",
        transition: "box-shadow 0.3s ease"
      }}
    >
      {/* Interactive Glowing Left Edge */}
      <motion.div 
        className="position-absolute top-50 start-0 translate-middle-y rounded-end"
        style={{ width: "4px", background: "var(--theme-accent)", boxShadow: "0 0 15px var(--theme-accent)" }}
        variants={{ hover: { height: "70%" }, initial: { height: "0%" } }}
        initial="initial"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      
      {/* Left side: Name and Timezone */}
      <div className="d-flex flex-column mb-4 mb-lg-0 z-1" style={{ minWidth: "250px" }}>
        <h5 className="fw-bolder mb-2 text-white" style={{ fontSize: "1.3rem", letterSpacing: "0.5px" }}>{schedule.name}</h5>
        <span className="theme-text-muted small d-flex align-items-center gap-2">
          <motion.i variants={{ hover: { rotate: 180 } }} transition={{ duration: 0.5 }} className="bi bi-globe-americas" style={{ color: "var(--theme-accent)" }}></motion.i> 
          <span className="text-white-50">{schedule.timezone || "UTC"}</span>
        </span>
      </div>

      {/* Middle side: Details Grid */}
      <div className="d-flex flex-wrap flex-grow-1 gap-5 mb-4 mb-lg-0 z-1">
        <motion.div variants={{ hover: { y: -3 } }} className="d-flex align-items-center gap-3">
          <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
            <div className="position-absolute w-100 h-100 rounded-circle" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}></div>
            <div className="d-flex align-items-center justify-content-center rounded-circle z-1" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
               <i className="bi bi-arrow-repeat text-white"></i>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.4)" }}>
              {schedule.frequency === 'cron' ? 'Cron Expr' : 'Frequency'}
            </div>
            <div className={`text-white fw-bold ${schedule.frequency === 'cron' ? 'font-monospace fs-6' : 'text-capitalize'}`}>
              {schedule.frequency === 'cron' ? schedule.cron_expression : schedule.frequency}
            </div>
          </div>
        </motion.div>

        {schedule.frequency !== 'cron' && (
          <motion.div variants={{ hover: { y: -3 } }} transition={{ delay: 0.05 }} className="d-flex align-items-center gap-3">
            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
              <div className="position-absolute w-100 h-100 rounded-circle" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}></div>
              <div className="d-flex align-items-center justify-content-center rounded-circle z-1" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                 <i className="bi bi-clock text-white"></i>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.4)" }}>Time</div>
              <div className="text-white fw-bold">{schedule.time_of_day}</div>
            </div>
          </motion.div>
        )}

        <motion.div variants={{ hover: { y: -3 } }} transition={{ delay: 0.1 }} className="d-flex align-items-center gap-3">
          <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
            <div className="position-absolute w-100 h-100 rounded-circle" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}></div>
            <div className="d-flex align-items-center justify-content-center rounded-circle z-1" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
               <i className="bi bi-envelope-paper text-white"></i>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.4)" }}>Recipients</div>
            <div className="text-white fw-bold">{recipientsCount} Users</div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Actions */}
      <div className="d-flex align-items-center gap-3 z-1">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            href={`/EditSchedule/${schedule.id}`} 
            className="btn text-white fw-bold rounded-pill text-decoration-none px-4 py-2 d-flex align-items-center gap-2 shadow" 
            title="Edit Settings"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", transition: "all 0.2s" }}
          >
            <i className="bi bi-pencil-square"></i> Edit
          </Link>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="btn fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow text-white"
          onClick={(e) => onDelete(e, schedule.id)}
          title="Delete"
          style={{ background: "linear-gradient(135deg, rgba(220,53,69,0.2) 0%, rgba(220,53,69,0.05) 100%)", border: "1px solid rgba(220,53,69,0.3)", backdropFilter: "blur(10px)", transition: "all 0.2s" }}
        >
          <i className="bi bi-trash3"></i> Delete
        </motion.button>
      </div>
    </motion.div>
  );
}
