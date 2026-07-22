"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function FailedJobsList() {
  const [failedLogs, setFailedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/reports/logs/?include_archived=true");
        // Filter failed logs that haven't been resolved by a subsequent success
        const failed = response.data.filter((log: any) => log.status === 'failed' && !log.is_resolved_failure);
        setFailedLogs(failed);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleRetry = async (jobId: number) => {
    try {
      await api.patch(`/reports/jobs/${jobId}/`, { is_active: true });
      showAlert("Job re-activated successfully! Redirecting to Total Jobs...", "Success");
      router.push("/TotalJobsList");
    } catch (err) {
      console.error("Failed to retry job", err);
      showAlert("Failed to reactivate job.", "Error");
    }
  };

  const handleDelete = async (logId: number) => {
    if (!(await showConfirm("Are you sure you want to delete this error log?"))) return;
    try {
      await api.delete(`/reports/logs/${logId}/?permanent=true&include_archived=true`);
      setFailedLogs(failedLogs.filter((log: any) => log.id !== logId));
    } catch (err) {
      console.error("Failed to delete log", err);
      showAlert("Failed to delete log.", "Error");
    }
  };

  const handleClearAll = async () => {
    if (!(await showConfirm("Are you sure you want to PERMANENTLY delete all failed error logs? This action cannot be undone."))) return;
    try {
      await api.delete("/reports/logs/clear_all/?permanent=true&status=failed&include_archived=true");
      setFailedLogs([]);
    } catch (err) {
      console.error("Failed to clear logs", err);
      showAlert("Failed to clear logs.", "Error");
    }
  };

  return (
    <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
              style={{ background: "rgba(250, 112, 154, 0.1)", border: "1px solid rgba(250, 112, 154, 0.2)" }}
            >
              <i className="bi bi-exclamation-triangle" style={{ color: "#fa709a" }}></i>
              <span style={{ color: "#fa709a", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>ERROR LOGS</span>
            </motion.div>
            <h2 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.5rem" }}>
              Failed Jobs
            </h2>
            <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>Jobs that encountered errors during their last scheduled execution.</p>
          </div>
          {failedLogs.length > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button 
                className="btn text-white shadow rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2"
                onClick={handleClearAll}
                style={{ background: "rgba(255, 75, 75, 0.15)", border: "1px solid rgba(255, 75, 75, 0.4)", backdropFilter: "blur(10px)" }}
              >
                <i className="bi bi-trash3"></i> Clear All Failed Logs
              </button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="d-flex flex-column gap-3">
            {/* Header Row */}
            <div className="d-none d-md-flex text-uppercase fw-bold theme-text-muted small px-4 pb-2 border-bottom border-secondary border-opacity-25" style={{ letterSpacing: "1px" }}>
              <div style={{ flex: "0 0 30%" }}>Job Name</div>
              <div style={{ flex: "0 0 35%" }}>Error Log</div>
              <div style={{ flex: "0 0 20%" }}>Failed At</div>
              <div style={{ flex: "1" }} className="text-end">Actions</div>
            </div>

            {loading && (
              <div className="text-center py-5 theme-text-muted">Loading failed jobs...</div>
            )}
            {!loading && failedLogs.length === 0 && (
              <div className="text-center py-5">
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <i className="bi bi-shield-check fs-1 text-success mb-3" style={{ opacity: 0.5 }}></i>
                  <p className="theme-text-muted mb-0 fs-5">No failed jobs! You're all good.</p>
                </div>
              </div>
            )}
            {!loading && failedLogs.map((log: any, index: number) => (
              <motion.div 
                key={log.id} 
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  initial: { opacity: 0, y: 20, scale: 1, backgroundColor: "rgba(15, 15, 20, 0.4)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
                  animate: { opacity: 1, y: 0, transition: { delay: index * 0.05 } },
                  hover: { scale: 1.015, backgroundColor: "rgba(30, 30, 35, 0.6)", boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)", y: -3 },
                  tap: { scale: 0.98 }
                }}
                className="d-flex flex-column flex-md-row align-items-md-center p-4 rounded-4 position-relative overflow-hidden mb-2"
                style={{ 
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                {/* Glowing Left Edge */}
                <motion.div 
                  className="position-absolute top-50 start-0 translate-middle-y rounded-end"
                  style={{ width: "4px", background: "#fa709a", boxShadow: "0 0 20px #fa709a" }}
                  variants={{ hover: { height: "70%" }, initial: { height: "0%" }, animate: { height: "0%" } }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                <div style={{ flex: "0 0 30%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center gap-3">
                    <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                      <div className="position-absolute w-100 h-100 rounded-circle" style={{ background: "rgba(250, 112, 154, 0.1)", border: "1px solid rgba(250, 112, 154, 0.2)" }}></div>
                      <div className="d-flex align-items-center justify-content-center rounded-circle z-1 shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(250, 112, 154, 0.3), rgba(250, 112, 154, 0.1))", border: "1px solid rgba(250, 112, 154, 0.4)" }}>
                        <i className="bi bi-exclamation-circle text-white"></i>
                      </div>
                    </div>
                    <span className="fw-bolder text-white fs-5" style={{ letterSpacing: "0.5px" }}>{log.job_name}</span>
                  </div>
                </div>
                <div style={{ flex: "0 0 35%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: "rgba(250, 112, 154, 0.05)", border: "1px solid rgba(250, 112, 154, 0.15)", maxWidth: "fit-content" }}>
                    <i className="bi bi-x-circle text-danger"></i>
                    <div className="text-danger small fw-medium" style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.error_message || "Unknown error"}>
                      {log.error_message || "Unknown error"}
                    </div>
                  </div>
                </div>
                <div style={{ flex: "0 0 20%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <span className="theme-text-muted small d-flex align-items-center gap-2" style={{ fontWeight: 500 }}>
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <i className="bi bi-clock-history"></i> 
                    </div>
                    {new Date(log.executed_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ flex: "1", zIndex: 1 }} className="text-md-end d-flex justify-content-md-end align-items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    className="btn btn-sm text-white rounded-pill px-3 py-2 fw-bold shadow-sm border-0 d-flex align-items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)" }}
                    onClick={() => handleRetry(log.job)}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Retry
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                    className="premium-action-btn edit shadow-sm"
                    onClick={(e) => { e.stopPropagation(); router.push(`/EditJob/${log.job}`); }}
                    title="Edit Job"
                  >
                    <i className="bi bi-pencil fs-5"></i>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                    className="premium-action-btn delete shadow-sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                    title="Delete"
                  >
                    <i className="bi bi-trash fs-5"></i>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
  );
}
