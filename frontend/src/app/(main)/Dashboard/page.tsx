"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import LogsListCard from "@/components/LogsListCard";
import MainButton from "@/components/MainButton";

export default function UserDashboard() {
  const [metrics, setMetrics] = useState({
    total_reports_sent: 0,
    total_jobs: 0,
    active_jobs: 0,
    inactive_jobs: 0,
    failed_jobs: 0
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/reports/dashboard/");
      setMetrics(response.data);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const ordering = sortOrder === 'latest' ? '-executed_at' : 'executed_at';
      const response = await api.get(`/reports/logs/?search=${searchQuery}&ordering=${ordering}`);
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to load logs", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchDashboard();
      await fetchLogs();
      setLoading(false);
    };
    init();
  }, []);

  // Fetch logs whenever search or sort changes
  useEffect(() => {
    if (!loading) {
      fetchLogs();
    }
  }, [searchQuery, sortOrder]);

  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();

  const handleClearAllLogs = async () => {
    if (!(await showConfirm("Are you sure you want to clear ALL execution logs from the dashboard? (Successful reports will be preserved in your Total Reports archive)"))) return;
    try {
      await api.delete("/reports/logs/clear_all/");
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs", err);
      showAlert("Failed to clear logs.", "Error");
    }
  };

  const handleDeleteLog = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!(await showConfirm("Delete this log?"))) return;
    try {
      await api.delete(`/reports/logs/${id}/`);
      setLogs(logs.filter((log: any) => log.id !== id));
    } catch (err) {
      console.error("Failed to delete log", err);
      showAlert("Failed to delete log.", "Error");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border" style={{ color: "var(--theme-accent)", width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="container py-5 position-relative">
      {/* Decorative background glow */}
      <div
        className="position-absolute rounded-circle"
        style={{
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, rgba(255,87,34,0.05) 0%, transparent 60%)",
          top: "-10vw",
          right: "-10vw",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="position-relative z-1"
      >
        <motion.div variants={itemVariants} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h2 className="fw-bold text-white mb-1" style={{ letterSpacing: "-0.5px" }}>Dashboard Overview</h2>
            <p className="theme-text-muted mb-0">Monitor your automated reporting infrastructure.</p>
          </div>
          <div>
            <MainButton onClick={() => router.push("/NewJob")} className="px-4 py-2 rounded-pill shadow-lg">
              <i className="bi bi-plus-lg me-2"></i> Create New Job
            </MainButton>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <motion.div variants={itemVariants} className="row g-4 mb-5">
          <div className="col-md-4">
            <DashboardStatsCard
              title="Total Reports Sent"
              value={metrics.total_reports_sent}
              trend="Overall volume processed"
              color="#4facfe"
              href="/TotalReportsList"
              icon="bi-send-check"
            />
          </div>
          <div className="col-md-4">
            <DashboardStatsCard
              title="Total Jobs"
              value={metrics.total_jobs}
              trend={`${metrics.active_jobs} Active | ${metrics.inactive_jobs} Stopped`}
              color="#43e97b"
              href="/TotalJobsList"
              icon="bi-gear-wide-connected"
            />
          </div>
          <div className="col-md-4">
            <DashboardStatsCard
              title="Failed Executions"
              value={metrics.failed_jobs}
              trend={metrics.failed_jobs > 0 ? "Requires attention" : "All systems operational"}
              color={metrics.failed_jobs > 0 ? "#fa709a" : "#6c757d"}
              href="/FailedJobsList"
              icon="bi-exclamation-triangle"
            />
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div variants={itemVariants}>
          <LogsListCard
            logs={logs}
            onClearAll={handleClearAllLogs}
            onDeleteLog={handleDeleteLog}
            onRowClick={(id) => router.push(`/LogDetailView/${id}`)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
