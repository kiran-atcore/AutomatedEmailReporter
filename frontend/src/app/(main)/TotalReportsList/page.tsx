"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function TotalReportsList() {
  const [successLogs, setSuccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/reports/logs/?include_archived=true&status=success");
        setSuccessLogs(response.data);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download file:", error);
      showAlert("Failed to download the PDF. Please try again.", "Error");
    }
  };

  const handleClearAll = async () => {
    if (!(await showConfirm("Are you sure you want to PERMANENTLY delete all successful reports? This action cannot be undone."))) return;
    try {
      await api.delete("/reports/logs/clear_all/?permanent=true&include_archived=true&status=success");
      setSuccessLogs([]);
    } catch (err) {
      console.error("Failed to clear reports", err);
      showAlert("Failed to clear reports.", "Error");
    }
  };

  const handleDelete = async (logId: number) => {
    if (!(await showConfirm("Are you sure you want to permanently delete this report?"))) return;
    try {
      await api.delete(`/reports/logs/${logId}/?permanent=true&include_archived=true`);
      setSuccessLogs(successLogs.filter((log: any) => log.id !== logId));
    } catch (err) {
      console.error("Failed to delete log", err);
      showAlert("Failed to delete log.", "Error");
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
              style={{ background: "rgba(79, 172, 254, 0.1)", border: "1px solid rgba(79, 172, 254, 0.2)" }}
            >
              <i className="bi bi-journal-check" style={{ color: "#4facfe" }}></i>
              <span style={{ color: "#4facfe", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>REPORT LOGS</span>
            </motion.div>
            <h2 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.5rem" }}>
              Total Reports Sent
            </h2>
            <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>A historical log of all successfully dispatched automated reports.</p>
          </div>
          {successLogs.length > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button 
                className="btn text-white shadow rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2"
                onClick={handleClearAll}
                style={{ background: "rgba(255, 75, 75, 0.15)", border: "1px solid rgba(255, 75, 75, 0.4)", backdropFilter: "blur(10px)" }}
              >
                <i className="bi bi-trash3"></i> Clear All Reports
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
              <div style={{ flex: "0 0 30%" }}>Report Job Name</div>
              <div style={{ flex: "0 0 25%" }}>Status</div>
              <div style={{ flex: "0 0 25%" }}>Dispatched At</div>
              <div style={{ flex: "1" }} className="text-end">Actions</div>
            </div>

            {loading && (
              <div className="text-center py-5 theme-text-muted">Loading reports history...</div>
            )}
            {!loading && successLogs.length === 0 && (
              <div className="text-center py-5">
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <i className="bi bi-inbox fs-1 text-white-50 mb-3"></i>
                  <p className="theme-text-muted mb-0 fs-5">No successful reports yet.</p>
                </div>
              </div>
            )}
            {!loading && successLogs.map((log: any, index: number) => (
              <motion.div 
                key={log.id} 
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  initial: { opacity: 0, y: 20, scale: 1, backgroundColor: "rgba(15, 15, 20, 0.4)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: "1px solid rgba(255, 255, 255, 0.08)" },
                  animate: { opacity: 1, y: 0, transition: { delay: index * 0.05 } },
                  hover: { scale: 1.015, backgroundColor: "rgba(30, 30, 35, 0.6)", boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)", y: -3, border: "1px solid rgba(255, 255, 255, 0.15)" },
                  tap: { scale: 0.97, backgroundColor: "rgba(45, 45, 55, 0.9)", boxShadow: "inset 0 4px 20px rgba(0,0,0,0.6)", border: "1px solid rgba(79, 172, 254, 0.5)", y: 0, transition: { duration: 0.1 } }
                }}
                onClick={() => {
                  if (log.report_file) window.open(log.report_file, '_blank');
                }}
                className="d-flex flex-column flex-md-row align-items-md-center p-4 rounded-4 position-relative overflow-hidden cursor-pointer mb-2"
                style={{ 
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Glowing Left Edge */}
                <motion.div 
                  className="position-absolute top-50 start-0 translate-middle-y rounded-end"
                  style={{ width: "4px", background: "#4facfe", boxShadow: "0 0 20px #4facfe" }}
                  variants={{ hover: { height: "70%" }, initial: { height: "0%" }, animate: { height: "0%" } }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                <div style={{ flex: "0 0 30%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center gap-3">
                    <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                      <div className="position-absolute w-100 h-100 rounded-circle" style={{ background: "rgba(79, 172, 254, 0.1)", border: "1px solid rgba(79, 172, 254, 0.2)" }}></div>
                      <div className="d-flex align-items-center justify-content-center rounded-circle z-1 shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(79, 172, 254, 0.1))", border: "1px solid rgba(79, 172, 254, 0.4)" }}>
                        <i className="bi bi-file-earmark-pdf text-white"></i>
                      </div>
                    </div>
                    <span className="fw-bolder text-white fs-5" style={{ letterSpacing: "0.5px" }}>{log.job_name}</span>
                  </div>
                </div>
                <div style={{ flex: "0 0 25%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <span className="badge bg-success bg-opacity-10 text-success border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2" style={{ borderColor: "rgba(67, 233, 123, 0.3) !important", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.1)" }}>
                    <i className="bi bi-check-circle-fill"></i> Success
                  </span>
                </div>
                <div style={{ flex: "0 0 25%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <span className="theme-text-muted small d-flex align-items-center gap-2" style={{ fontWeight: 500 }}>
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <i className="bi bi-clock-history"></i> 
                    </div>
                    {new Date(log.executed_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ flex: "1", zIndex: 1 }} className="text-md-end d-flex justify-content-md-end gap-2">
                  {log.report_file ? (
                    <>
                      <motion.button 
                        whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                        onClick={(e: any) => { e.stopPropagation(); handleDownload(log.report_file, `Report_${log.job_name.replace(/\s+/g, '_')}.pdf`); }} 
                        className="premium-action-btn edit shadow-sm"
                        title="Download PDF"
                      >
                        <i className="bi bi-download fs-5"></i>
                      </motion.button>
                    </>
                  ) : (
                    <span className="theme-text-muted small me-2">No file</span>
                  )}
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
