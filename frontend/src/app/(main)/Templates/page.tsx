"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = useAlert();

  const fetchTemplates = async () => {
    try {
      const response = await api.get("/reports/templates/");
      setTemplates(response.data);
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!(await showConfirm("Are you sure you want to delete this template?"))) return;
    try {
      await api.delete(`/reports/templates/${id}/`);
      fetchTemplates();
    } catch (err) {
      console.error("Failed to delete template", err);
      showAlert("Failed to delete template. It might be used by a Job.", "Error");
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
          <h2 className="fw-bold" style={{ color: "#1e3c72" }}>Report Templates</h2>
          <Link href="/NewTemplate" className="btn btn-primary shadow-sm rounded-pill px-4 text-decoration-none" style={{ background: "#2a5298", border: "none" }}>
            + Create Template
          </Link>
        </div>

        <p className="text-muted mb-4">Design the layout and content structure of your automated PDFs.</p>

        {loading ? (
          <div className="text-center py-5">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-5 card border-0 shadow-sm rounded-4">
            <h5 className="text-muted mb-3">No templates designed yet.</h5>
            <Link href="/NewTemplate" className="btn btn-outline-primary rounded-pill px-4">Create your first template</Link>
          </div>
        ) : (
          <div className="row g-4">
            {templates.map((tpl: any) => (
              <div key={tpl.id} className="col-md-6 col-lg-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="card border-0 shadow-sm rounded-4 h-100 p-4 text-center"
                  style={{ background: "white" }}
                >
                  <div className="display-4 mb-3" style={{ color: "#4facfe" }}>
                    {tpl.layout === 'Grid' ? '📊' : '📄'}
                  </div>
                  <h5 className="fw-bold mb-2" style={{ color: "#1e3c72" }}>{tpl.name}</h5>
                  <p className="text-secondary small mb-4">
                    Layout: <strong>{tpl.layout}</strong><br/>
                    Header: {tpl.header_text || "None"}
                  </p>
                  <div className="mt-auto d-flex gap-2">
                    <Link href={`/EditTemplate/${tpl.id}`} className="btn btn-sm btn-light w-50 fw-medium text-primary rounded-pill text-decoration-none">
                      Edit
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger w-50 fw-medium rounded-pill"
                      onClick={(e) => handleDelete(e, tpl.id)}
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
