"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/services/axios";
import GoogleButton from "@/components/GoogleButton";
import { motion, AnimatePresence, Variants } from "framer-motion";
import InputField from "@/components/InputField";
import MainButton from "@/components/MainButton";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP flow state
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Security & Timer state
  const [attempts, setAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [expireTimer, setExpireTimer] = useState(240);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && (!isExpired || resendTimer > 0)) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setExpireTimer((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, isExpired, resendTimer]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    const nameParts = formData.fullName.trim().split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const apiData = {
      username: formData.email,
      email: formData.email,
      password: formData.password,
      first_name,
      last_name
    };

    try {
      const response = await axiosInstance.post("/auth/register/", apiData);
      if (response.data.requires_verification) {
        setStep(2);
        setAttempts(0);
        setResendTimer(60);
        setExpireTimer(240);
        setIsExpired(false);
        setSuccessMsg(`We've sent a 6-digit code to ${apiData.email}.`);
      } else if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        router.push("/Dashboard");
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMsg = "Registration failed";
      if (errorData) {
         const messages = Object.values(errorData).flat();
         errorMsg = messages.join(", ");
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (responseObj: any) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/google/', responseObj);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      router.push("/Dashboard");
    } catch (err: any) {
      setError("Google sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      setError("OTP has expired. Please request a new one.");
      return;
    }
    if (attempts >= 3) {
      setError("Maximum attempts reached. Please register again.");
      setStep(1);
      setAttempts(0);
      setOtp("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
        const response = await axiosInstance.post("/auth/verify-email/", {
            email: formData.email,
            otp: otp
        });
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        router.push("/Dashboard");
    } catch (err: any) {
        setAttempts(prev => prev + 1);
        const remaining = 2 - attempts;
        if (remaining <= 0) {
           setError("Maximum attempts reached. Please register again.");
           setStep(1);
           setAttempts(0);
           setOtp("");
        } else {
           setError(err.response?.data?.error || `Invalid code. ${remaining} attempts left.`);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await axiosInstance.post("/auth/resend-registration-otp/", { email: formData.email });
      setResendTimer(60);
      setExpireTimer(240);
      setIsExpired(false);
      setAttempts(0);
      setSuccessMsg(`A new code has been sent to ${formData.email}.`);
    } catch (err: any) {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-100"
    >
      <motion.div variants={itemVariants} className="text-center mb-5">
        <div 
          className="d-inline-flex align-items-center justify-content-center rounded-4 mb-4 position-relative overflow-hidden" 
          style={{ 
            width: "72px", height: "72px", 
            background: "linear-gradient(135deg, rgba(255,87,34,0.15) 0%, rgba(255,87,34,0.05) 100%)",
            border: "1px solid rgba(255,87,34,0.2)",
            boxShadow: "0 10px 30px -10px rgba(255,87,34,0.3)"
          }}
        >
          <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)" }} />
          {step === 1 ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="url(#registerGlow)" viewBox="0 0 16 16" className="position-relative z-1">
              <defs>
                <linearGradient id="registerGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="100%" stopColor="var(--theme-accent)" />
                </linearGradient>
              </defs>
              <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
              <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
            </svg>
          ) : (
            <i className="bi bi-envelope-check-fill fs-1 position-relative z-1" style={{ color: "var(--theme-accent)" }}></i>
          )}
        </div>
        <h2 
          className="font-weight-bold mb-2" 
          style={{ 
            fontFamily: "var(--font-righteous)",
            color: "var(--theme-accent)",
            letterSpacing: "1px"
          }}
        >
          {step === 1 ? "Create Account" : "Verify Email"}
        </h2>
        <p className="theme-text-muted" style={{ fontSize: "0.95rem" }}>
          {step === 1 ? "Join us and start automating your reports." : `We've sent a 6-digit code to ${formData.email}.`}
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="alert alert-danger border-0 rounded-3 mb-4"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            {error}
          </motion.div>
        )}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="alert alert-success border-0 rounded-3 mb-4"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
      
      {step === 1 ? (
        <form key="register-form" onSubmit={handleRegister}>
          <motion.div variants={itemVariants}>
            <InputField
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              icon="bi-person"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputField
              label="Email address"
              name="email"
              type="email"
              placeholder="Enter your email"
              icon="bi-envelope"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Create a password"
              icon="bi-lock"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              icon="bi-shield-check"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-4 pt-2">
            <MainButton type="submit" isLoading={loading} disabled={loading} className="w-100 py-3 rounded-pill">
              <i className={loading ? "bi bi-hourglass-split me-2" : "bi bi-arrow-right-circle me-2"}></i>
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </MainButton>
          </motion.div>
        </form>
      ) : (
        <form key="otp-form" onSubmit={handleVerifyOTP}>
          <motion.div variants={itemVariants}>
            <InputField
              label="Verification Code (OTP)"
              type="text"
              placeholder="123456"
              icon="bi-shield-lock"
              value={otp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="d-flex justify-content-between align-items-center mt-4 mb-2">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div 
                className="d-flex align-items-center px-3 py-1 rounded-pill"
                style={{ 
                  background: isExpired ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${isExpired ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                  color: isExpired ? "#ef4444" : "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.85rem",
                  boxShadow: isExpired ? "0 0 10px rgba(239, 68, 68, 0.1)" : "none",
                  transition: "all 0.3s ease"
                }}
              >
                <i className={`bi bi-stopwatch${isExpired ? '' : ''} me-2 ${isExpired ? 'text-danger' : 'text-white-50'}`}></i>
                <span className="fw-medium" style={{ fontFamily: "monospace", letterSpacing: "1px" }}>
                  {isExpired ? 'EXPIRED' : `${Math.floor(expireTimer / 60)}:${(expireTimer % 60).toString().padStart(2, '0')}`}
                </span>
              </div>

              <AnimatePresence>
                {attempts > 0 && attempts < 3 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="d-flex align-items-center px-3 py-1 rounded-pill"
                    style={{ 
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#f59e0b",
                      fontSize: "0.85rem",
                      boxShadow: "0 0 10px rgba(245, 158, 11, 0.1)"
                    }}
                  >
                    <i className="bi bi-shield-exclamation me-2"></i>
                    <span className="fw-medium">{3 - attempts} left</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button 
              whileHover={resendTimer > 0 || loading ? {} : { scale: 1.05 }}
              whileTap={resendTimer > 0 || loading ? {} : { scale: 0.95 }}
              type="button" 
              onClick={handleResendOTP} 
              disabled={resendTimer > 0 || loading}
              className="btn px-4 py-1 rounded-pill d-flex align-items-center"
              style={{ 
                background: resendTimer > 0 ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 87, 34, 0.15)",
                border: `1px solid ${resendTimer > 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 87, 34, 0.4)"}`,
                color: resendTimer > 0 ? "rgba(255, 255, 255, 0.3)" : "var(--theme-accent)",
                fontSize: "0.85rem",
                fontWeight: 600,
                boxShadow: resendTimer > 0 ? "none" : "0 0 15px rgba(255, 87, 34, 0.15)",
                transition: "all 0.3s ease",
                cursor: resendTimer > 0 || loading ? "not-allowed" : "pointer"
              }}
            >
              <i className={`bi bi-arrow-clockwise me-2 ${resendTimer > 0 ? '' : 'opacity-75'}`}></i>
              {resendTimer > 0 ? `Wait ${resendTimer}s` : "Resend"}
            </motion.button>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-4 pt-2">
            <MainButton type="submit" disabled={loading || otp.length < 6 || isExpired || attempts >= 3} isLoading={loading} className="w-100 py-3 rounded-pill">
              <i className={loading ? "bi bi-hourglass-split me-2" : "bi bi-check-circle me-2"}></i>
              {loading ? "VERIFYING..." : "VERIFY CODE"}
            </MainButton>
          </motion.div>
        </form>
      )}

      {step === 1 && (
        <motion.div variants={itemVariants} className="mt-4 text-center">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.1)" }}></div>
            <span className="text-white-50 small">OR</span>
            <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.1)" }}></div>
          </div>
          
          <div className="d-flex justify-content-center mb-4">
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Registration Failed')}
              isLoading={loading}
            />
          </div>

          <span className="theme-text-muted" style={{ fontSize: "0.85rem" }}>
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="fw-bold ms-2 text-decoration-none" 
              style={{ color: "var(--theme-accent)", borderBottom: "1px solid var(--theme-accent)" }}
            >
              Sign in here
            </Link>
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
