"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    layout: "Grid",
    header_text: "",
    css_overrides: "",
    has_chart: false,
    chart_type: "bar",
    email_subject: "",
    email_body_html: "",
    enable_ai_summary: false,
    ai_prompt: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reports/templates/", formData);
      router.push("/Templates");
    } catch (err) {
      console.error("Failed to save template", err);
      showAlert("Failed to save template.", "Error");
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
          <Link href="/Templates" className="btn btn-outline-light btn-sm rounded-pill px-3">
            Back to Templates
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
                <h3 className="fw-bold" style={{ color: "#1e3c72" }}>Design New Template</h3>
                <p className="text-muted">Define the structure and layout for your automated PDFs.</p>
              </div>

              <div className="card-body p-4 p-md-5 pt-3">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Template Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g., Monthly Executive Summary" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Layout Type</label>
                    <div className="d-flex gap-3 mt-2">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="layout" 
                          id="layout1" 
                          value="Grid"
                          checked={formData.layout === "Grid"}
                          onChange={(e) => setFormData({...formData, layout: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="layout1">Grid (Tables & Charts)</label>
                      </div>
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="layout" 
                          id="layout2" 
                          value="Document"
                          checked={formData.layout === "Document"}
                          onChange={(e) => setFormData({...formData, layout: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor="layout2">Document (Text Heavy)</label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Header Text</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Company Name - Confidential" 
                      value={formData.header_text}
                      onChange={(e) => setFormData({...formData, header_text: e.target.value})}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Visualizations</label>
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="hasChartToggle"
                        checked={formData.has_chart}
                        onChange={(e) => setFormData({...formData, has_chart: e.target.checked})}
                      />
                      <label className="form-check-label" htmlFor="hasChartToggle">
                        Automatically extract numerical data and embed a chart
                      </label>
                    </div>
                    
                    {formData.has_chart && (
                      <div className="p-3 bg-light rounded-3 border">
                        <label className="form-label fw-medium text-muted small">Select Chart Type</label>
                        <select 
                          className="form-select"
                          value={formData.chart_type}
                          onChange={(e) => setFormData({...formData, chart_type: e.target.value})}
                        >
                          <option value="bar">Bar Chart (Comparisons)</option>
                          <option value="pie">Pie Chart (Proportions)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">AI Intelligence</label>
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="enableAiToggle"
                        checked={formData.enable_ai_summary}
                        onChange={(e) => setFormData({...formData, enable_ai_summary: e.target.checked})}
                      />
                      <label className="form-check-label" htmlFor="enableAiToggle">
                        Generate an AI Executive Summary using Groq
                      </label>
                    </div>
                    
                    {formData.enable_ai_summary && (
                      <div className="p-3 bg-light rounded-3 border">
                        <label className="form-label fw-medium text-muted small">Custom AI Prompt (Optional)</label>
                        <textarea 
                          className="form-control font-monospace text-muted" 
                          rows={3} 
                          placeholder="e.g. Focus on highlighting anomalies and identifying trends..."
                          value={formData.ai_prompt}
                          onChange={(e) => setFormData({...formData, ai_prompt: e.target.value})}
                          style={{ fontSize: "0.85rem" }}
                        ></textarea>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Email Branding</label>
                    <div className="p-4 bg-light rounded-3 border">
                      <div className="mb-3">
                        <label className="form-label fw-medium text-muted small">Custom Email Subject</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Your {{ frequency }} report for {{ job_name }} is ready!" 
                          value={formData.email_subject}
                          onChange={(e) => setFormData({...formData, email_subject: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="form-label fw-medium text-muted small">Custom Email HTML Body</label>
                        <textarea 
                          className="form-control font-monospace text-muted" 
                          rows={4} 
                          placeholder="<h1>Hello,</h1><p>Here is your {{ job_name }} report.</p>"
                          value={formData.email_body_html}
                          onChange={(e) => setFormData({...formData, email_body_html: e.target.value})}
                          style={{ fontSize: "0.85rem" }}
                        ></textarea>
                        <div className="form-text small mt-2">
                          Available variables: <code>{'{{ job_name }}'}</code>, <code>{'{{ frequency }}'}</code>, <code>{'{{ date }}'}</code>, <code>{'{{ time }}'}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="form-label fw-semibold">CSS Overrides (Optional)</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="body { font-family: Arial; }"
                      value={formData.css_overrides}
                      onChange={(e) => setFormData({...formData, css_overrides: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-3">
                    <Link href="/Templates" className="btn btn-light border rounded-pill px-4">
                      Cancel
                    </Link>
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill px-5 shadow-sm"
                      style={{ background: "#2a5298", border: "none" }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Template"}
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
