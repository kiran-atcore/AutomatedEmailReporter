"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function NewSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingCron, setGeneratingCron] = useState(false);
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    frequency: "daily",
    time_of_day: "",
    timezone: "UTC",
    recipients: "",
    cron_expression: "",
  });

  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = emailInput.trim();
      if (val && !emails.includes(val)) {
        // basic email validation
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (isValid) {
          setEmails([...emails, val]);
          setEmailInput("");
        } else {
          showAlert("Please enter a valid email address", "Validation Error");
        }
      }
    }
  };

  const removeEmail = (indexToRemove: number) => {
    setEmails(emails.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerateCron = async () => {
    if (!aiPrompt) {
      showAlert("Please enter a prompt first.", "Error");
      return;
    }
    setGeneratingCron(true);
    try {
      const response = await api.post("/reports/schedules/generate_cron/", {
        prompt: aiPrompt
      });
      setFormData({...formData, cron_expression: response.data.cron });
      setAiMode(false);
    } catch (err: any) {
      console.error(err);
      showAlert(err.response?.data?.message || "Failed to generate cron.", "Error");
    } finally {
      setGeneratingCron(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emails.length === 0) {
      showAlert("Please add at least one recipient email.", "Validation Error");
      return;
    }
    if (formData.frequency === "cron" && !formData.cron_expression) {
      showAlert("Please enter a custom cron expression.", "Validation Error");
      return;
    }
    if (formData.frequency !== "cron" && !formData.time_of_day) {
      showAlert("Please select a time of day.", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        recipients: emails.join(',')
      };
      // Clear irrelevant fields based on frequency
      if (payload.frequency === 'cron') {
        payload.time_of_day = null as any;
      } else {
        payload.cron_expression = "";
      }
      
      await api.post("/reports/schedules/", payload);
      router.push("/Scheduler");
    } catch (err) {
      console.error("Failed to create schedule", err);
      showAlert("Failed to save schedule.", "Error");
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
                <Link href="/Scheduler" className="premium-back-btn">
                  <i className="bi bi-arrow-left"></i>
                </Link>
                <div>
                  <h3 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2rem", letterSpacing: "0.5px" }}>Create New Schedule</h3>
                  <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>Set up the timing rules and distribution list.</p>
                </div>
              </div>

              <motion.div 
                className="position-relative z-1"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                animate="show"
              >
                <form onSubmit={handleSubmit}>
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="mb-4">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-clock-history"></i> Schedule Name
                    </label>
                    <input 
                      type="text" 
                      className="form-control premium-input" 
                      placeholder="e.g., Morning Executive Brief" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="row g-4 mb-4">
                    <div className="col-12 col-md-4">
                      <label className="premium-label d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-arrow-repeat"></i> Frequency
                      </label>
                      <select 
                        className="form-select premium-input" 
                        required
                        value={formData.frequency}
                        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      >
                        <option value="" style={{ color: "black" }}>Select frequency...</option>
                        <option value="hourly" style={{ color: "black" }}>Hourly</option>
                        <option value="daily" style={{ color: "black" }}>Daily</option>
                        <option value="weekly" style={{ color: "black" }}>Weekly</option>
                        <option value="monthly" style={{ color: "black" }}>Monthly</option>
                        <option value="cron" style={{ color: "black" }}>Custom Cron</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      {formData.frequency === 'cron' ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="premium-label mb-0">
                              <i className="bi bi-terminal"></i> Cron Expression
                            </label>
                            <div className="d-flex p-1 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)" }}>
                              <button 
                                type="button" 
                                className="btn btn-sm border-0 rounded-pill px-3 fw-bold"
                                style={{ 
                                  background: !aiMode ? "rgba(255,255,255,0.1)" : "transparent",
                                  color: !aiMode ? "white" : "rgba(255,255,255,0.4)",
                                  transition: "all 0.3s ease",
                                  boxShadow: !aiMode ? "0 2px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)" : "none",
                                  fontSize: "0.75rem"
                                }} 
                                onClick={() => setAiMode(false)}
                              >
                                Manual
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-sm border-0 rounded-pill px-3 fw-bold d-flex align-items-center gap-1" 
                                style={{ 
                                  background: aiMode ? "linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)" : "transparent",
                                  color: aiMode ? "white" : "rgba(255,255,255,0.4)",
                                  transition: "all 0.3s ease",
                                  boxShadow: aiMode ? "0 4px 15px rgba(255, 87, 34, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)" : "none",
                                  fontSize: "0.75rem"
                                }}
                                onClick={() => setAiMode(true)}
                              >
                                <i className="bi bi-stars" style={{ color: aiMode ? "#ffccbc" : "inherit" }}></i> AI Assist
                              </button>
                            </div>
                          </div>
                          
                          {aiMode ? (
                            <motion.div 
                              initial={{ opacity: 0, height: 0, y: -10 }} 
                              animate={{ opacity: 1, height: "auto", y: 0 }} 
                              className="p-4 rounded-4 position-relative overflow-hidden mb-3" 
                              style={{ 
                                background: "linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(255, 138, 101, 0.05) 100%)", 
                                border: "1px solid rgba(255, 87, 34, 0.3)",
                                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.2)",
                                backdropFilter: "blur(10px)"
                              }}
                            >
                              <div className="position-relative z-1">
                                <label className="text-white fw-semibold mb-3 d-flex align-items-center gap-2" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>
                                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "24px", height: "24px", background: "rgba(255, 87, 34, 0.2)", color: "#ffccbc" }}>
                                    <i className="bi bi-chat-left-dots-fill" style={{ fontSize: "0.7rem" }}></i>
                                  </div>
                                  Describe your schedule
                                </label>
                                <div className="d-flex flex-column gap-3">
                                  <textarea 
                                    className="form-control premium-input shadow-inner flex-grow-1" 
                                    rows={2}
                                    placeholder="e.g., Every weekday at 5pm..." 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    style={{ 
                                      background: "rgba(0,0,0,0.2)", 
                                      border: "1px solid rgba(255, 87, 34, 0.4)",
                                      color: "white"
                                    }}
                                  />
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    type="button" 
                                    className="btn text-white fw-bold shadow-sm px-4 py-2 d-flex align-items-center justify-content-center"
                                    style={{ 
                                      background: "linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)",
                                      border: "none",
                                      boxShadow: "0 4px 15px rgba(255, 87, 34, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)",
                                      whiteSpace: "nowrap"
                                    }}
                                    onClick={handleGenerateCron}
                                    disabled={generatingCron || !aiPrompt}
                                  >
                                    {generatingCron ? (
                                      <><span className="spinner-border spinner-border-sm me-2"></span> Generating...</>
                                    ) : (
                                      <><i className="bi bi-magic me-2"></i> Generate Cron</>
                                    )}
                                  </motion.button>
                                </div>
                                <div className="mt-3 text-white-50 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
                                  <i className="bi bi-info-circle-fill" style={{ color: "var(--theme-accent)" }}></i>
                                  <span>AI will overwrite any manually entered cron above.</span>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <input 
                              type="text" 
                              className="form-control premium-input" 
                              placeholder="* * * * *" 
                              required={formData.frequency === 'cron'}
                              value={formData.cron_expression}
                              onChange={(e) => setFormData({...formData, cron_expression: e.target.value})}
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <label className="premium-label d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-alarm"></i> TIME
                          </label>
                          <input 
                            type="time" 
                            className="form-control premium-input" 
                            required 
                            value={formData.time_of_day}
                            onChange={(e) => setFormData({...formData, time_of_day: e.target.value})}
                          />
                        </>
                      )}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="premium-label d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-globe"></i> Timezone
                      </label>
                      <select
                        className="form-select premium-input"
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      >
                        <option value="UTC" style={{ color: "black" }}>UTC</option>
                        <option value="Asia/Kolkata" style={{ color: "black" }}>Asia/Kolkata</option>
                        <option value="America/New_York" style={{ color: "black" }}>America/New_York</option>
                        <option value="America/Chicago" style={{ color: "black" }}>America/Chicago</option>
                        <option value="America/Los_Angeles" style={{ color: "black" }}>America/Los_Angeles</option>
                        <option value="Europe/London" style={{ color: "black" }}>Europe/London</option>
                        <option value="Europe/Paris" style={{ color: "black" }}>Europe/Paris</option>
                        <option value="Asia/Tokyo" style={{ color: "black" }}>Asia/Tokyo</option>
                        <option value="Australia/Sydney" style={{ color: "black" }}>Australia/Sydney</option>
                      </select>
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }} className="col-12 mb-5">
                    <label className="premium-label d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-people"></i> Distribution List (Emails)
                    </label>
                    <div className="premium-input p-3 rounded-4 d-flex flex-wrap gap-2 align-items-center mb-2" style={{ minHeight: "55px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}>
                      {emails.map((email, idx) => (
                        <motion.span 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          key={idx} 
                          className="badge rounded-pill d-flex align-items-center gap-2 py-2 px-3 fw-normal shadow-sm" 
                          style={{ fontSize: "0.9rem", background: "var(--theme-accent)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                        >
                          <i className="bi bi-person-fill"></i>
                          {email}
                          <button 
                            type="button" 
                            className="btn-close btn-close-white ms-1" 
                            style={{ fontSize: "0.55rem" }} 
                            onClick={() => removeEmail(idx)}
                            aria-label="Remove"
                          ></button>
                        </motion.span>
                      ))}
                      <input 
                        type="email" 
                        className="form-control border-0 p-0 shadow-none flex-grow-1 bg-transparent text-white"
                        style={{ minWidth: "150px" }}
                        placeholder={emails.length === 0 ? "Enter email and press Enter..." : "Add another..."}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={handleEmailKeyDown}
                      />
                    </div>
                    <div className="form-text text-white-50 d-flex align-items-center gap-1">
                      <i className="bi bi-info-circle"></i> Press Enter or Comma to add an email. PDF will be generated and attached.
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.2 } } }} className="d-flex flex-column flex-md-row justify-content-md-end gap-3 pt-4 border-top border-secondary border-opacity-25">
                    <div className="btn-responsive-wrap">
                      <Link href="/Scheduler" className="btn btn-responsive premium-cancel-btn px-4 py-3 text-decoration-none shadow-sm">
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
                           <><i className="bi bi-check2-circle fs-5"></i> Save Schedule</>
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
