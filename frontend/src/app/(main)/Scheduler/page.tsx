"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";
import SchedulerListCard from "@/components/SchedulerListCard";

export default function SchedulerPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = useAlert();

  const fetchSchedules = async () => {
    try {
      const response = await api.get("/reports/schedules/");
      setSchedules(response.data);
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!(await showConfirm("Are you sure you want to delete this schedule? This may affect active jobs."))) return;
    try {
      await api.delete(`/reports/schedules/${id}/`);
      showAlert("Schedule deleted successfully", "Success");
      fetchSchedules();
    } catch (err) {
      console.error("Failed to delete schedule", err);
      showAlert("Failed to delete schedule.", "Error");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
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
            style={{ background: "rgba(255,87,34,0.1)", border: "1px solid rgba(255,87,34,0.2)" }}
          >
            <div className="spinner-grow spinner-grow-sm" style={{ color: "var(--theme-accent)", width: "10px", height: "10px" }} role="status" />
            <span style={{ color: "var(--theme-accent)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>AUTOMATION HUB</span>
          </motion.div>
          <h2 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.5rem" }}>
            Scheduler & Distribution
          </h2>
          <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>Manage when your reports run and who receives them.</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
          <Link href="/NewSchedule" className="premium-cta-btn">
            <i className="bi bi-plus-lg"></i> Create Schedule
          </Link>
        </motion.div>
      </motion.div>

        {loading ? (
          <div className="text-center py-5">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-5 theme-card rounded-4">
            <h5 className="theme-text-muted mb-3">No schedules created yet.</h5>
            <Link href="/NewSchedule" className="premium-cta-btn d-inline-flex mx-auto">Create your first schedule</Link>
          </div>
        ) : (
          <motion.div 
            className="d-flex flex-column gap-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {schedules.map((sch: any) => (
              <SchedulerListCard key={sch.id} schedule={sch} onDelete={handleDelete} variants={itemVariants} />
            ))}
          </motion.div>
        )}
    </div>
  );
}
