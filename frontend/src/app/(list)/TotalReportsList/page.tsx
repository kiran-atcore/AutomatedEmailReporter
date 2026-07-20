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
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold" style={{ color: "#4facfe" }}>Total Reports Sent</h2>
              <p className="text-muted">A historical log of all successfully dispatched automated reports.</p>
            </div>
            {successLogs.length > 0 && (
              <button 
                className="btn btn-outline-danger shadow-sm rounded-pill px-4"
                onClick={handleClearAll}
              >
                Clear All Reports
              </button>
            )}
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-muted border-0 py-3 px-4 rounded-top-start">Report Job Name</th>
                      <th className="text-muted border-0 py-3">Status</th>
                      <th className="text-muted border-0 py-3">Dispatched At</th>
                      <th className="text-muted border-0 py-3 text-end px-4 rounded-top-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={4} className="text-center py-4">Loading reports history...</td></tr>
                    )}
                    {!loading && successLogs.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">No successful reports yet.</td></tr>
                    )}
                    {!loading && successLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="fw-semibold py-4 px-4 border-bottom-0">{log.job_name}</td>
                        <td className="text-success py-4 border-bottom-0">Success</td>
                        <td className="text-secondary py-4 border-bottom-0">{new Date(log.executed_at).toLocaleString()}</td>
                        <td className="text-end py-4 px-4 border-bottom-0">
                          {log.report_file ? (
                            <>
                              <a href={log.report_file} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium me-2">
                                View PDF
                              </a>
                              <button 
                                onClick={() => handleDownload(log.report_file, `Report_${log.job_name.replace(/\s+/g, '_')}.pdf`)} 
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium me-2"
                              >
                                Download
                              </button>
                            </>
                          ) : (
                            <span className="text-muted small me-2">No file</span>
                          )}
                          <button 
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium"
                            onClick={() => handleDelete(log.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
