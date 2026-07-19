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
    frequency: "",
    time_of_day: "",
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
          <Link href="/Scheduler" className="btn btn-outline-light btn-sm rounded-pill px-3">
            Back to Scheduler
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
                <h3 className="fw-bold" style={{ color: "#1e3c72" }}>Create New Schedule</h3>
                <p className="text-muted">Set up the timing rules and distribution list.</p>
              </div>

              <div className="card-body p-4 p-md-5 pt-3">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Schedule Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g., Morning Executive Brief" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Frequency</label>
                      <select 
                        className="form-select" 
                        required
                        value={formData.frequency}
                        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      >
                        <option value="">Select frequency...</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="cron">Custom Cron</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Time of Day (UTC)</label>
                      <input 
                        type="time" 
                        className="form-control" 
                        required 
                        value={formData.time_of_day}
                        onChange={(e) => setFormData({...formData, time_of_day: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="form-label fw-semibold">Distribution List (Emails)</label>
                    <div className="p-2 border rounded-3 bg-white d-flex flex-wrap gap-2 align-items-center mb-2" style={{ minHeight: "45px" }}>
                      {emails.map((email, idx) => (
                        <span key={idx} className="badge bg-primary rounded-pill d-flex align-items-center gap-1 py-2 px-3 fw-normal" style={{ fontSize: "0.9rem" }}>
                          {email}
                          <button 
                            type="button" 
                            className="btn-close btn-close-white ms-1" 
                            style={{ fontSize: "0.5rem" }} 
                            onClick={() => removeEmail(idx)}
                            aria-label="Remove"
                          ></button>
                        </span>
                      ))}
                      <input 
                        type="email" 
                        className="form-control border-0 p-0 shadow-none flex-grow-1"
                        style={{ minWidth: "150px" }}
                        placeholder={emails.length === 0 ? "Enter email and press Enter..." : "Add another..."}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={handleEmailKeyDown}
                      />
                    </div>
                    <div className="form-text">Press Enter or Comma to add an email. PDF will be generated and attached.</div>
                  </div>

                  <div className="d-flex justify-content-end gap-3">
                    <Link href="/Scheduler" className="btn btn-light border rounded-pill px-4">
                      Cancel
                    </Link>
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill px-5 shadow-sm"
                      style={{ background: "#2a5298", border: "none" }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Schedule"}
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
