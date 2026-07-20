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
    // Return a fallback that mimics native behavior in case it's called outside the provider during transitions
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
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%', maxWidth: '450px', padding: '0 1rem' }}
            >
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header border-bottom-0 bg-white pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold" style={{ color: "#1e3c72" }}>{title}</h5>
                  {type === "alert" && (
                    <button type="button" className="btn-close" onClick={() => handleClose(true)}></button>
                  )}
                </div>
                <div className="card-body py-4 px-4 text-secondary fs-6">
                  {message}
                </div>
                <div className="card-footer border-top-0 bg-white pb-4 px-4 d-flex justify-content-end gap-2">
                  {type === "confirm" && (
                    <button 
                      type="button" 
                      className="btn btn-light rounded-pill px-4 fw-medium" 
                      onClick={() => handleClose(false)}
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="button" 
                    className={`btn ${type === 'confirm' ? 'btn-danger' : 'btn-primary'} rounded-pill px-4 fw-medium shadow-sm`}
                    onClick={() => handleClose(true)}
                  >
                    {type === "confirm" ? "Confirm" : "OK"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
