"use client";

import React from "react";
import { motion } from "motion/react";

const skillColors: Record<string, string> = {
  risk:  "var(--color-red-bright)",
  tempo: "var(--color-gold)",
  bluff: "var(--color-teal-light)",
  econ:  "var(--color-gold)",
};

export interface SkillOrbProps {
  skillType: string;
  equipped?: boolean;
  /** Skill level 0–100 for conic progress ring (optional) */
  level?: number;
  /** Callback when orb is clicked */
  onClick?: () => void;
  className?: string;
}

export const SkillOrb: React.FC<SkillOrbProps> = ({
  skillType,
  equipped = false,
  level,
  onClick,
  className,
}) => {
  const color = skillColors[skillType] ?? "var(--color-gold)";
  const showProgress = level !== undefined && level > 0;
  const pct = Math.min(100, Math.max(0, level ?? 0));

  return (
    <motion.button
      type="button"
      title={skillType}
      onClick={onClick}
      className={className}
      style={{
        position: "relative",
        width: 44,
        height: 44,
        borderRadius: 999,
        border: `1.5px solid ${equipped ? color : "var(--color-border)"}`,
        background: equipped
          ? `radial-gradient(circle, ${color}22 0%, rgba(12,12,40,0.92) 70%)`
          : "rgba(12,12,40,0.84)",
        color: equipped ? color : "var(--color-stone)",
        boxShadow: equipped ? `0 0 14px ${color}44` : "none",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        overflow: "visible",
        padding: 0,
      }}
      whileHover={{ scale: 1.12, boxShadow: `0 0 20px ${color}55` }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {/* Conic progress ring */}
      {showProgress && (
        <svg
          viewBox="0 0 44 44"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={`${(pct / 100) * 125.66} 125.66`}
            strokeLinecap="round"
            opacity={0.6}
          />
        </svg>
      )}

      {/* Label */}
      <span style={{ position: "relative", zIndex: 1 }}>
        {skillType.slice(0, 2).toUpperCase()}
      </span>
    </motion.button>
  );
}
