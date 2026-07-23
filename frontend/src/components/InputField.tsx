import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === 'password';
    const currentType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="form-group mb-3 position-relative">
        <label className="premium-label text-nowrap" style={{ color: 'var(--theme-accent)' }}>
          <i className={`bi ${icon || 'bi-chevron-right'}`}></i> {label}
        </label>
        <motion.div
          whileTap={{ scale: 0.995 }}
          className="position-relative"
        >
          <input
            ref={ref}
            type={currentType}
            className={`form-control theme-input ${error ? 'is-invalid' : ''} ${className}`}
            style={{
               backgroundColor: 'rgba(15, 15, 15, 0.8)',
               border: `1px solid ${error ? '#ef4444' : 'var(--theme-border)'}`,
               color: 'white',
               padding: '0.8rem 1rem',
               paddingRight: isPassword ? '2.5rem' : '1rem',
               borderRadius: '10px',
               boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
               transition: 'all 0.3s ease',
               ...props.style
            }}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="position-absolute border-0 bg-transparent"
              style={{
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: showPassword ? 'var(--theme-accent)' : 'rgba(255,255,255,0.4)',
                zIndex: 10,
                outline: 'none',
                padding: '0',
                transition: 'color 0.2s',
              }}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} fs-5`}></i>
            </button>
          )}
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
