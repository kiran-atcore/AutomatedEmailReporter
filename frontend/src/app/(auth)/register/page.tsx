"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axios";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/InputField";
import MainButton from "@/components/MainButton";

const registerSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
});

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    const { confirmPassword, ...apiData } = data;

    try {
      const response = await axiosInstance.post("/auth/register/", apiData);
      if (response.data.access) {
          localStorage.setItem("access", response.data.access);
          localStorage.setItem("refresh", response.data.refresh);
      }
      router.push("/Dashboard");
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
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
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
          {/* Subtle glossy sweep */}
          <div className="position-absolute top-0 start-0 w-100 h-50" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)" }} />
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
        </div>
        <h2 
          className="font-weight-bold mb-2" 
          style={{ 
            fontFamily: "var(--font-righteous)",
            background: "linear-gradient(135deg, #fff 0%, #aaa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px"
          }}
        >
          Create Account
        </h2>
        <p className="theme-text-muted" style={{ fontSize: "0.95rem" }}>Join us and start automating your reports.</p>
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
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div variants={itemVariants}>
          <InputField
            label="Username"
            type="text"
            placeholder="Choose a username"
            error={errors.username?.message as string}
            {...register("username")}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Email address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message as string}
            {...register("email")}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <InputField
            label="Password"
            type="password"
            placeholder="Create a password"
            error={errors.password?.message as string}
            {...register("password")}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message as string}
            {...register("confirmPassword")}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 pt-2">
          <MainButton type="submit" isLoading={loading}>
            Create Account
          </MainButton>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-5">
          <span className="theme-text-muted" style={{ fontSize: "0.85rem" }}>
            Already have an account? 
            <Link 
              href="/login" 
              className="fw-bold ms-2 text-decoration-none"
              style={{ color: "var(--theme-accent)", borderBottom: "1px solid var(--theme-accent)" }}
            >
              Login here
            </Link>
          </span>
        </motion.div>
      </form>
    </motion.div>
  );
}
