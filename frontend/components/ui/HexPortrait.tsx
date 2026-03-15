"use client";

import { motion } from "motion/react";

export interface HexPortraitProps {
  name: string;
  size?: number;
  accent?: string;
  /** Optional image URL to display inside the hex. Falls back to initial letter. */
  imageUrl?: string;
  /** Show a pulsing border ring (e.g. when agent is live) */
  pulse?: boolean;
  className?: string;
}

const HEX_CLIP = "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";

export function HexPortrait({
  name,
  size = 72,
  accent = "var(--color-gold)",
  imageUrl,
  pulse = false,
  className,
}: HexPortraitProps) {
  return (
    <motion.div
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: "absolute",
          inset: -2,
          clipPath: HEX_CLIP,
          background: accent,
          opacity: 0.35,
        }}
      />

      {/* Pulse animation ring */}
      {pulse && (
        <motion.div
          style={{
            position: "absolute",
            inset: -4,
            clipPath: HEX_CLIP,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 18px ${accent}66`,
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Main hex body */}
      <div
        style={{
          width: "100%",
          height: "100%",
          clipPath: HEX_CLIP,
          display: "grid",
          placeItems: "center",
          background: imageUrl
            ? `url(${imageUrl}) center/cover`
            : "linear-gradient(135deg, #1C1915, #0F0D0B)",
          fontFamily: "var(--font-display)",
          fontSize: Math.max(20, Math.floor(size * 0.36)),
          color: accent,
          overflow: "hidden",
        }}
        aria-label={`${name} portrait`}
      >
        {!imageUrl && name.slice(0, 1).toUpperCase()}
      </div>
    </motion.div>
  );
}
