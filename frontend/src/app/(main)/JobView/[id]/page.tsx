"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function JobView() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const response = await api.get(`/reports/jobs/${id}/`);
        setJob(response.data);
      } catch (err) {
        console.error("Failed to fetch job details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleRunNow = async () => {
    try {
      await api.post(`/reports/jobs/${id}/run/`);
      showAlert("Job triggered successfully! It is running in the background.", "Success");
    } catch (err) {
      console.error("Failed to run job", err);
      showAlert("Failed to run job.", "Error");
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading job details...</div>;
  }

  if (!job) {
    return <div className="container py-5 text-center text-danger">Job not found.</div>;
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
            <button onClick={() => router.push('/TotalJobsList')} className="premium-back-btn">
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2"
                style={{ background: "rgba(67, 233, 123, 0.1)", border: "1px solid rgba(67, 233, 123, 0.2)" }}
              >
                <i className="bi bi-briefcase" style={{ color: "#43e97b" }}></i>
                <span style={{ color: "#43e97b", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>JOB WORKFLOW</span>
              </motion.div>
              <h2 className="fw-bolder mb-0" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.5rem" }}>
                {job.name}
              </h2>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button 
              className="btn text-white fw-bold rounded-pill px-5 py-3 shadow d-flex align-items-center gap-2"
              onClick={handleRunNow}
              style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", boxShadow: "0 10px 25px rgba(79, 172, 254, 0.4)", border: "none" }}
            >
              <i className="bi bi-play-fill fs-5"></i> Run Workflow Now
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Main Status Card */}
          <div className="p-4 p-md-5 rounded-4 mb-5 position-relative overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "radial-gradient(circle at top right, rgba(67, 233, 123, 0.05) 0%, transparent 50%)", pointerEvents: "none" }}></div>
            
            <div className="row g-4 position-relative z-1">
              <div className="col-md-4">
                <div className="d-flex flex-column gap-2">
                  <span className="theme-text-muted text-uppercase small fw-bold" style={{ letterSpacing: "1px" }}>Current Status</span>
                  <span className={`badge ${job.is_active ? 'bg-success text-success border-success' : 'bg-warning text-warning border-warning'} bg-opacity-10 border px-4 py-3 rounded-pill d-inline-flex align-items-center gap-2`} style={{ width: "fit-content", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.1)", fontSize: "1rem" }}>
                    <i className={`bi ${job.is_active ? 'bi-activity' : 'bi-pause-circle'}`}></i>
                    {job.is_active ? 'Active Running' : 'Currently Stopped'}
                  </span>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex flex-column gap-2">
                  <span className="theme-text-muted text-uppercase small fw-bold" style={{ letterSpacing: "1px" }}>Created At</span>
                  <div className="d-flex align-items-center gap-3 text-white fs-5 fw-semibold">
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <i className="bi bi-calendar-event"></i> 
                    </div>
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex flex-column gap-2">
                  <span className="theme-text-muted text-uppercase small fw-bold" style={{ letterSpacing: "1px" }}>Next Firing Time</span>
                  <div className="d-flex align-items-center gap-3 fs-5 fw-semibold" style={{ color: job.next_run_time ? "#4facfe" : "rgba(255,255,255,0.4)" }}>
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "40px", height: "40px", background: "rgba(79, 172, 254, 0.1)", border: "1px solid rgba(79, 172, 254, 0.2)" }}>
                      <i className="bi bi-alarm"></i> 
                    </div>
                    {job.next_run_time ? new Date(job.next_run_time).toLocaleString() : "Not scheduled"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h4 className="fw-bolder mb-4 text-white d-flex align-items-center gap-3" style={{ fontFamily: "var(--font-righteous)", letterSpacing: "1px" }}>
            <i className="bi bi-gear-wide-connected" style={{ color: "#fa709a" }}></i> Configuration Architecture
          </h4>
          
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
                      <div className="fw-semibold text-white fs-6">{job.data_source_details?.name}</div>
                    </div>
                    <div>
                      <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Connection Type</div>
                      <div className="fw-semibold text-white fs-6 text-capitalize">{job.data_source_details?.connection_type}</div>
                    </div>
                    <div>
                      <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Endpoint URL</div>
                      <div className="fw-semibold text-info small text-truncate" title={job.data_source_details?.endpoint}>{job.data_source_details?.endpoint}</div>
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
                      <div className="fw-semibold text-white fs-6">{job.template_details?.name}</div>
                    </div>
                    <div>
                      <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Layout Engine</div>
                      <div className="fw-semibold text-white fs-6 text-capitalize">{job.template_details?.layout}</div>
                    </div>
                    <div>
                      <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Header Text</div>
                      <div className="fw-semibold text-success small">{job.template_details?.header_text || "Default Standard Header"}</div>
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
                      <div className="fw-semibold text-white fs-6 text-capitalize">{job.schedule_details?.frequency}</div>
                    </div>
                    <div>
                      <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Time of Day</div>
                      <div className="fw-semibold text-white fs-6">{job.schedule_details?.time_of_day}</div>
                    </div>
                    <div>
                      <div className="theme-text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Recipients</div>
                      <div className="fw-semibold text-warning small text-truncate" title={job.schedule_details?.recipients}>{job.schedule_details?.recipients}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
  );
}
