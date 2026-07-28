import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import SearchSort from './SearchSort';

interface LogsListCardProps {
  logs: any[];
  onClearAll: () => void;
  onDeleteLog: (e: React.MouseEvent, id: number) => void;
  onRowClick: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortOrder: 'latest' | 'oldest';
  setSortOrder: (val: 'latest' | 'oldest') => void;
}

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function LogsListCard({ logs, onClearAll, onDeleteLog, onRowClick, searchQuery, setSearchQuery, sortOrder, setSortOrder }: LogsListCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedLogs = isExpanded ? logs : logs.slice(0, 3);

  return (
    <div className="overflow-hidden border-0 bg-transparent">
      {/* Premium Header */}
      <div className="d-flex justify-content-between align-items-end mb-4 px-1 pb-3 border-bottom" style={{ borderColor: "rgba(255,255,255,0.05) !important" }}>
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm position-relative overflow-hidden"
            style={{ width: "36px", height: "36px", background: "rgba(255,87,34,0.15)", border: "1px solid rgba(255,87,34,0.3)" }}
          >
            <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)" }} />
            <i className="bi bi-activity position-relative z-1" style={{ color: "var(--theme-accent)", fontSize: "1.1rem" }}></i>
          </div>
          <div>
            <h5 className="fw-bolder mb-0 text-white" style={{ letterSpacing: "-0.5px" }}>Recent Executions</h5>
            <span className="theme-text-muted d-block mt-1" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>SYSTEM LOGS</span>
          </div>
        </div>
        {logs.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05, background: "rgba(220,53,69,0.15)", color: "#ff4d4d", boxShadow: "0 0 15px rgba(220,53,69,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-sm rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center gap-2"
            style={{ color: "var(--theme-text-secondary)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", transition: "all 0.3s" }}
            onClick={onClearAll}
          >
            <i className="bi bi-trash3" style={{ fontSize: "0.8rem" }}></i>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>CLEAR LOGS</span>
          </motion.button>
        )}
      </div>

      {/* Premium Search and Sort Controls */}
      <SearchSort 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <motion.div
        className="d-flex flex-column gap-3"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {displayedLogs.map((log: any) => {
          const isSuccess = log.status === 'success';
          const statusColor = isSuccess ? '#198754' : '#dc3545';

          return (
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
                hover: { scale: 1.02, x: 8, backgroundColor: "rgba(255,255,255,0.08)" }
              }}
              key={log.id}
              onClick={() => onRowClick(log.id)}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0 py-2 px-3 mx-auto rounded-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between position-relative overflow-hidden group mb-1"
              style={{
                width: "96%",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(21, 21, 21, 0.4)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)",
                transition: "border 0.3s, box-shadow 0.3s",
                minHeight: "56px"
              }}
              onHoverStart={(e) => {
                const t = e.currentTarget as HTMLDivElement;
                if (t) {
                  t.style.border = `1px solid ${statusColor}55`;
                  t.style.boxShadow = `0 10px 30px ${statusColor}22`;
                }
              }}
              onHoverEnd={(e) => {
                const t = e.currentTarget as HTMLDivElement;
                if (t) {
                  t.style.border = "1px solid rgba(255,255,255,0.05)";
                  t.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                }
              }}
            >
              {/* Glossy sweep shine effect on hover */}
              <motion.div
                className="position-absolute top-0 pointer-events-none"
                variants={{
                  hidden: { left: "-100%", opacity: 0 },
                  visible: { left: "-100%", opacity: 0 },
                  hover: { left: "100%", opacity: 1, transition: { duration: 0.6, ease: "easeInOut" } }
                }}
                style={{
                  width: "50%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  transform: "skewX(-20deg)",
                  zIndex: 10
                }}
              />

              {/* Left edge glowing accent */}
              <motion.div
                variants={{
                  hidden: { opacity: 0.5 },
                  visible: { opacity: 0.5 },
                  hover: { opacity: 1, boxShadow: `0 0 10px ${statusColor}` }
                }}
                className="position-absolute start-0 top-0 h-100"
                style={{ width: "3px", backgroundColor: statusColor }}
              />

              {/* Info section */}
              <div className="d-flex flex-column ms-2 position-relative z-1 py-1">
                <span className="fw-bold text-white mb-0" style={{ letterSpacing: "-0.3px", fontSize: "0.95rem" }}>
                  {log.job_name}
                </span>
                <span className="theme-text-muted d-flex align-items-center gap-1 fw-medium" style={{ fontSize: "0.7rem" }}>
                  <i className="bi bi-clock"></i>
                  {new Date(log.executed_at).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              </div>

              {/* Status and Action section */}
              <div className="d-flex align-items-center gap-3 ms-2 ms-md-0 position-relative z-1">
                {/* Neon Status Badge */}
                <motion.div
                  variants={{
                    hover: { backgroundColor: `${statusColor}22`, boxShadow: `0 0 10px ${statusColor}44` }
                  }}
                  className={`d-flex align-items-center gap-2 rounded-pill px-2 py-1 fw-bold ${isSuccess ? 'text-success' : 'text-danger'}`}
                  style={{
                    backgroundColor: `${statusColor}11`,
                    border: `1px solid ${statusColor}33`,
                    fontSize: "0.7rem",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s"
                  }}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.5, boxShadow: `0 0 8px ${statusColor}` }
                    }}
                    className="rounded-circle shadow-sm"
                    style={{ width: "6px", height: "6px", backgroundColor: statusColor }}
                  />
                  {log.status.toUpperCase()}
                </motion.div>

                {/* Delete Button */}
                <motion.button
                  variants={{
                    hover: {
                      scale: 1.15,
                      boxShadow: "0 0 10px rgba(220,53,69,0.5)",
                      background: "rgba(220,53,69,0.15)",
                      borderColor: "rgba(220,53,69,0.5)",
                      color: "#ff4d4d"
                    }
                  }}
                  className="btn btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    width: "28px", height: "28px",
                    background: "rgba(220,53,69,0)",
                    color: "var(--theme-text-secondary)",
                    border: "1px solid rgba(220,53,69,0)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLog(e, log.id);
                  }}
                  title="Delete"
                >
                  <i className="bi bi-trash"></i>
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {logs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-5 rounded-4 shadow-sm"
            style={{
              border: "1px dashed rgba(255,255,255,0.1)",
              background: "rgba(21, 21, 21, 0.3)",
              backdropFilter: "blur(10px)"
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="fs-1 mb-3 opacity-50"
            >
              {searchQuery ? "🔍" : "📭"}
            </motion.div>
            <h6 className="text-white fw-bold">
              {searchQuery ? "No results found" : "No recent executions"}
            </h6>
            <p className="theme-text-muted mb-0 small">
              {searchQuery ? "Try adjusting your search term." : "Your automated job logs will appear here."}
            </p>
          </motion.div>
        )}
      </motion.div>

      {logs.length > 3 && (
        <motion.div
          className="text-center mt-3 mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover="hover"
            whileTap="tap"
            className="btn rounded-pill d-inline-flex align-items-center justify-content-center gap-2 border-0"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: "6px 16px",
              background: "rgba(255,255,255,0.03)",
              color: "var(--theme-text-secondary)",
              fontSize: "0.75rem",
              letterSpacing: "0.5px",
              fontWeight: 600,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
              transition: "color 0.3s, background 0.3s, box-shadow 0.3s"
            }}
            variants={{
              hover: {
                background: "rgba(255,87,34,0.1)",
                color: "var(--theme-accent)",
                boxShadow: "inset 0 0 0 1px rgba(255,87,34,0.3), 0 4px 12px rgba(0,0,0,0.2)"
              },
              tap: { scale: 0.95 }
            }}
          >
            <span>{isExpanded ? 'SHOW LESS' : `VIEW ALL (${logs.length})`}</span>
            <motion.i
              className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} fs-6`}
              variants={{ hover: { y: isExpanded ? -3 : 3 } }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
