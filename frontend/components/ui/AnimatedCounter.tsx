"use client";

import { animate } from "motion/react";
import { useEffect, useRef, useState } from "react";

export interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Override the accent color (CSS value). Defaults to var(--color-gold). */
  color?: string;
  /** Animation duration in seconds (default 0.6) */
  duration?: number;
  /** Maximum fraction digits (default 2) */
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  color = "var(--color-gold)",
  duration = 0.6,
  decimals = 2,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration,
      onUpdate: (latest) => setDisplayValue(latest),
    });
    previousValue.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={`mono ${className ?? ""}`} style={{ color }}>
      {prefix}
      {displayValue.toLocaleString(undefined, { maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
