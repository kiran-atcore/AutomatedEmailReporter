"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AlertType = "alert" | "confirm";

interface AlertContextProps {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    return {
      showAlert: (msg: string) => window.alert(msg),
      showConfirm: async (msg: string) => window.confirm(msg)
    };
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AlertType>("alert");
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const showAlert = (msg: string, customTitle = "Alert") => {
    setMessage(msg);
    setTitle(customTitle);
    setType("alert");
    setIsOpen(true);
  };

  const showConfirm = (msg: string, customTitle = "Confirm Action") => {
    setMessage(msg);
    setTitle(customTitle);
    setType("confirm");
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(result);

    // Clear out state after animation finishes
    setTimeout(() => {
      setResolvePromise(undefined);
    }, 300);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div
            style={{
              zIndex: 1050,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ width: '100%', maxWidth: '420px', padding: '0 1rem' }}
            >
              <div
                className="position-relative overflow-hidden rounded-4 shadow-lg"
                style={{
                  background: "rgba(21, 21, 21, 0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(20px)"
                }}
              >
                {/* Accent Top Border */}
                <div
                  className="position-absolute top-0 start-0 w-100"
                  style={{ height: "4px", background: type === "confirm" ? "var(--theme-accent)" : "#4facfe" }}
                />

                <div className="p-4 pt-5">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{
                        width: "48px", height: "48px",
                        background: type === "confirm" ? "rgba(255,87,34,0.15)" : "rgba(79,172,254,0.15)",
                        color: type === "confirm" ? "var(--theme-accent)" : "#4facfe",
                        border: `1px solid ${type === "confirm" ? "rgba(255,87,34,0.2)" : "rgba(79,172,254,0.2)"}`
                      }}
                    >
                      <i className={`bi ${type === "confirm" ? "bi-exclamation-triangle" : "bi-info-circle"} fs-4`}></i>
                    </div>
                    <h5 className="mb-0 fw-bold text-white" style={{ letterSpacing: "-0.5px" }}>
                      {title}
                    </h5>
                  </div>

                  <p className="theme-text-muted mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                    {message}
                  </p>

                  <div className="d-flex justify-content-end gap-3 mt-5">
                    {type === "confirm" && (
                      <motion.button
                        whileHover={{ background: "rgba(255,255,255,0.08)" }}
                        whileTap={{ scale: 0.95 }}
                        className="btn rounded-pill px-4 fw-medium border-0"
                        style={{ color: "var(--theme-text-secondary)", background: "rgba(255,255,255,0.03)", transition: "all 0.2s" }}
                        onClick={() => handleClose(false)}
                      >
                        Cancel
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: type === "confirm" ? "0 0 15px rgba(220,53,69,0.4)" : "0 0 15px rgba(79,172,254,0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="btn rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: type === "confirm" ? "rgba(220,53,69,0.15)" : "rgba(79,172,254,0.15)",
                        color: type === "confirm" ? "#ff4d4d" : "#4facfe",
                        border: `1px solid ${type === "confirm" ? "rgba(220,53,69,0.3)" : "rgba(79,172,254,0.3)"}`,
                        transition: "all 0.3s"
                      }}
                      onClick={() => handleClose(true)}
                    >
                      <span>{type === "confirm" ? "Confirm" : "Understood"}</span>
                      <i className={`bi ${type === "confirm" ? "bi-check-lg" : "bi-arrow-right"}`}></i>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
