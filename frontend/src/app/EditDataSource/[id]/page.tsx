"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function EditSourcePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    connection_type: "",
    endpoint: "",
    auth_token: ""
  });

  useEffect(() => {
    if (!id) return;
    const fetchSource = async () => {
      try {
        const response = await api.get(`/reports/datasources/${id}/`);
        setFormData({
          name: response.data.name || "",
          connection_type: response.data.connection_type || "",
          endpoint: response.data.endpoint || "",
          auth_token: response.data.auth_token || ""
        });
      } catch (err) {
        console.error("Failed to load data source", err);
        showAlert("Failed to load data source details.", "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchSource();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/reports/datasources/${id}/`, formData);
      router.push("/DataSources");
    } catch (err) {
      console.error("Failed to update data source", err);
      showAlert("Failed to save changes.", "Error");
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      await api.post(`/reports/datasources/${id}/test_connection/`, formData);
      showAlert("Connection successful!", "Success");
    } catch (err) {
      console.error(err);
      showAlert("Connection failed. Check your configuration.", "Error");
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
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
          <Link href="/DataSources" className="btn btn-outline-light btn-sm rounded-pill px-3">
            Back to Data Sources
          </Link>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
            >
              <div className="card-header bg-white border-0 pt-4 pb-0 px-4 px-md-5">
                <h3 className="fw-bold" style={{ color: "#1e3c72" }}>Edit Data Source</h3>
                <p className="text-muted">Update the connection to your external data provider.</p>
              </div>

              <div className="card-body p-4 p-md-5 pt-3">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Source Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g., Production PostgreSQL" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Connection Type</label>
                    <select 
                      className="form-select" 
                      required
                      value={formData.connection_type}
                      onChange={(e) => setFormData({...formData, connection_type: e.target.value})}
                    >
                      <option value="">Select a type...</option>
                      <option value="rest">REST API</option>
                      <option value="graphql">GraphQL API</option>
                      <option value="sql">SQL Database</option>
                      <option value="csv">Static CSV URL</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Endpoint / Connection String</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://api.example.com/v1/data" 
                      required 
                      value={formData.endpoint}
                      onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                    />
                  </div>

                  <div className="mb-5">
                    <label className="form-label fw-semibold">Authentication (Optional)</label>
                    <input 
                      type="password" 
                      className="form-control mb-2" 
                      placeholder="Bearer Token or API Key" 
                      value={formData.auth_token}
                      onChange={(e) => setFormData({...formData, auth_token: e.target.value})}
                    />
                    <div className="form-text">Leave blank to keep existing, or enter a new token to update.</div>
                  </div>

                  <div className="d-flex justify-content-end gap-3">
                    <Link href="/DataSources" className="btn btn-light border rounded-pill px-4">
                      Cancel
                    </Link>
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill px-5 shadow-sm"
                      style={{ background: "#2a5298", border: "none" }}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
