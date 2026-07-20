"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/services/axios";
import {
  LineChart,
  Line,
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

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold" style={{ color: "#1e3c72" }}>Analytics Command Center</h2>
            <p className="text-muted">A high-level view of your reporting infrastructure.</p>
          </div>
          <button 
            className="btn btn-outline-danger shadow-sm rounded-pill px-4"
            onClick={handleClearAnalytics}
          >
            Clear Analytics Data
          </button>
        </div>

        <div className="row g-4">
          {/* Line Chart */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-4" style={{ color: "#4facfe" }}>Jobs Run (Last 7 Days)</h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data?.lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="jobs" stroke="#1e3c72" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-4" style={{ color: "#4facfe" }}>Success vs Failure Rate</h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data?.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data?.pieData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-4" style={{ color: "#4facfe" }}>Most Active Data Sources</h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data?.barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#4facfe" radius={[0, 4, 4, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
