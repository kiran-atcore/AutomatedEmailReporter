import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface MainButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export default function MainButton({ children, isLoading, className = '', disabled, ...props }: MainButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`btn theme-btn-primary w-100 position-relative overflow-hidden ${className}`}
      disabled={disabled || isLoading}
      style={{
        borderRadius: '10px',
        padding: '0.85rem 1.5rem',
        fontWeight: 600,
        letterSpacing: '0.5px',
        background: 'linear-gradient(135deg, #ff7b00, #ff4500)',
        border: 'none',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(255, 69, 0, 0.3)',
        ...props.style
      }}
      {...props}
    >
      {isLoading ? (
        <div className="d-flex align-items-center justify-content-center gap-2">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Please wait...</span>
        </div>
      ) : (
        children
      )}
      
      {/* Cool shine effect overlay */}
      {!disabled && !isLoading && (
        <motion.div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transform: 'translateX(-100%)'
          }}
          initial={{ transform: 'translateX(-100%)' }}
          whileHover={{ transform: 'translateX(100%)', transition: { duration: 0.6, ease: "easeInOut" } }}
        />
      )}
    </motion.button>
  );
}
