import React from 'react';
import { motion } from 'framer-motion';

interface SearchSortProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortOrder: 'latest' | 'oldest';
  setSortOrder: (val: 'latest' | 'oldest') => void;
}

export default function SearchSort({ searchQuery, setSearchQuery, sortOrder, setSortOrder }: SearchSortProps) {
  return (
    <div className="d-flex flex-column flex-sm-row gap-3 mb-4 px-1">
      {/* Premium Search Input */}
      <div className="position-relative flex-grow-1">
        <i 
          className="bi bi-search position-absolute z-1" 
          style={{ 
            top: "50%", 
            transform: "translateY(-50%)", 
            left: "1rem", 
            fontSize: "0.95rem", 
            color: "var(--theme-text-secondary)", 
            transition: "color 0.3s",
            pointerEvents: "none"
          }}
        />
        <input 
          type="text" 
          className="form-control text-white py-2 shadow-none w-100"
          placeholder="Search logs by name or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: "2.5rem",
            background: "rgba(21, 21, 21, 0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "0.85rem",
            backdropFilter: "blur(10px)",
            color: "#fff",
            transition: "all 0.3s ease",
            outline: "none",
            height: "46px"
          }}
          onFocus={(e) => {
             e.currentTarget.style.background = "rgba(255,255,255,0.03)";
             e.currentTarget.style.border = "1px solid var(--theme-accent)";
             e.currentTarget.style.boxShadow = "0 0 15px rgba(255,87,34,0.15)";
             if (e.currentTarget.previousElementSibling) {
                (e.currentTarget.previousElementSibling as HTMLElement).style.color = "var(--theme-accent)";
             }
          }}
          onBlur={(e) => {
             e.currentTarget.style.background = "rgba(21, 21, 21, 0.4)";
             e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
             e.currentTarget.style.boxShadow = "none";
             if (e.currentTarget.previousElementSibling) {
                (e.currentTarget.previousElementSibling as HTMLElement).style.color = "var(--theme-text-secondary)";
             }
          }}
        />
      </div>

      {/* Premium Sort Toggle Button (Replaces ugly native select) */}
      <motion.button
        whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.15)" }}
        whileTap={{ scale: 0.98 }}
        className="btn d-flex align-items-center justify-content-center gap-2 flex-shrink-0 px-4 py-2"
        onClick={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
        style={{
          background: "rgba(21, 21, 21, 0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          color: "var(--theme-text-secondary)",
          fontSize: "0.85rem",
          fontWeight: 600,
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease",
          height: "46px"
        }}
      >
        <motion.i 
          className={`bi ${sortOrder === 'latest' ? 'bi-sort-down-alt' : 'bi-sort-up'} fs-5`} 
          style={{ color: "var(--theme-accent)" }}
          key={sortOrder}
          initial={{ rotate: 180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        />
        <span style={{ letterSpacing: "0.3px" }}>
          {sortOrder === 'latest' ? 'Latest First' : 'Oldest First'}
        </span>
      </motion.button>
    </div>
  );
}
