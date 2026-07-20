"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

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

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold" style={{ color: "#1e3c72" }}>Scheduler & Distribution</h2>
          <Link href="/NewSchedule" className="btn btn-primary shadow-sm rounded-pill px-4 text-decoration-none" style={{ background: "#2a5298", border: "none" }}>
            + Create Schedule
          </Link>
        </div>

        <p className="text-muted mb-4">Manage when your reports run and who receives them.</p>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-muted border-0 py-3 px-4 rounded-top-start">Schedule Name</th>
                    <th className="text-muted border-0 py-3">Frequency</th>
                    <th className="text-muted border-0 py-3">Time (UTC)</th>
                    <th className="text-muted border-0 py-3">Recipients</th>
                    <th className="text-muted border-0 py-3 text-end px-4 rounded-top-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={4} className="text-center py-4">Loading schedules...</td></tr>
                  )}
                  {!loading && schedules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No schedules created yet. <Link href="/NewSchedule">Create one now.</Link>
                      </td>
                    </tr>
                  )}
                  {!loading && schedules.map((sch: any) => (
                    <tr key={sch.id}>
                      <td className="fw-semibold py-4 px-4 border-bottom-0">{sch.name}</td>
                      <td className="text-secondary py-4 border-bottom-0 text-capitalize">
                        <i className="bi bi-clock me-2"></i>{sch.frequency}
                      </td>
                      <td className="text-secondary py-4 border-bottom-0">
                        {sch.time_of_day}
                      </td>
                      <td className="py-4 border-bottom-0">
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {sch.recipients.split(',').length} Users
                        </span>
                      </td>
                      <td className="text-end py-4 px-4 border-bottom-0">
                        <Link href={`/EditSchedule/${sch.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium me-2">
                          Edit
                        </Link>
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium"
                          onClick={(e) => handleDelete(e, sch.id)}
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
  );
}
