"use client";

import { motion } from "motion/react";

export interface BettingChipProps {
  amount: number;
  selected?: boolean;
  /** Callback when chip is clicked */
  onClick?: () => void;
  /** Disable interaction */
  disabled?: boolean;
  className?: string;
}

export function BettingChip({
  amount,
  selected,
  onClick,
  disabled,
  className,
}: BettingChipProps) {
  const color = selected ? "var(--color-gold)" : "var(--color-text)";
  const borderColor = selected ? "var(--color-gold)" : "var(--color-border)";

  return (
    <motion.button
      type="button"
      className={`mono ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 60,
        height: 60,
        borderRadius: 999,
        border: `1.5px solid ${borderColor}`,
        background: selected
          ? "radial-gradient(circle, rgba(255,190,0,0.16) 0%, rgba(19,19,53,0.72) 70%)"
          : "rgba(19,19,53,0.72)",
        color,
        boxShadow: selected ? "0 0 18px rgba(255,190,0,0.25)" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "grid",
        placeItems: "center",
        fontWeight: 600,
        fontSize: 15,
        position: "relative",
        padding: 0,
      }}
      whileHover={disabled ? undefined : { scale: 1.1, boxShadow: `0 0 22px rgba(255,190,0,0.3)` }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {/* Inner ring decoration */}
      <span
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: 999,
          border: `1px dashed ${selected ? "rgba(255,190,0,0.35)" : "rgba(255,255,255,0.08)"}`,
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{amount}</span>
    </motion.button>
  );
}
