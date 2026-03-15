"use client";

import { motion } from "motion/react";

const statusConfig: Record<string, { color: string; pulse: boolean }> = {
  live:       { color: "var(--color-gold)",        pulse: true },
  idle:       { color: "var(--color-ash)",         pulse: false },
  thinking:   { color: "var(--color-teal-light)",  pulse: true },
  victory:    { color: "var(--color-gold-light)",  pulse: false },
  bankrupt:   { color: "var(--color-red-bright)",  pulse: false },
  battling:   { color: "var(--color-amber)",       pulse: true },
  breeding:   { color: "var(--color-sage-light)",  pulse: true },
  resting:    { color: "var(--color-ash)",         pulse: false },
  training:   { color: "var(--color-teal-light)",  pulse: true },
  eliminated: { color: "var(--color-red-bright)",  pulse: false },
};

export type AgentStatus = keyof typeof statusConfig;

export interface StatusBadgeProps {
  status: AgentStatus;
  /** Optional size variant */
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { color: "var(--color-stone)", pulse: false };
  const dotSize = size === "md" ? 10 : 8;
  const fontSize = size === "md" ? 11 : 9;

  return (
    <span
      className={`mono ${className ?? ""}`}
      style={{
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
        fontSize,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: config.color,
      }}
    >
      {config.pulse ? (
        <motion.span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 99,
            background: config.color,
            boxShadow: `0 0 8px ${config.color}`,
            display: "inline-block",
          }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 99,
            background: config.color,
            boxShadow: `0 0 8px ${config.color}`,
            display: "inline-block",
          }}
        />
      )}
      {status}
    </span>
  );
}
