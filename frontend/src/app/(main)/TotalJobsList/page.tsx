"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function ActiveJobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();

  const fetchJobs = async () => {
    try {
      const response = await api.get("/reports/jobs/");
      setJobs(response.data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStop = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.patch(`/reports/jobs/${id}/`, { is_active: false });
      showAlert("Job stopped successfully", "Success");
      fetchJobs();
    } catch (err) {
      console.error("Failed to stop job", err);
      showAlert("Failed to stop job", "Error");
    }
  };

  const handleActivate = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.patch(`/reports/jobs/${id}/`, { is_active: true });
      showAlert("Job activated successfully", "Success");
      fetchJobs();
    } catch (err) {
      console.error("Failed to activate job", err);
      showAlert("Failed to activate job", "Error");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!(await showConfirm("Are you sure you want to delete this job?"))) return;
    try {
      await api.delete(`/reports/jobs/${id}/`);
      showAlert("Job deleted successfully", "Success");
      fetchJobs();
    } catch (err) {
      console.error("Failed to delete job", err);
      showAlert("Failed to delete job", "Error");
    }
  };

  const handleRowClick = (id: number) => {
    router.push(`/JobView/${id}`);
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
              style={{ background: "rgba(67, 233, 123, 0.1)", border: "1px solid rgba(67, 233, 123, 0.2)" }}
            >
              <i className="bi bi-gear-wide-connected" style={{ color: "#43e97b" }}></i>
              <span style={{ color: "#43e97b", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>ACTIVE WORKFLOWS</span>
            </motion.div>
            <h2 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.5rem" }}>
              Total Jobs
            </h2>
            <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>A comprehensive list of all running and stopped automated jobs.</p>
          </div>
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
              <div style={{ flex: "0 0 25%" }}>Status</div>
              <div style={{ flex: "0 0 25%" }}>Created At</div>
              <div style={{ flex: "1" }} className="text-end">Actions</div>
            </div>

            {loading && (
              <div className="text-center py-5 theme-text-muted">Loading jobs...</div>
            )}
            {!loading && jobs.length === 0 && (
              <div className="text-center py-5">
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <i className="bi bi-kanban fs-1 text-white-50 mb-3"></i>
                  <p className="theme-text-muted mb-0 fs-5">No jobs found.</p>
                </div>
              </div>
            )}
            {!loading && jobs.map((job: any, index: number) => (
              <motion.div 
                key={job.id} 
                onClick={() => handleRowClick(job.id)} 
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
                className="d-flex flex-column flex-md-row align-items-md-center p-4 rounded-4 position-relative overflow-hidden cursor-pointer mb-2"
                style={{ 
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  cursor: "pointer",
                }}
              >
                {/* Glowing Left Edge */}
                <motion.div 
                  className="position-absolute top-50 start-0 translate-middle-y rounded-end"
                  style={{ width: "4px", background: "#43e97b", boxShadow: "0 0 20px #43e97b" }}
                  variants={{ hover: { height: "70%" }, initial: { height: "0%" }, animate: { height: "0%" } }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                <div style={{ flex: "0 0 30%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center gap-3">
                    <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                      <div className="position-absolute w-100 h-100 rounded-circle" style={{ background: "rgba(67, 233, 123, 0.1)", border: "1px solid rgba(67, 233, 123, 0.2)" }}></div>
                      <div className="d-flex align-items-center justify-content-center rounded-circle z-1 shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, rgba(67,233,123,0.3), rgba(67,233,123,0.1))", border: "1px solid rgba(67,233,123,0.4)" }}>
                        <i className="bi bi-briefcase text-white"></i>
                      </div>
                    </div>
                    <span className="fw-bolder text-white fs-5" style={{ letterSpacing: "0.5px" }}>{job.name}</span>
                  </div>
                </div>
                <div style={{ flex: "0 0 25%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <span className={`badge ${job.is_active ? 'bg-success text-success border-success' : 'bg-warning text-warning border-warning'} bg-opacity-10 border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2`} style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.1)" }}>
                    <i className={`bi ${job.is_active ? 'bi-activity' : 'bi-pause-circle'}`}></i>
                    {job.is_active ? 'Active' : 'Stopped'}
                  </span>
                </div>
                <div style={{ flex: "0 0 25%", zIndex: 1 }} className="mb-3 mb-md-0">
                  <span className="theme-text-muted small d-flex align-items-center gap-2" style={{ fontWeight: 500 }}>
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <i className="bi bi-clock-history"></i> 
                    </div>
                    {new Date(job.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ flex: "1", zIndex: 1 }} className="text-md-end d-flex justify-content-md-end gap-2">
                  {job.is_active ? (
                    <motion.button 
                      whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                      className="premium-action-btn stop shadow-sm"
                      onClick={(e) => { e.stopPropagation(); handleStop(e, job.id); }}
                      title="Stop"
                    >
                      <i className="bi bi-stop-circle fs-5"></i>
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                      className="premium-action-btn activate shadow-sm"
                      onClick={(e) => { e.stopPropagation(); handleActivate(e, job.id); }}
                      title="Activate"
                    >
                      <i className="bi bi-play-circle fs-5"></i>
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                    className="premium-action-btn edit shadow-sm"
                    onClick={(e) => { e.stopPropagation(); router.push(`/EditJob/${job.id}`); }}
                    title="Edit"
                  >
                    <i className="bi bi-pencil fs-5"></i>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                    className="premium-action-btn delete shadow-sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(e, job.id); }}
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
