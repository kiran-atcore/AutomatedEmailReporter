import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="form-group mb-3 position-relative">
        <label className="text-white-50 mb-2 fw-medium" style={{ fontSize: '0.9rem' }}>{label}</label>
        <motion.div
          whileTap={{ scale: 0.995 }}
          className="position-relative"
        >
          <input
            ref={ref}
            className={`form-control theme-input ${error ? 'is-invalid' : ''} ${className}`}
            style={{
               backgroundColor: 'rgba(15, 15, 15, 0.8)',
               border: `1px solid ${error ? '#ef4444' : 'var(--theme-border)'}`,
               color: 'white',
               padding: '0.8rem 1rem',
               borderRadius: '10px',
               boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
               transition: 'all 0.3s ease',
               ...props.style
            }}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="invalid-feedback d-block mt-1"
            style={{ color: '#ef4444', fontSize: '0.85rem' }}
          >
            {error}
          </motion.div>
        )}
      </div>
    );
  }
);
InputField.displayName = 'InputField';
export default InputField;
