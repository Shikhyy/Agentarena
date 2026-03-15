"use client";

import { motion, AnimatePresence } from "motion/react";

export interface ZKLockIconProps {
  locked: boolean;
  txHash?: string;
  /** Optional callback when the badge is clicked */
  onClick?: () => void;
  className?: string;
}

export function ZKLockIcon({ locked, txHash, onClick, className }: ZKLockIconProps) {
  const color = locked ? "var(--color-gold)" : "var(--color-stone)";

  return (
    <motion.div
      className={`mono ${className ?? ""}`}
      title={txHash || "No transaction"}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color,
        border: `1px solid ${locked ? "var(--color-gold)" : "var(--color-border)"}`,
        borderRadius: 999,
        padding: "5px 10px",
        fontSize: 11,
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
      }}
      whileHover={onClick ? { scale: 1.04 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
    >
      {/* Lock/unlock icon */}
      <AnimatePresence mode="wait">
        {locked ? (
          <motion.svg
            key="locked"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </motion.svg>
        ) : (
          <motion.svg
            key="unlocked"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={locked ? "lock" : "open"}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {locked ? "ZK LOCK" : "OPEN"}
        </motion.span>
      </AnimatePresence>

      {/* Glow for locked state */}
      {locked && (
        <motion.span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            boxShadow: "0 0 12px rgba(255,190,0,0.25)",
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
