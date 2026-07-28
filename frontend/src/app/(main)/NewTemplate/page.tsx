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

  const [templateData, setTemplateData] = useState({
    name: "",
    layout: "Grid",
    header_text: "",
    css_overrides: "/* Custom Email Styles */\n.report-wrapper {\n  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;\n}\n.report-header h2 {\n  letter-spacing: 1px;\n  text-transform: uppercase;\n  font-weight: 700;\n}\n.report-body p {\n  font-size: 15px;\n  color: #4a5568;\n}\n.report-body b {\n  color: #2d3748;\n}",
    has_chart: false,
    chart_type: "bar",
    email_subject: "Automated Report: {{ job_name }} [{{ date }}]",
    email_body_html: "<h3>Hello,</h3><p>Please find attached the latest <b>{{ job_name }}</b> report.</p><p>This report has been automatically generated and securely delivered to you via our automated reporting system.</p><p><b>Generated on:</b> {{ date }} at {{ time }}<br/><b>Frequency:</b> {{ frequency }}</p><p>Best regards,<br/><i>Automated Reporting Team</i></p>",
    enable_ai_summary: false,
    ai_prompt: "",
    branding_color: "#1e3c72"
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(templateData).forEach(([key, value]) => {
        fd.append(key, typeof value === 'boolean' ? (value ? 'true' : 'false') : value);
      });
      if (logoFile) {
        fd.append('branding_logo', logoFile);
      }
      
      await api.post("/reports/templates/", fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      router.push("/Templates");
    } catch (err) {
      console.error("Failed to save template", err);
      showAlert("Failed to save template.", "Error");
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
                style={{ width: "400px", height: "400px", background: "var(--theme-accent)", filter: "blur(120px)", borderRadius: "50%", opacity: 0.1 }}
                animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="mb-5 position-relative z-1 d-flex align-items-center gap-3">
                <Link href="/Templates" className="premium-back-btn">
                  <i className="bi bi-arrow-left"></i>
                </Link>
                <div>
                  <h3 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2rem", letterSpacing: "0.5px" }}>Design New Template</h3>
                  <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>Define the structure and layout for your automated PDFs.</p>
                </div>
              </div>

              <motion.div 
                className="position-relative z-1"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
                }}
                initial="hidden"
                animate="show"
              >
                <form onSubmit={handleSubmit}>
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-file-earmark-richtext"></i> Template Name
                    </label>
                    <input 
                      type="text" 
                      className="form-control premium-input" 
                      placeholder="e.g., Monthly Executive Summary" 
                      required 
                      value={templateData.name}
                      onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                    />
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-palette"></i> Visual Branding
                    </label>
                    <div className="p-4 rounded-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="premium-label fw-medium small mb-2">Brand Color</label>
                          <div className="d-flex align-items-center gap-3">
                            <div className="position-relative" style={{ width: "40px", height: "40px", borderRadius: "10px", overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)" }}>
                              <input 
                                type="color" 
                                className="w-100 h-100 p-0 border-0 position-absolute top-0 start-0" 
                                value={templateData.branding_color}
                                onChange={(e) => setTemplateData({...templateData, branding_color: e.target.value})}
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                            <span className="text-white font-monospace">{templateData.branding_color}</span>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="premium-label fw-medium small mb-2">Brand Logo</label>
                          <input 
                            type="file" 
                            className="form-control premium-input" 
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                          {logoPreview && (
                            <div className="mt-3 text-center p-2 rounded-3 position-relative" style={{ background: "rgba(0,0,0,0.3)", border: "1px dashed rgba(255,255,255,0.2)" }}>
                              <img src={logoPreview} alt="Preview" style={{ maxHeight: "60px", maxWidth: "100%", objectFit: "contain" }} />
                              <button 
                                type="button" 
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center" 
                                style={{ width: "24px", height: "24px", padding: 0 }}
                                onClick={() => {
                                  setLogoFile(null);
                                  setLogoPreview(null);
                                }}
                                title="Remove Logo"
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-layout-text-window"></i> Layout Type
                    </label>
                    <div className="d-flex gap-3 mt-2">
                      <div className="form-check custom-radio">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="layout" 
                          id="layout1" 
                          value="Grid"
                          checked={templateData.layout === "Grid"}
                          onChange={(e) => setTemplateData({...templateData, layout: e.target.value})}
                        />
                        <label className="form-check-label text-white" htmlFor="layout1">Grid (Tables & Charts)</label>
                      </div>
                      <div className="form-check custom-radio">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="layout" 
                          id="layout2" 
                          value="Document"
                          checked={templateData.layout === "Document"}
                          onChange={(e) => setTemplateData({...templateData, layout: e.target.value})}
                        />
                        <label className="form-check-label text-white" htmlFor="layout2">Document (Text Heavy)</label>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-fonts"></i> Header Text
                    </label>
                    <input 
                      type="text" 
                      className="form-control premium-input" 
                      placeholder="Company Name - Confidential" 
                      value={templateData.header_text}
                      onChange={(e) => setTemplateData({...templateData, header_text: e.target.value})}
                    />
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-bar-chart-line"></i> Visualizations
                    </label>
                    <div className="form-check form-switch mb-3 custom-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="hasChartToggle"
                        checked={templateData.has_chart}
                        onChange={(e) => setTemplateData({...templateData, has_chart: e.target.checked})}
                        style={{ cursor: "pointer" }}
                      />
                      <label className="form-check-label text-white" htmlFor="hasChartToggle" style={{ cursor: "pointer" }}>
                        Automatically extract numerical data and embed a chart
                      </label>
                    </div>
                    
                    {templateData.has_chart && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 rounded-4 mt-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <label className="premium-label fw-medium small mb-2">Select Chart Type</label>
                        <select 
                          className="form-select premium-input"
                          value={templateData.chart_type}
                          onChange={(e) => setTemplateData({...templateData, chart_type: e.target.value})}
                        >
                          <option value="bar" style={{ color: "black" }}>Bar Chart (Comparisons)</option>
                          <option value="pie" style={{ color: "black" }}>Pie Chart (Proportions)</option>
                        </select>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-robot"></i> AI Intelligence
                    </label>
                    <div className="form-check form-switch mb-3 custom-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="enableAiToggle"
                        checked={templateData.enable_ai_summary}
                        onChange={(e) => setTemplateData({...templateData, enable_ai_summary: e.target.checked})}
                        style={{ cursor: "pointer" }}
                      />
                      <label className="form-check-label text-white" htmlFor="enableAiToggle" style={{ cursor: "pointer" }}>
                        Generate an AI Executive Summary using Groq
                      </label>
                    </div>
                    
                    {templateData.enable_ai_summary && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 rounded-4 mt-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <label className="premium-label fw-medium small mb-2">Custom AI Prompt <span className="badge bg-secondary bg-opacity-25 ms-1">Optional</span></label>
                        <textarea 
                          className="form-control premium-input font-monospace" 
                          rows={3} 
                          placeholder="e.g. Focus on highlighting anomalies and identifying trends..."
                          value={templateData.ai_prompt}
                          onChange={(e) => setTemplateData({...templateData, ai_prompt: e.target.value})}
                        ></textarea>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-envelope-paper"></i> Custom Email Template
                    </label>
                    <div className="p-4 rounded-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="mb-4">
                        <label className="premium-label fw-medium small mb-2">Email Subject</label>
                        <input 
                          type="text" 
                          className="form-control premium-input" 
                          placeholder="Your {{ frequency }} report for {{ job_name }} is ready!" 
                          value={templateData.email_subject}
                          onChange={(e) => setTemplateData({...templateData, email_subject: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="premium-label fw-medium small mb-2">Email HTML Body</label>
                        <textarea 
                          className="form-control premium-input font-monospace" 
                          rows={4} 
                          placeholder="<h1>Hello,</h1><p>Here is your {{ job_name }} report.</p>"
                          value={templateData.email_body_html}
                          onChange={(e) => setTemplateData({...templateData, email_body_html: e.target.value})}
                        ></textarea>
                        <div className="form-text text-white-50 small mt-2 d-flex gap-2 align-items-center">
                          <i className="bi bi-info-circle"></i>
                          <span>Available variables: <code>{'{{ job_name }}'}</code>, <code>{'{{ frequency }}'}</code>, <code>{'{{ date }}'}</code>, <code>{'{{ time }}'}</code></span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-5">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-code-slash"></i> CSS Overrides <span className="badge bg-secondary bg-opacity-25 text-white-50 ms-2">Optional</span>
                    </label>
                    <textarea 
                      className="form-control premium-input font-monospace" 
                      rows={3} 
                      placeholder="body { font-family: Arial; }"
                      value={templateData.css_overrides}
                      onChange={(e) => setTemplateData({...templateData, css_overrides: e.target.value})}
                    ></textarea>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.3 } } }} className="d-flex flex-column flex-md-row justify-content-md-end gap-3 pt-4 border-top border-secondary border-opacity-25">
                    <div className="btn-responsive-wrap">
                      <Link href="/Templates" className="btn btn-responsive premium-cancel-btn px-4 py-3 text-decoration-none shadow-sm">
                        Cancel
                      </Link>
                    </div>
                    <div className="btn-responsive-wrap">
                      <button 
                        type="submit" 
                        className="btn btn-responsive premium-submit-btn px-4 py-3 shadow gap-3"
                        disabled={loading}
                      >
                        {loading ? (
                           <><span className="spinner-border spinner-border-sm"></span> Saving...</>
                        ) : (
                           <><i className="bi bi-check2-circle fs-5"></i> Save Template</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
  );
}
