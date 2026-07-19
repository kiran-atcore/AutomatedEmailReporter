"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axios";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login/", data);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      router.push("/Dashboard"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center mb-4 font-weight-bold">Welcome Back</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group mb-3">
          <label>Email address</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register("email")}
            placeholder="Enter email"
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: errors.email ? "1px solid red" : "none" }}
          />
          {errors.email && <div className="invalid-feedback d-block text-warning">{errors.email.message as string}</div>}
        </div>
        
        <div className="form-group mb-4">
          <label>Password</label>
          <input
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            {...register("password")}
            placeholder="Password"
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: errors.password ? "1px solid red" : "none" }}
          />
          {errors.password && <div className="invalid-feedback d-block text-warning">{errors.password.message as string}</div>}
        </div>

        <button 
          type="submit" 
          className="btn btn-light w-100 mb-3" 
          disabled={loading}
          style={{ fontWeight: "bold", color: "#1e3c72" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center">
          <small>
            Don't have an account? <Link href="/register" className="text-white text-decoration-underline">Sign up</Link>
          </small>
        </div>
      </form>
    </motion.div>
  );
}
