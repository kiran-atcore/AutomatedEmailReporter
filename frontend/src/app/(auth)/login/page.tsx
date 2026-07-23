"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/services/axios";
import GoogleButton from "@/components/GoogleButton";
import { motion, AnimatePresence, Variants } from "framer-motion";
import InputField from "@/components/InputField";
import MainButton from "@/components/MainButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login/", { email, password });
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      router.push("/Dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
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
      setError("Google sign in failed.");
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
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="url(#loginGlow)" viewBox="0 0 16 16" className="position-relative z-1">
            <defs>
              <linearGradient id="loginGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="100%" stopColor="var(--theme-accent)" />
              </linearGradient>
            </defs>
            <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z" />
            <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
          </svg>
        </div>
        <h2 
          className="font-weight-bold mb-2" 
          style={{ 
            fontFamily: "var(--font-righteous)",
            color: "var(--theme-accent)",
            letterSpacing: "1px"
          }}
        >
          Welcome Back
        </h2>
        <p className="theme-text-muted" style={{ fontSize: "0.95rem" }}>Sign in to continue to Dispatchr.</p>
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
      </AnimatePresence>
      
      <form onSubmit={handleSubmit}>
        <motion.div variants={itemVariants}>
          <InputField
            label="Email address"
            type="email"
            placeholder="Enter your email"
            icon="bi-envelope"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon="bi-lock"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <div className="text-end mb-4" style={{ marginTop: "-10px" }}>
            <Link 
              href="/forgot-password" 
              className="text-decoration-none small"
              style={{ color: "var(--theme-accent)" }}
            >
              Forgot Password?
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 pt-2">
          <MainButton type="submit" isLoading={loading} disabled={loading} className="w-100 py-3 rounded-pill">
            <i className={loading ? "bi bi-hourglass-split me-2" : "bi bi-box-arrow-in-right me-2"}></i>
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </MainButton>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-4 text-center">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.1)" }}></div>
            <span className="text-white-50 small">OR</span>
            <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.1)" }}></div>
          </div>
          
          <div className="d-flex justify-content-center mb-4">
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              isLoading={loading}
            />
          </div>

          <span className="theme-text-muted" style={{ fontSize: "0.85rem" }}>
            Don't have an account?{" "}
            <Link 
              href="/register" 
              className="fw-bold ms-2 text-decoration-none" 
              style={{ color: "var(--theme-accent)", borderBottom: "1px solid var(--theme-accent)" }}
            >
              Sign up here
            </Link>
          </span>
        </motion.div>
      </form>
    </motion.div>
  );
}
