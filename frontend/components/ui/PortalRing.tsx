"use client";

import Link from "next/link";
import { motion } from "motion/react";

export interface PortalRingProps {
  href: string;
  district: string;
  active?: boolean;
  /** Optional icon or label inside the ring */
  icon?: React.ReactNode;
  /** Size of the ring in px (default 92) */
  size?: number;
  className?: string;
}

export function PortalRing({
  href,
  district,
  active,
  icon,
  size = 92,
  className,
}: PortalRingProps) {
  const color = active ? "var(--color-gold)" : "var(--color-border)";

  return (
    <motion.div
      className={className}
      style={{ position: "relative", width: size, height: size }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {/* Pulse ring when active */}
      {active && (
        <motion.div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 999,
            border: "1.5px solid var(--color-gold)",
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <Link
        href={href}
        className="glass"
        style={{
          borderRadius: 999,
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          borderColor: color,
          boxShadow: active ? "0 0 20px rgba(0,232,255,0.2)" : "none",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: active ? "var(--color-gold)" : "var(--color-text)",
          textDecoration: "none",
        }}
      >
        {icon || district}
      </Link>
    </motion.div>
  );
}
