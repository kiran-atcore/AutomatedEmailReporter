"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
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
    if (!id) return;
    const fetchData = async () => {
      try {
        const [dsRes, tplRes, schRes, jobRes] = await Promise.all([
          api.get("/reports/datasources/"),
          api.get("/reports/templates/"),
          api.get("/reports/schedules/"),
          api.get(`/reports/jobs/${id}/`)
        ]);
        setDataSources(dsRes.data);
        setTemplates(tplRes.data);
        setSchedules(schRes.data);
        
        setFormData({
          name: jobRes.data.name || "",
          data_source: jobRes.data.data_source || "",
          template: jobRes.data.template || "",
          schedule: jobRes.data.schedule || "",
        });
      } catch (err) {
        console.error("Failed to fetch job data", err);
        showAlert("Failed to fetch job data", "error");
      } finally {
        setFetchingOptions(false);
      }
    };
    fetchData();
  }, [id, showAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/reports/jobs/${id}/`, {
        name: formData.name,
        data_source: formData.data_source,
        template: formData.template,
        schedule: formData.schedule
      });
      router.push("/TotalJobsList");
    } catch (err) {
      console.error("Failed to update job", err);
      showAlert("Failed to update job.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-4 p-md-5 position-relative overflow-hidden"
              style={{ 
                background: "rgba(10, 10, 12, 0.6)", 
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                borderRadius: "24px"
              }}
            >
              {/* Background ambient glow */}
              <motion.div 
                className="position-absolute top-0 end-0"
                style={{ width: "300px", height: "300px", background: "var(--theme-accent)", filter: "blur(100px)", borderRadius: "50%", opacity: 0.1 }}
                animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="mb-5 position-relative z-1 d-flex align-items-center gap-3">
                <Link href="/TotalJobsList" className="premium-back-btn">
                  <i className="bi bi-arrow-left"></i>
                </Link>
                <div>
                  <h3 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2rem", letterSpacing: "0.5px" }}>Edit Job</h3>
                  <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>Update your data source, template, or delivery schedule.</p>
                </div>
              </div>

              <div className="position-relative z-1">
                {fetchingOptions ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-white-50">Loading job data...</div>
                  </div>
                ) : (
                  <motion.form 
                    onSubmit={handleSubmit}
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {/* Job Details */}
                    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
                      <h5 className="fw-bold mb-3 text-white-50 border-bottom border-secondary border-opacity-25 pb-2 d-flex align-items-center gap-2">
                        <span className="badge rounded-circle bg-secondary bg-opacity-25 text-white p-2 d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px", fontSize: "12px" }}>1</span> Job Details
                      </h5>
                      <div className="mb-4 p-4 rounded-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <label className="premium-label d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-briefcase"></i> Job Name
                        </label>
                        <input 
                          type="text" 
                          className="form-control premium-input" 
                          placeholder="e.g., Weekly Sales Summary" 
                          required 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </motion.div>

                    {/* Data & Template Configuration */}
                    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
                      <h5 className="fw-bold mb-3 text-white-50 border-bottom border-secondary border-opacity-25 pb-2 d-flex align-items-center gap-2 mt-4">
                        <span className="badge rounded-circle bg-secondary bg-opacity-25 text-white p-2 d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px", fontSize: "12px" }}>2</span> Data & Template
                      </h5>
                      <div className="row g-4 mb-4 p-4 rounded-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="col-md-6">
                          <label className="premium-label d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-database"></i> Data Source
                          </label>
                          <select 
                            className="form-select premium-input" 
                            required
                            value={formData.data_source}
                            onChange={(e) => setFormData({...formData, data_source: e.target.value})}
                          >
                            <option value="" style={{ color: "black" }}>Select a Data Source...</option>
                            {dataSources.map((ds: any) => (
                              <option key={ds.id} value={ds.id} style={{ color: "black" }}>{ds.name} ({ds.connection_type})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="premium-label d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-file-earmark-richtext"></i> Report Template
                          </label>
                          <select 
                            className="form-select premium-input" 
                            required
                            value={formData.template}
                            onChange={(e) => setFormData({...formData, template: e.target.value})}
                          >
                            <option value="" style={{ color: "black" }}>Select a Template...</option>
                            {templates.map((tpl: any) => (
                              <option key={tpl.id} value={tpl.id} style={{ color: "black" }}>{tpl.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>

                    {/* Scheduling & Delivery */}
                    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
                      <h5 className="fw-bold mb-3 text-white-50 border-bottom border-secondary border-opacity-25 pb-2 d-flex align-items-center gap-2 mt-4">
                        <span className="badge rounded-circle bg-secondary bg-opacity-25 text-white p-2 d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px", fontSize: "12px" }}>3</span> Scheduling
                      </h5>
                      <div className="mb-5 p-4 rounded-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <label className="premium-label d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-calendar-event"></i> Distribution Schedule
                        </label>
                        <select 
                          className="form-select premium-input" 
                          required
                          value={formData.schedule}
                          onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                        >
                          <option value="" style={{ color: "black" }}>Select a saved schedule...</option>
                          {schedules.map((sch: any) => (
                            <option key={sch.id} value={sch.id} style={{ color: "black" }}>{sch.name} - {sch.frequency} at {sch.time_of_day}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>

                    {/* Submit Actions */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.2 } } }} className="d-flex flex-column flex-md-row justify-content-md-end gap-3 pt-4 border-top border-secondary border-opacity-25">
                      <div className="btn-responsive-wrap">
                        <Link href="/TotalJobsList" className="btn btn-responsive premium-cancel-btn px-4 py-3 text-decoration-none shadow-sm">
                          Cancel
                        </Link>
                      </div>
                      <div className="btn-responsive-wrap">
                        <button 
                          type="submit" 
                          className="btn btn-responsive premium-submit-btn px-5 py-3 shadow gap-3"
                          disabled={loading}
                        >
                          {loading ? (
                             <><span className="spinner-border spinner-border-sm"></span> Saving...</>
                          ) : (
                             <><i className="bi bi-check2-circle fs-5"></i> Save Changes</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
  );
}
