"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const { showAlert } = useAlert();

  // Options from API
  const [dataSources, setDataSources] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    data_source: "",
    template: "",
    schedule: "",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dsRes, tplRes, schRes] = await Promise.all([
          api.get("/reports/datasources/"),
          api.get("/reports/templates/"),
          api.get("/reports/schedules/")
        ]);
        setDataSources(dsRes.data);
        setTemplates(tplRes.data);
        setSchedules(schRes.data);
      } catch (err) {
        console.error("Failed to fetch options", err);
      } finally {
        setFetchingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reports/jobs/", {
        name: formData.name,
        data_source: formData.data_source,
        template: formData.template,
        schedule: formData.schedule,
        is_active: true
      });
      router.push("/Dashboard");
    } catch (err) {
      console.error("Failed to create job", err);
      showAlert("Failed to create job.", "Error");
      setLoading(false);
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
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
            >
              <div className="card-header bg-white border-0 pt-4 pb-0 px-4 px-md-5">
                <h3 className="fw-bold" style={{ color: "#1e3c72" }}>Create New Job</h3>
                <p className="text-muted">Configure your data source, template, and delivery schedule.</p>
              </div>

              <div className="card-body p-4 p-md-5 pt-3">
                {fetchingOptions ? (
                  <div className="text-center py-5">Loading available options...</div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Job Details */}
                    <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">1. Job Details</h5>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Job Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., Weekly Sales Summary" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>

                    {/* Data & Template Configuration */}
                    <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">2. Data & Template</h5>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Data Source</label>
                        <select 
                          className="form-select" 
                          required
                          value={formData.data_source}
                          onChange={(e) => setFormData({...formData, data_source: e.target.value})}
                        >
                          <option value="">Select a Data Source...</option>
                          {dataSources.map((ds: any) => (
                            <option key={ds.id} value={ds.id}>{ds.name} ({ds.connection_type})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Report Template</label>
                        <select 
                          className="form-select" 
                          required
                          value={formData.template}
                          onChange={(e) => setFormData({...formData, template: e.target.value})}
                        >
                          <option value="">Select a Template...</option>
                          {templates.map((tpl: any) => (
                            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Scheduling & Delivery */}
                    <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">3. Scheduling</h5>
                    <div className="mb-5">
                      <label className="form-label fw-semibold">Distribution Schedule</label>
                      <select 
                        className="form-select" 
                        required
                        value={formData.schedule}
                        onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                      >
                        <option value="">Select a saved schedule...</option>
                        {schedules.map((sch: any) => (
                          <option key={sch.id} value={sch.id}>{sch.name} - {sch.frequency} at {sch.time_of_day}</option>
                        ))}
                      </select>
                    </div>

                    {/* Submit Actions */}
                    <div className="d-flex justify-content-end gap-3">
                      <Link href="/Dashboard" className="btn btn-light border rounded-pill px-4">
                        Cancel
                      </Link>
                      <button 
                        type="submit" 
                        className="btn btn-primary rounded-pill px-5 shadow-sm"
                        style={{ background: "#2a5298", border: "none" }}
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Job"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
