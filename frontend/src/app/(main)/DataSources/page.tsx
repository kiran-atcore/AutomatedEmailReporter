"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function DataSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();

  const fetchSources = async () => {
    try {
      const response = await api.get("/reports/datasources/");
      setSources(response.data);
    } catch (err) {
      console.error("Failed to load data sources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!(await showConfirm("Are you sure you want to delete this Data Source?"))) return;
    try {
      await api.delete(`/reports/datasources/${id}/`);
      fetchSources();
    } catch (err) {
      console.error("Failed to delete source", err);
      showAlert("Failed to delete data source. It might be used by a Job.", "Error");
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
          <h2 className="fw-bold" style={{ color: "#1e3c72" }}>Data Sources</h2>
          <Link href="/NewSource" className="btn btn-primary shadow-sm rounded-pill px-4 text-decoration-none" style={{ background: "#2a5298", border: "none" }}>
            + Add New Source
          </Link>
        </div>

        <p className="text-muted mb-4">Connect your external APIs, databases, or scrapers here.</p>

        {loading ? (
          <div className="text-center py-5">Loading data sources...</div>
        ) : sources.length === 0 ? (
          <div className="text-center py-5 card border-0 shadow-sm rounded-4">
            <h5 className="text-muted mb-3">No data sources connected yet.</h5>
            <Link href="/NewSource" className="btn btn-outline-primary rounded-pill px-4">Connect your first source</Link>
          </div>
        ) : (
          <div className="row g-4">
            {sources.map((source: any) => (
              <div key={source.id} className="col-md-6 col-lg-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="card border-0 shadow-sm rounded-4 h-100 p-4"
                  style={{ background: "white" }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold mb-0" style={{ color: "#1e3c72" }}>{source.name}</h5>
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                      Connected
                    </span>
                  </div>
                  <p className="text-secondary small mb-3">
                    <strong>Type:</strong> <span className="text-uppercase">{source.connection_type}</span><br/>
                    <strong>Endpoint:</strong> {source.endpoint}
                  </p>
                  <div className="mt-auto pt-3 border-top d-flex gap-2">
                    <Link href={`/EditDataSource/${source.id}`} className="btn btn-sm btn-light w-50 fw-medium text-primary rounded-pill text-decoration-none text-center">
                      Edit Settings
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger w-50 fw-medium rounded-pill"
                      onClick={(e) => handleDelete(e, source.id)}
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
