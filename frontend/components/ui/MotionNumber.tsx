"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface MotionNumberProps {
  value: number;
  /** Size of each digit cell (default 16) */
  cellWidth?: number;
  /** Color for the digits (default var(--color-text)) */
  color?: string;
  className?: string;
}

export function MotionNumber({
  value,
  cellWidth = 16,
  color,
  className,
}: MotionNumberProps) {
  const chars = useMemo(() => String(value).split(""), [value]);
  const prevChars = useRef(chars);

  useEffect(() => {
    prevChars.current = chars;
  }, [chars]);

  return (
    <span
      className={`display ${className ?? ""}`}
      style={{
        display: "inline-flex",
        gap: 1,
        overflow: "hidden",
        color,
      }}
    >
      <AnimatePresence mode="popLayout">
        {chars.map((char, idx) => (
          <motion.span
            key={`${idx}-${char}`}
            style={{
              display: "inline-grid",
              placeItems: "center",
              minWidth: cellWidth,
              borderRadius: 6,
              background: "rgba(19,19,53,0.56)",
              overflow: "hidden",
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
