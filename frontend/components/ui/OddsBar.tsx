"use client";

import { motion } from "motion/react";

export interface OddsBarProps {
  a: number;
  b: number;
  leftLabel: string;
  rightLabel: string;
  /** Show percentage values next to labels */
  showPercent?: boolean;
  /** Height of the bar in px (default 8) */
  height?: number;
  className?: string;
}

export function OddsBar({
  a,
  b,
  leftLabel,
  rightLabel,
  showPercent = false,
  height = 8,
  className,
}: OddsBarProps) {
  const total = Math.max(1, a + b);
  const leftPct = (a / total) * 100;
  const rightPct = 100 - leftPct;

  return (
    <div className={className}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          marginBottom: 6,
        }}
      >
        <span style={{ color: "var(--color-gold)" }}>
          {leftLabel}
          {showPercent && (
            <span style={{ opacity: 0.7, marginLeft: 4 }}>{leftPct.toFixed(0)}%</span>
          )}
        </span>
        <span style={{ color: "var(--color-teal-light)" }}>
          {showPercent && (
            <span style={{ opacity: 0.7, marginRight: 4 }}>{rightPct.toFixed(0)}%</span>
          )}
          {rightLabel}
        </span>
      </div>
      <div
        style={{
          height,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          display: "flex",
        }}
      >
        <motion.div
          style={{
            background: "var(--color-gold)",
            boxShadow: "var(--shadow-gold)",
          }}
          animate={{ width: `${leftPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <motion.div
          style={{
            background: "var(--color-teal-light)",
            boxShadow: "var(--shadow-teal)",
          }}
          animate={{ width: `${rightPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
