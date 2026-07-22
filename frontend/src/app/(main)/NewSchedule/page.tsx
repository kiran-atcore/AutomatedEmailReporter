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
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    frequency: "daily",
    time_of_day: "",
    timezone: "UTC",
    recipients: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emails.length === 0) {
      showAlert("Please add at least one recipient email.", "Validation Error");
      return;
    }
    setLoading(true);
    try {
      await api.post("/reports/schedules/", {
        ...formData,
        recipients: emails.join(',')
      });
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
