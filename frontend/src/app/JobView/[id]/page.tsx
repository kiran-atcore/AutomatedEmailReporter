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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
        <div className="container-fluid px-4 py-2">
          <Link href="/Dashboard" className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2">
            <span>📊</span> AutoReporter
          </Link>
          <button onClick={() => router.back()} className="btn btn-outline-light btn-sm rounded-pill px-3">
            Go Back
          </button>
        </div>
      </nav>

      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0" style={{ color: "#1e3c72" }}>Job Details: {job.name}</h2>
              <button 
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                onClick={handleRunNow}
                style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", border: "none", color: "#000" }}
              >
                ▶ Run Now
              </button>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-3 fw-bold text-muted">Status:</div>
              <div className="col-md-9">
                <span className={`badge ${job.is_active ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2 rounded-pill`}>
                  {job.is_active ? 'Active' : 'Stopped'}
                </span>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-3 fw-bold text-muted">Created At:</div>
              <div className="col-md-9">{new Date(job.created_at).toLocaleString()}</div>
            </div>

            <div className="row mb-3">
              <div className="col-md-3 fw-bold text-muted">Next Firing Time:</div>
              <div className="col-md-9">
                {job.next_run_time ? (
                  <span className="fw-semibold text-primary">{new Date(job.next_run_time).toLocaleString()}</span>
                ) : (
                  <span className="text-secondary">Not scheduled / Inactive</span>
                )}
              </div>
            </div>

            <hr />
            <h5 className="fw-bold mt-4 mb-3">Configuration Details</h5>
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="card h-100 bg-light border-0 p-3 rounded-3 shadow-sm">
                  <h6 className="text-primary fw-bold mb-3">📡 Data Source</h6>
                  <p className="mb-1"><strong>Name:</strong> {job.data_source_details?.name}</p>
                  <p className="mb-1"><strong>Type:</strong> {job.data_source_details?.connection_type}</p>
                  <p className="mb-0 text-truncate" title={job.data_source_details?.endpoint}>
                    <strong>URL:</strong> {job.data_source_details?.endpoint}
                  </p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card h-100 bg-light border-0 p-3 rounded-3 shadow-sm">
                  <h6 className="text-success fw-bold mb-3">📄 Template</h6>
                  <p className="mb-1"><strong>Name:</strong> {job.template_details?.name}</p>
                  <p className="mb-1"><strong>Layout:</strong> {job.template_details?.layout}</p>
                  <p className="mb-0"><strong>Header:</strong> {job.template_details?.header_text || "Default"}</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card h-100 bg-light border-0 p-3 rounded-3 shadow-sm">
                  <h6 className="text-warning text-dark fw-bold mb-3">⏰ Schedule</h6>
                  <p className="mb-1"><strong>Frequency:</strong> {job.schedule_details?.frequency}</p>
                  <p className="mb-1"><strong>Time:</strong> {job.schedule_details?.time_of_day}</p>
                  <p className="mb-0 text-truncate" title={job.schedule_details?.recipients}>
                    <strong>To:</strong> {job.schedule_details?.recipients}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
}
