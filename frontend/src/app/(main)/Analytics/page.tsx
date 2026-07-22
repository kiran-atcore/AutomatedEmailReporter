"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/services/axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { useAlert } from "@/components/AlertModal";

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    pieData: {name: string, value: number}[];
    lineData: {date: string, jobs: number}[];
    barData: {name: string, jobs: number}[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = useAlert();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/reports/analytics/");
      setData(response.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="container py-5 text-center">Loading Analytics...</div>;
  }

  const handleClearAnalytics = async () => {
    if (!(await showConfirm("Are you sure you want to clear your Analytics data? Your underlying reports will not be deleted."))) return;
    try {
      await api.post("/reports/analytics/clear/");
      // Refetch from server to ensure Recharts gets properly formatted empty data (like the 7-day zeroed array)
      await fetchAnalytics();
    } catch (err) {
      console.error("Failed to clear analytics", err);
      showAlert("Failed to clear analytics data.", "Error");
    }
  };

  const PIE_COLORS = ["#28a745", "#dc3545"]; // Green for Success, Red for Failed

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
            style={{ background: "rgba(255,87,34,0.1)", border: "1px solid rgba(255,87,34,0.2)" }}
          >
            <div className="spinner-grow spinner-grow-sm" style={{ color: "var(--theme-accent)", width: "10px", height: "10px" }} role="status" />
            <span style={{ color: "var(--theme-accent)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>LIVE INSIGHTS</span>
          </motion.div>
          <h2 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.5rem" }}>
            Analytics Command Center
          </h2>
          <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>A high-level view of your reporting infrastructure.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(220,53,69,0.4)" }}
          whileTap={{ scale: 0.95 }}
          className="btn rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, rgba(220,53,69,0.9) 0%, rgba(220,53,69,0.5) 100%)", border: "1px solid rgba(220,53,69,0.5)", backdropFilter: "blur(5px)" }}
          onClick={handleClearAnalytics}
        >
          <i className="bi bi-trash3"></i>
          Reset Data
        </motion.button>
      </motion.div>

      <motion.div 
        className="row g-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
          {/* Area Chart */}
          <motion.div className="col-12" variants={itemVariants}>
            <div className="theme-card p-4 h-100 position-relative overflow-hidden" style={{ background: "rgba(21, 21, 21, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", borderRadius: "20px" }}>
              <h5 className="fw-bold mb-4 position-relative z-1 d-flex align-items-center gap-2" style={{ color: "var(--theme-accent)" }}>
                <i className="bi bi-activity"></i> Execution Volume (Last 7 Days)
              </h5>
              <div style={{ width: '100%', height: 320 }} className="position-relative z-1">
                <ResponsiveContainer>
                  <AreaChart data={data?.lineData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-accent)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--theme-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#6c757d" tick={{ fill: '#6c757d', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis allowDecimals={false} stroke="#6c757d" tick={{ fill: '#6c757d', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(10px)', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: 'var(--theme-accent)', fontWeight: 'bold' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="jobs" stroke="var(--theme-accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorJobs)" activeDot={{ r: 8, strokeWidth: 3, stroke: "rgba(21,21,21,1)", fill: "var(--theme-accent)", filter: "drop-shadow(0 0 8px var(--theme-accent))" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div className="col-lg-6" variants={itemVariants}>
            <div className="theme-card p-4 h-100 position-relative overflow-hidden" style={{ background: "rgba(21, 21, 21, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", borderRadius: "20px" }}>
              <h5 className="fw-bold mb-2 position-relative z-1 d-flex align-items-center gap-2" style={{ color: "var(--theme-accent)" }}>
                <i className="bi bi-check-circle"></i> Success vs Failure Rate
              </h5>
              <div style={{ width: '100%', height: 300 }} className="position-relative z-1">
                <ResponsiveContainer>
                  <PieChart>
                    <defs>
                       <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                         <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" />
                       </filter>
                    </defs>
                    <Pie
                      data={data?.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="rgba(21,21,21,1)"
                      strokeWidth={3}
                      label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                      style={{ fontSize: "11px", fontWeight: 500, fill: "#e4e4e7" }}
                    >
                      {data?.pieData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} filter="url(#shadow)" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(10px)', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} itemStyle={{ fontWeight: 'bold' }} />
                    <Legend wrapperStyle={{ color: 'white', paddingTop: '20px', fontWeight: 500 }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div className="col-lg-6" variants={itemVariants}>
            <div className="theme-card p-4 h-100 position-relative overflow-hidden" style={{ background: "rgba(21, 21, 21, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", borderRadius: "20px" }}>
              <h5 className="fw-bold mb-4 position-relative z-1 d-flex align-items-center gap-2" style={{ color: "var(--theme-accent)" }}>
                <i className="bi bi-database"></i> Most Active Data Sources
              </h5>
              <div style={{ width: '100%', height: 300 }} className="position-relative z-1">
                <ResponsiveContainer>
                  <BarChart data={data?.barData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="4 4" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" allowDecimals={false} stroke="#6c757d" tick={{ fill: '#6c757d', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={80} stroke="#6c757d" tick={{ fill: '#e4e4e7', fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(10px)', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} itemStyle={{ color: 'var(--theme-accent)', fontWeight: 'bold' }} />
                    <Bar dataKey="jobs" fill="var(--theme-accent)" radius={[0, 8, 8, 0]} barSize={24} activeBar={{ fill: '#ff8a65', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
}
