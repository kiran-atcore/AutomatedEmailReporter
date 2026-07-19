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
              <h2 className="fw-bold" style={{ color: "#fa709a" }}>Failed Jobs</h2>
              <p className="text-muted">Jobs that encountered errors during their last scheduled execution.</p>
            </div>
            {failedLogs.length > 0 && (
              <button 
                className="btn btn-outline-danger shadow-sm rounded-pill px-4"
                onClick={handleClearAll}
              >
                Clear All Failed Logs
              </button>
            )}
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-muted border-0 py-3 px-4 rounded-top-start">Job Name</th>
                      <th className="text-muted border-0 py-3">Error Log</th>
                      <th className="text-muted border-0 py-3">Failed At</th>
                      <th className="text-muted border-0 py-3 text-end px-4 rounded-top-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={4} className="text-center py-4">Loading failed jobs...</td></tr>
                    )}
                    {!loading && failedLogs.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">No failed jobs! You're all good.</td></tr>
                    )}
                    {!loading && failedLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="fw-semibold py-4 px-4 border-bottom-0">{log.job_name}</td>
                        <td className="text-danger py-4 border-bottom-0">{log.error_message || "Unknown error"}</td>
                        <td className="text-secondary py-4 border-bottom-0">{new Date(log.executed_at).toLocaleString()}</td>
                        <td className="text-end py-4 px-4 border-bottom-0">
                          <button 
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium me-2"
                            onClick={() => handleRetry(log.job)}
                          >
                            Retry Job
                          </button>
                          <Link 
                            href={`/EditJob/${log.job}`} 
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium me-2 text-decoration-none"
                          >
                            Edit Job
                          </Link>
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
