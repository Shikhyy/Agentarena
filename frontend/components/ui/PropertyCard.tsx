"use client";

import { motion } from "motion/react";

export interface PropertyCardProps {
  property: string;
  owned?: boolean;
  mortgaged?: boolean;
  /** Number of buildings (0–5, where 5 = hotel) */
  buildings?: number;
  /** Rent value for display */
  rent?: number;
  /** Owner agent name */
  owner?: string;
  className?: string;
}

export function PropertyCard({
  property,
  owned,
  mortgaged,
  buildings = 0,
  rent,
  owner,
  className,
}: PropertyCardProps) {
  const borderColor = mortgaged
    ? "var(--color-red)"
    : owned
      ? "var(--color-teal-light)"
      : "var(--color-border)";

  return (
    <motion.article
      className={className}
      style={{
        borderRadius: 10,
        border: `1px solid ${borderColor}`,
        background: "rgba(10,10,34,0.86)",
        padding: 10,
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{
        y: -2,
        boxShadow: owned
          ? "0 0 16px rgba(0,255,133,0.15)"
          : "0 0 12px rgba(0,232,255,0.1)",
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Building indicators */}
      {buildings > 0 && (
        <div
          style={{
            display: "flex",
            gap: 3,
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          {buildings >= 5 ? (
            <span style={{ fontSize: 14, color: "var(--color-gold)" }} title="Hotel">
              H
            </span>
          ) : (
            Array.from({ length: buildings }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 10,
                  borderRadius: 2,
                  background: "var(--color-teal-light)",
                  display: "inline-block",
                }}
                title={`House ${i + 1}`}
              />
            ))
          )}
        </div>
      )}

      <div
        className="kicker"
        style={{ color: "var(--color-stone)", fontSize: 9, letterSpacing: "0.1em" }}
      >
        Monopoly Property
      </div>
      <div className="display" style={{ fontSize: 28 }}>
        {property}
      </div>
      <div
        className="mono muted"
        style={{
          fontSize: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <span
          style={{
            color: mortgaged
              ? "var(--color-red)"
              : owned
                ? "var(--color-teal-light)"
                : "var(--color-stone)",
          }}
        >
          {mortgaged ? "Mortgaged" : owned ? "Owned" : "Unowned"}
        </span>
        {rent !== undefined && (
          <span style={{ color: "var(--color-gold)" }}>${rent}</span>
        )}
      </div>
      {owner && (
        <div className="mono" style={{ fontSize: 10, color: "var(--color-gold)", marginTop: 4 }}>
          {owner}
        </div>
      )}
    </motion.article>
  );
}
