"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function LogDetailView() {
  const params = useParams();
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
          <Link href="/Dashboard" className="btn btn-outline-light btn-sm rounded-pill px-3">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card border-0 shadow-sm rounded-4 p-4 p-md-5"
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0" style={{ color: "#1e3c72" }}>Execution Log Details</h2>
            <span className={`badge ${log.status === 'success' ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${log.status === 'success' ? 'success' : 'danger'} rounded-pill px-4 py-2 fs-6`}>
              {log.status.toUpperCase()}
            </span>
          </div>
          
          <hr />

          <div className="row mb-3 mt-4">
            <div className="col-md-3 fw-bold text-muted">Job Name:</div>
            <div className="col-md-9 fs-5">{log.job_name}</div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-3 fw-bold text-muted">Executed At:</div>
            <div className="col-md-9">{new Date(log.executed_at).toLocaleString()}</div>
          </div>

          {log.error_message && (
            <div className="row mb-3">
              <div className="col-md-3 fw-bold text-muted">Error Message:</div>
              <div className="col-md-9">
                <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3 font-monospace small">
                  {log.error_message}
                </div>
              </div>
            </div>
          )}

          {log.report_file && (
            <div className="row mb-3 mt-4">
              <div className="col-md-3 fw-bold text-muted">Generated Report:</div>
              <div className="col-md-9">
                <a href={log.report_file} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary rounded-pill px-4 me-2 shadow-sm">
                  View PDF
                </a>
                <button 
                  onClick={() => handleDownload(log.report_file, `Report_${log.job_name.replace(/\s+/g, '_')}.pdf`)} 
                  className="btn btn-sm btn-outline-secondary rounded-pill px-4"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {log.job_details ? (
            <>
              <hr className="my-5" />
              <h5 className="fw-bold mb-4" style={{ color: "#1e3c72" }}>Active Job Configuration at Time of Run</h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="card h-100 bg-light border-0 p-4 rounded-4 shadow-sm">
                    <h6 className="text-primary fw-bold mb-3">📡 Data Source</h6>
                    <p className="mb-1"><strong>Name:</strong> {log.job_details.data_source_details?.name}</p>
                    <p className="mb-1"><strong>Type:</strong> {log.job_details.data_source_details?.connection_type}</p>
                    <p className="mb-0 text-truncate" title={log.job_details.data_source_details?.endpoint}>
                      <strong>URL:</strong> {log.job_details.data_source_details?.endpoint}
                    </p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100 bg-light border-0 p-4 rounded-4 shadow-sm">
                    <h6 className="text-success fw-bold mb-3">📄 Template</h6>
                    <p className="mb-1"><strong>Name:</strong> {log.job_details.template_details?.name}</p>
                    <p className="mb-1"><strong>Layout:</strong> {log.job_details.template_details?.layout}</p>
                    <p className="mb-0"><strong>Header:</strong> {log.job_details.template_details?.header_text || "Default"}</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100 bg-light border-0 p-4 rounded-4 shadow-sm">
                    <h6 className="text-warning text-dark fw-bold mb-3">⏰ Schedule</h6>
                    <p className="mb-1"><strong>Frequency:</strong> {log.job_details.schedule_details?.frequency}</p>
                    <p className="mb-1"><strong>Time:</strong> {log.job_details.schedule_details?.time_of_day}</p>
                    <p className="mb-0 text-truncate" title={log.job_details.schedule_details?.recipients}>
                      <strong>To:</strong> {log.job_details.schedule_details?.recipients}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <hr className="my-5" />
              <div className="alert alert-secondary border-0 text-center rounded-4 p-4">
                <p className="mb-0 text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  The original Job associated with this log has been deleted. Configuration details are no longer available.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
