"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

export interface GlassCardProps extends Omit<HTMLMotionProps<"section">, "ref"> {
  children: React.ReactNode;
  className?: string;
  accent?: "gold" | "teal" | "amber" | "danger" | "cyan" | "pink" | "green";
  style?: React.CSSProperties;
  /** Disable default hover lift/glow animation */
  noHover?: boolean;
  /** Intensity of the glow (0–1, default 0.5) */
  glowIntensity?: number;
}

const accentMap: Record<string, { border: string; shadow: string }> = {
  gold: {
    border: "rgba(200,150,60,0.4)",
    shadow: "0 0 40px rgba(200,150,60,0.20)",
  },
  teal: {
    border: "rgba(74,140,134,0.4)",
    shadow: "0 0 40px rgba(74,140,134,0.18)",
  },
  amber: {
    border: "rgba(212,121,26,0.4)",
    shadow: "0 0 40px rgba(212,121,26,0.22)",
  },
  danger: {
    border: "rgba(139,32,32,0.4)",
    shadow: "0 0 40px rgba(139,32,32,0.25)",
  },
  // Legacy aliases
  cyan: {
    border: "rgba(200,150,60,0.4)",
    shadow: "0 0 40px rgba(200,150,60,0.20)",
  },
  pink: {
    border: "rgba(139,32,32,0.4)",
    shadow: "0 0 40px rgba(139,32,32,0.25)",
  },
  green: {
    border: "rgba(74,140,134,0.4)",
    shadow: "0 0 40px rgba(74,140,134,0.18)",
  },
};

export const GlassCard = forwardRef<HTMLElement, GlassCardProps>(function GlassCard(
  { children, className, accent, style, noHover, glowIntensity = 0.5, ...rest },
  ref,
) {
  const accentStyle = accent ? accentMap[accent] : undefined;
  const classes = [
    "glass",
    "panel",
    accent ? `glass-${accent}` : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const baseStyle: React.CSSProperties = {
    borderRadius: 4,
    ...(accentStyle
      ? {
          borderColor: accentStyle.border,
          boxShadow: accentStyle.shadow,
        }
      : {}),
    ...style,
  };

  if (noHover) {
    return (
      <motion.section ref={ref} className={classes} style={baseStyle} {...rest}>
        {children}
      </motion.section>
    );
  }

  return (
    <motion.section
      ref={ref}
      className={classes}
      style={baseStyle}
      whileHover={{
        y: -2,
        boxShadow: accentStyle
          ? accentStyle.shadow.replace(/0\.18|0\.20|0\.22|0\.25/g, (m) => String(parseFloat(m) + glowIntensity * 0.15))
          : `0 0 ${20 * glowIntensity}px rgba(200,150,60,0.12)`,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      {...rest}
    >
      {children}
    </motion.section>
  );
});
