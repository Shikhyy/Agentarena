"use client";

import React, { useState, useMemo, useCallback } from "react";

export interface ELOSparklineProps {
  history: number[];
  /** Height of the SVG in px (default 80) */
  height?: number;
  /** Show a tooltip on hover with the value */
  interactive?: boolean;
  /** Accent color for the line (default var(--color-gold)) */
  color?: string;
  className?: string;
}

export const ELOSparkline: React.FC<ELOSparklineProps> = ({
  history,
  height = 80,
  interactive = true,
  color = "var(--color-gold)",
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { points, fillPoints, max, min } = useMemo(() => {
    const mx = Math.max(...history);
    const mn = Math.min(...history);
    const pts = history.map((value, i) => {
      const x = (i / (history.length - 1 || 1)) * 100;
      const y = mx === mn ? 50 : 100 - ((value - mn) / (mx - mn)) * 100;
      return { x, y };
    });
    const lineStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
    // Closed polygon for gradient fill
    const fillStr = `0,100 ${lineStr} 100,100`;
    return { points: lineStr, fillPoints: fillStr, max: mx, min: mn };
  }, [history]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      const idx = Math.round(pct * (history.length - 1));
      setHoveredIndex(Math.max(0, Math.min(history.length - 1, idx)));
    },
    [history.length, interactive],
  );

  const hoveredPoint = hoveredIndex !== null ? history[hoveredIndex] : null;
  const hoveredX = hoveredIndex !== null ? (hoveredIndex / (history.length - 1 || 1)) * 100 : 0;
  const hoveredY =
    hoveredIndex !== null && max !== min
      ? 100 - ((history[hoveredIndex] - min) / (max - min)) * 100
      : 50;

  return (
    <div className={className} style={{ position: "relative" }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%"
        height={height}
        aria-label="ELO history sparkline"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="elo-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gradient fill area */}
        <polygon points={fillPoints} fill="url(#elo-grad)" />

        {/* Main line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" />

        {/* Hover indicator */}
        {interactive && hoveredIndex !== null && (
          <>
            <line
              x1={hoveredX}
              y1={0}
              x2={hoveredX}
              y2={100}
              stroke={color}
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity={0.5}
            />
            <circle cx={hoveredX} cy={hoveredY} r="3" fill={color} />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {interactive && hoveredPoint !== null && (
        <div
          style={{
            position: "absolute",
            left: `${hoveredX}%`,
            top: -6,
            transform: "translateX(-50%)",
            background: "rgba(7,7,31,0.92)",
            border: `1px solid ${color}`,
            borderRadius: 6,
            padding: "2px 8px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {hoveredPoint}
        </div>
      )}
    </div>
  );
}
