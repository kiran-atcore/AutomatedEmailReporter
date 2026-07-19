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
          <div className="mb-4">
            <h2 className="fw-bold" style={{ color: "#43e97b" }}>Total Jobs</h2>
            <p className="text-muted">A comprehensive list of all running and stopped automated jobs.</p>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-muted border-0 py-3 px-4 rounded-top-start">Job Name</th>
                      <th className="text-muted border-0 py-3">Status</th>
                      <th className="text-muted border-0 py-3">Created At</th>
                      <th className="text-muted border-0 py-3 text-end px-4 rounded-top-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={4} className="text-center py-4">Loading jobs...</td></tr>
                    )}
                    {!loading && jobs.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">No jobs found.</td></tr>
                    )}
                    {!loading && jobs.map((job: any) => (
                      <tr key={job.id} onClick={() => handleRowClick(job.id)} style={{ cursor: "pointer" }}>
                        <td className="fw-semibold py-4 px-4 border-bottom-0">{job.name}</td>
                        <td className={`py-4 border-bottom-0 fw-medium ${job.is_active ? 'text-success' : 'text-warning'}`}>
                          {job.is_active ? 'Active' : 'Stopped'}
                        </td>
                        <td className="text-secondary py-4 border-bottom-0">{new Date(job.created_at).toLocaleString()}</td>
                        <td className="text-end py-4 px-4 border-bottom-0">
                          {job.is_active ? (
                            <button 
                              className="btn btn-sm btn-outline-warning rounded-pill px-3 fw-medium me-2"
                              onClick={(e) => handleStop(e, job.id)}
                            >
                              Stop
                            </button>
                          ) : (
                            <button 
                              className="btn btn-sm btn-outline-success rounded-pill px-3 fw-medium me-2"
                              onClick={(e) => handleActivate(e, job.id)}
                            >
                              Activate
                            </button>
                          )}
                          <Link 
                            href={`/EditJob/${job.id}`} 
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium me-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium"
                            onClick={(e) => handleDelete(e, job.id)}
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
