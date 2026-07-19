"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function UserDashboard() {
  const [metrics, setMetrics] = useState({
    total_reports_sent: 0,
    total_jobs: 0,
    active_jobs: 0,
    inactive_jobs: 0,
    failed_jobs: 0,
    recent_logs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/reports/dashboard/");
        setMetrics(response.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();

  const handleClearAllLogs = async () => {
    if (!(await showConfirm("Are you sure you want to clear ALL execution logs from the dashboard? (Successful reports will be preserved in your Total Reports archive)"))) return;
    try {
      await api.delete("/reports/logs/clear_all/");
      setMetrics({ 
        ...metrics, 
        recent_logs: [] 
      });
    } catch (err) {
      console.error("Failed to clear logs", err);
      showAlert("Failed to clear logs.", "Error");
    }
  };

  const handleDeleteLog = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent row click
    if (!(await showConfirm("Delete this log?"))) return;
    try {
      await api.delete(`/reports/logs/${id}/`);
      setMetrics({
        ...metrics,
        recent_logs: metrics.recent_logs.filter((log: any) => log.id !== id)
      });
    } catch (err) {
      console.error("Failed to delete log", err);
      showAlert("Failed to delete log.", "Error");
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading dashboard...</div>;
  }

  return (
      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold" style={{ color: "#1e3c72" }}>Welcome Back!</h2>
            <Link href="/NewJob" className="btn btn-primary shadow-sm rounded-pill px-4 text-decoration-none" style={{ background: "#2a5298", border: "none" }}>
              + Create New Job
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="row g-4 mb-5">
            {[
              { title: "Total Reports Sent", value: metrics.total_reports_sent, trend: "Overall volume", color: "#4facfe", href: "/TotalReportsList" },
              { title: "Total Jobs", value: metrics.total_jobs, trend: `${metrics.active_jobs} Active | ${metrics.inactive_jobs} Stopped`, color: "#43e97b", href: "/TotalJobsList" },
              { title: "Failed Jobs", value: metrics.failed_jobs, trend: "Needs attention", color: "#fa709a", href: "/FailedJobsList" }
            ].map((metric, idx) => (
              <div key={idx} className="col-md-4">
                <Link href={metric.href} className="text-decoration-none">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="card border-0 shadow-sm rounded-4 h-100 p-4"
                    style={{ background: "white" }}
                  >
                    <h6 className="text-muted fw-bold mb-3 text-uppercase" style={{ fontSize: "0.8rem", letterSpacing: "1px" }}>
                      {metric.title}
                    </h6>
                    <h2 className="display-5 fw-bold mb-2" style={{ color: metric.color }}>{metric.value}</h2>
                    <small className="text-secondary fw-medium">{metric.trend}</small>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0" style={{ color: "#1e3c72" }}>Recent Execution Logs</h5>
              {metrics.recent_logs.length > 0 && (
                <button 
                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                  onClick={handleClearAllLogs}
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="card-body p-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th className="text-muted border-0">Job Name</th>
                      <th className="text-muted border-0">Timestamp</th>
                      <th className="text-muted border-0">Status</th>
                      <th className="text-muted border-0 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recent_logs.map((log: any) => (
                      <tr 
                        key={log.id} 
                        onClick={() => router.push(`/LogDetailView/${log.id}`)}
                        style={{ cursor: "pointer" }}
                        className="position-relative"
                      >
                        <td className="fw-semibold py-3">{log.job_name}</td>
                        <td className="text-secondary py-3">{new Date(log.executed_at).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`badge ${log.status === 'success' ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${log.status === 'success' ? 'success' : 'danger'} rounded-pill px-3 py-2`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="text-end py-3">
                          <button 
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium position-relative z-1"
                            onClick={(e) => handleDeleteLog(e, log.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {metrics.recent_logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">No recent activity.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
  );
}
