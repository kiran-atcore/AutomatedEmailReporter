"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function LogDetailView() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!id) return;
    const fetchLog = async () => {
      try {
        const response = await api.get(`/reports/logs/${id}/?include_deleted_from_reports=true&include_archived=true`);
        setLog(response.data);
      } catch (err) {
        console.error("Failed to load log details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

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

  if (loading) {
    return <div className="container py-5 text-center">Loading log details...</div>;
  }

  if (!log) {
    return <div className="container py-5 text-center text-danger">Log not found.</div>;
  }

  return (
    <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5"
        >
          <div className="d-flex align-items-center gap-4">
            <button onClick={() => router.back()} className="premium-back-btn">
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2"
                style={{ background: "rgba(161, 161, 170, 0.1)", border: "1px solid rgba(161, 161, 170, 0.2)" }}
              >
                <i className="bi bi-journal-text" style={{ color: "#a1a1aa" }}></i>
                <span style={{ color: "#a1a1aa", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>EXECUTION LOG</span>
              </motion.div>
              <h2 className="fw-bolder mb-0" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.5rem" }}>
                Log Details
              </h2>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Main Status Card */}
          <div className="p-4 p-md-5 rounded-4 mb-5 position-relative overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}>
            <div className={`position-absolute top-0 start-0 w-100 h-100`} style={{ background: `radial-gradient(circle at top right, ${log.status === 'success' ? 'rgba(67, 233, 123, 0.05)' : 'rgba(250, 112, 154, 0.05)'} 0%, transparent 50%)`, pointerEvents: "none" }}></div>
            
            <div className="row g-4 position-relative z-1 mb-4">
              <div className="col-md-4">
                <div className="d-flex flex-column gap-2">
                  <span className="theme-text-muted text-uppercase small fw-bold" style={{ letterSpacing: "1px" }}>Status</span>
                  <span className={`badge ${log.status === 'success' ? 'bg-success text-success border-success' : 'bg-danger text-danger border-danger'} bg-opacity-10 border px-4 py-3 rounded-pill d-inline-flex align-items-center gap-2`} style={{ width: "fit-content", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.1)", fontSize: "1rem" }}>
                    <i className={`bi ${log.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                    {log.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex flex-column gap-2">
                  <span className="theme-text-muted text-uppercase small fw-bold" style={{ letterSpacing: "1px" }}>Job Name</span>
                  <div className="d-flex align-items-center gap-3 text-white fs-5 fw-semibold">
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <i className="bi bi-briefcase"></i> 
                    </div>
                    {log.job_name}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex flex-column gap-2">
                  <span className="theme-text-muted text-uppercase small fw-bold" style={{ letterSpacing: "1px" }}>Executed At</span>
                  <div className="d-flex align-items-center gap-3 text-white fs-5 fw-semibold">
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <i className="bi bi-clock-history"></i> 
                    </div>
                    {new Date(log.executed_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {log.error_message && (
              <div className="mt-4 pt-4 border-top border-secondary border-opacity-25">
                <span className="theme-text-muted text-uppercase small fw-bold d-block mb-3" style={{ letterSpacing: "1px" }}>Error Details</span>
                <div className="p-4 bg-danger bg-opacity-10 text-danger rounded-4 font-monospace shadow-inner" style={{ border: "1px solid rgba(250, 112, 154, 0.2)" }}>
                  <i className="bi bi-x-octagon-fill me-2"></i> {log.error_message}
                </div>
              </div>
            )}

            {log.report_file && (
              <div className="mt-4 pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-md-row align-items-md-center gap-4">
                <span className="theme-text-muted text-uppercase small fw-bold" style={{ letterSpacing: "1px" }}>Generated Report</span>
                <div className="d-flex gap-3">
                  <motion.a 
                    whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    href={log.report_file} target="_blank" rel="noopener noreferrer" 
                    className="btn text-white fw-bold rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)", border: "none" }}
                  >
                    <i className="bi bi-eye"></i> View PDF
                  </motion.a>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownload(log.report_file, `Report_${log.job_name.replace(/\s+/g, '_')}.pdf`)} 
                    className="btn text-white fw-bold rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                    style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                  >
                    <i className="bi bi-download"></i> Download
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {log.job_details ? (
            <>
              <h4 className="fw-bolder mb-4 text-white d-flex align-items-center gap-3 mt-5" style={{ fontFamily: "var(--font-righteous)", letterSpacing: "1px" }}>
                <i className="bi bi-gear-wide-connected" style={{ color: "#fa709a" }}></i> Historic Configuration Architecture
              </h4>
              <p className="theme-text-muted mb-4">The configuration settings of the job at the exact time this execution ran.</p>
              
              <div className="row g-4">
                {/* Data Source Card */}
                <div className="col-md-4">
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 15px 35px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)", backgroundColor: "rgba(30, 30, 35, 0.6)" }}
                    className="h-100 p-4 rounded-4 position-relative overflow-hidden cursor-pointer"
                    style={{ background: "rgba(15, 15, 20, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", transition: "all 0.3s ease" }}
                  >
                    <div className="position-relative z-1">
                      <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm" style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(79, 172, 254, 0.1))", border: "1px solid rgba(79, 172, 254, 0.4)", color: "#4facfe" }}>
                        <i className="bi bi-hdd-network fs-3"></i>
                      </div>
                      <h5 className="fw-bold mb-3 text-white" style={{ letterSpacing: "0.5px" }}>Data Source</h5>
                      
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Name</div>
                          <div className="fw-semibold text-white fs-6">{log.job_details.data_source_details?.name}</div>
                        </div>
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Connection Type</div>
                          <div className="fw-semibold text-white fs-6 text-capitalize">{log.job_details.data_source_details?.connection_type}</div>
                        </div>
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Endpoint URL</div>
                          <div className="fw-semibold text-info small text-truncate" title={log.job_details.data_source_details?.endpoint}>{log.job_details.data_source_details?.endpoint}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Template Card */}
                <div className="col-md-4">
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 15px 35px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)", backgroundColor: "rgba(30, 30, 35, 0.6)" }}
                    className="h-100 p-4 rounded-4 position-relative overflow-hidden cursor-pointer"
                    style={{ background: "rgba(15, 15, 20, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", transition: "all 0.3s ease" }}
                  >
                    <div className="position-relative z-1">
                      <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm" style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, rgba(67, 233, 123, 0.3), rgba(67, 233, 123, 0.1))", border: "1px solid rgba(67, 233, 123, 0.4)", color: "#43e97b" }}>
                        <i className="bi bi-palette fs-3"></i>
                      </div>
                      <h5 className="fw-bold mb-3 text-white" style={{ letterSpacing: "0.5px" }}>Design Template</h5>
                      
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Name</div>
                          <div className="fw-semibold text-white fs-6">{log.job_details.template_details?.name}</div>
                        </div>
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Layout Engine</div>
                          <div className="fw-semibold text-white fs-6 text-capitalize">{log.job_details.template_details?.layout}</div>
                        </div>
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Header Text</div>
                          <div className="fw-semibold text-success small">{log.job_details.template_details?.header_text || "Default Standard Header"}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Schedule Card */}
                <div className="col-md-4">
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 15px 35px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)", backgroundColor: "rgba(30, 30, 35, 0.6)" }}
                    className="h-100 p-4 rounded-4 position-relative overflow-hidden cursor-pointer"
                    style={{ background: "rgba(15, 15, 20, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", transition: "all 0.3s ease" }}
                  >
                    <div className="position-relative z-1">
                      <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm" style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, rgba(250, 112, 154, 0.3), rgba(250, 112, 154, 0.1))", border: "1px solid rgba(250, 112, 154, 0.4)", color: "#fa709a" }}>
                        <i className="bi bi-stopwatch fs-3"></i>
                      </div>
                      <h5 className="fw-bold mb-3 text-white" style={{ letterSpacing: "0.5px" }}>Schedule Rules</h5>
                      
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Frequency</div>
                          <div className="fw-semibold text-white fs-6 text-capitalize">{log.job_details.schedule_details?.frequency}</div>
                        </div>
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Time of Day</div>
                          <div className="fw-semibold text-white fs-6">{log.job_details.schedule_details?.time_of_day}</div>
                        </div>
                        <div>
                          <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Recipients</div>
                          <div className="fw-semibold text-warning small text-truncate" title={log.job_details.schedule_details?.recipients}>{log.job_details.schedule_details?.recipients}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5">
              <div className="p-4 p-md-5 rounded-4 text-center position-relative overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                <i className="bi bi-cloud-slash fs-1 theme-text-muted mb-3 d-block"></i>
                <h5 className="text-white fw-bold">Configuration Details Unavailable</h5>
                <p className="theme-text-muted mb-0 mx-auto" style={{ maxWidth: "500px" }}>
                  The original Job associated with this execution log has been deleted from the system. Historic configuration details cannot be retrieved.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
  );
}
