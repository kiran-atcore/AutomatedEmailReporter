import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LogoName({ disableRouting = false }: { disableRouting?: boolean }) {
    const router = useRouter();
    return (
        <div className="d-flex align-items-center gap-2" style={{ userSelect: "none" }}>
            {/* Icon: Dynamic abstract sending/paper-plane graphic */}
            <motion.div
                onClick={() => !disableRouting && router.push('/Dashboard')}
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="rounded d-flex align-items-center justify-content-center position-relative overflow-hidden shadow-sm"
                style={{
                    width: "30px",
                    height: "30px",
                    background: "linear-gradient(135deg, var(--theme-accent) 0%, #ff8a65 100%)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    cursor: disableRouting ? "default" : "pointer"
                }}
            >
                {/* Subtle inner shine for 3D effect */}
                <div
                    className="position-absolute top-0 start-0 w-100 h-50"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)" }}
                />

                {/* Custom "D" + Envelope/Send Arrow Logo */}
                <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="position-relative z-1"
                >
                    {/* Outer 'D' shape */}
                    <path d="M6 3h7a9 9 0 0 1 0 18H6Z" />
                    {/* Inner envelope flap / Forward arrow */}
                    <path d="M6 3l9 9-9 9" />
                    {/* Data payload dot */}
                    <circle cx="18" cy="12" r="1.5" fill="white" stroke="none" />
                </svg>
            </motion.div>

            {/* Name */}
            <div className="d-flex flex-column justify-content-center">
                <span
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="m-0 lh-1 text-white"
                    style={{
                        fontSize: "1.125rem",
                        letterSpacing: "1.5px",
                        fontFamily: "var(--font-righteous), sans-serif",
                        cursor: "pointer"
                    }}
                >
                    Dispatch<span style={{ color: "var(--theme-accent)" }}>R</span>
                </span>
            </div>
        </div>
    );
}
