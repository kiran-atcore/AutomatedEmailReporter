"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axios";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/InputField";
import MainButton from "@/components/MainButton";

const requestSchema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
});

const resetSchema = yup.object().shape({
  otp: yup.string().length(6, "OTP must be exactly 6 digits").required("OTP is required"),
  new_password: yup.string().min(6, "Password must be at least 6 characters").required("New password is required"),
  confirm_password: yup.string().oneOf([yup.ref('new_password')], 'Passwords must match').required('Confirm Password is required'),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Flow state
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  
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

  const requestForm = useForm({
    resolver: yupResolver(requestSchema),
  });

  const resetForm = useForm({
    resolver: yupResolver(resetSchema),
  });

  const onRequestSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await axiosInstance.post("/auth/forgot-password/", { email: data.email });
      setEmail(data.email);
      setStep(2);
      setAttempts(0);
      setResendTimer(60);
      setExpireTimer(240);
      setIsExpired(false);
      setSuccessMsg(`We've sent a 6-digit code to ${data.email}.`);
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred while requesting the reset code.");
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: any) => {
    if (isExpired) {
      setError("OTP has expired. Please request a new one.");
      return;
    }
    if (attempts >= 3) {
      setError("Maximum attempts reached. Please request a new reset code.");
      setStep(1);
      setAttempts(0);
      resetForm.setValue("otp", "");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
        await axiosInstance.post("/auth/reset-password/", {
            email: email,
            otp: data.otp,
            new_password: data.new_password
        });
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
            router.push("/login");
        }, 2000);
    } catch (err: any) {
        setAttempts(prev => prev + 1);
        const remaining = 2 - attempts;
        if (remaining <= 0) {
           setError("Maximum attempts reached. Please request a new reset code.");
           setStep(1);
           setAttempts(0);
           resetForm.setValue("otp", "");
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
      await axiosInstance.post("/auth/forgot-password/", { email });
      setResendTimer(60);
      setExpireTimer(240);
      setIsExpired(false);
      setAttempts(0);
      setSuccessMsg(`A new code has been sent to ${email}.`);
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            background: "linear-gradient(135deg, rgba(255,87,34,0.15) 0%, rgba(220,53,69,0.05) 100%)",
            border: "1px solid rgba(255,87,34,0.2)",
            boxShadow: "0 10px 25px -5px rgba(255,87,34,0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
          }}
        >
          <div className="position-absolute w-100 h-100 rounded-4" style={{ background: "radial-gradient(circle at top right, rgba(255,87,34,0.2) 0%, transparent 60%)", pointerEvents: "none" }}></div>
          <i className={step === 1 ? "bi bi-shield-lock-fill fs-2" : "bi bi-key-fill fs-2"} style={{ color: "var(--theme-accent)", filter: "drop-shadow(0 2px 5px rgba(255,87,34,0.3))" }}></i>
        </div>
        <h2 
          className="font-weight-bold mb-2" 
          style={{ 
            fontFamily: "var(--font-righteous)",
            color: "var(--theme-accent)",
            letterSpacing: "1px"
          }}
        >
          {step === 1 ? "Reset Password" : "New Password"}
        </h2>
        <p className="theme-text-muted" style={{ fontSize: "0.95rem" }}>
          {step === 1 ? "Enter your email to receive a reset code." : "Enter the OTP code and your new password."}
        </p>
        
        {step === 2 && (
          <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
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
          </div>
        )}
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
            <form key="request-form" onSubmit={requestForm.handleSubmit(onRequestSubmit)}>
              <motion.div variants={itemVariants}>
                <InputField
                  label="Email address"
                  type="email"
                  placeholder="Enter your email"
                  icon="bi-envelope"
                  error={requestForm.formState.errors.email?.message as string}
                  {...requestForm.register("email")}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mt-5">
                <MainButton
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  className="w-100 py-3 rounded-pill"
                >
                  <i className={loading ? "bi bi-hourglass-split me-2" : "bi bi-send me-2"}></i>
                  {loading ? "SENDING..." : "SEND CODE"}
                </MainButton>
              </motion.div>
            </form>
          ) : (
            <form key="reset-form" onSubmit={resetForm.handleSubmit(onResetSubmit)}>
              <motion.div variants={itemVariants}>
                <InputField
                  label="Verification Code (OTP)"
                  type="text"
                  placeholder="123456"
                  icon="bi-shield-lock"
                  maxLength={6}
                  error={resetForm.formState.errors.otp?.message as string}
                  {...resetForm.register("otp")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <InputField
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  icon="bi-lock"
                  error={resetForm.formState.errors.new_password?.message as string}
                  {...resetForm.register("new_password")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <InputField
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  icon="bi-shield-check"
                  error={resetForm.formState.errors.confirm_password?.message as string}
                  {...resetForm.register("confirm_password")}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mt-5">
                <MainButton
                  type="submit"
                  disabled={loading || isExpired || attempts >= 3}
                  isLoading={loading}
                  className="w-100 py-3 rounded-pill"
                >
                  <i className={loading ? "bi bi-hourglass-split me-2" : "bi bi-check-circle me-2"}></i>
                  {loading ? "RESETTING..." : "RESET PASSWORD"}
                </MainButton>
              </motion.div>
            </form>
          )}

          <motion.div variants={itemVariants} className="mt-4 text-center">
            <span className="theme-text-muted" style={{ fontSize: "0.85rem" }}>
              Remember your password?{" "}
              <Link 
                href="/login" 
                className="fw-bold ms-2 text-decoration-none" 
                style={{ color: "var(--theme-accent)", borderBottom: "1px solid var(--theme-accent)" }}
              >
                Sign in here
              </Link>
            </span>
          </motion.div>
    </motion.div>
  );
}
