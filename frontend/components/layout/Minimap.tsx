"use client";

import { motion } from "motion/react";
import { useWorldStore, WORLD_ZONES, type WorldZone } from "@/lib/worldStore";
import { useUIStore } from "@/lib/stores/uiStore";

/**
 * A 2D minimap overlay showing zone positions, the player dot,
 * and agent dots. Sits in the bottom-left above the zone bar.
 */
export function Minimap() {
  const currentZone = useWorldStore((s) => s.currentZone);
  const playerPosition = useWorldStore((s) => s.playerPosition);
  const agents = useWorldStore((s) => s.agents);
  const teleportToZone = useWorldStore((s) => s.teleportToZone);
  const minimapExpanded = useWorldStore((s) => s.minimapExpanded);
  const toggleMinimap = useWorldStore((s) => s.toggleMinimap);
  const hudVisible = useUIStore((s) => s.hudVisible);

  if (!hudVisible) return null;

  const size = minimapExpanded ? 200 : 120;
  // Map world coords to minimap coords. World ranges roughly -240 to 240.
  const scale = size / 600;
  const center = size / 2;

  const toMinimap = (pos: [number, number, number]): { x: number; y: number } => ({
    x: center + pos[0] * scale,
    y: center + pos[2] * scale,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: "fixed",
        left: 12,
        bottom: "calc(var(--zone-h) + 12px)",
        zIndex: 200,
        width: size,
        height: size,
        borderRadius: minimapExpanded ? 16 : 12,
        border: "1px solid var(--color-border)",
        background: "rgba(2, 2, 12, 0.88)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      onClick={toggleMinimap}
    >
      {/* Grid pattern background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: `${size / 8}px ${size / 8}px`,
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Zone dots */}
        {WORLD_ZONES.map((zone) => {
          const pos = toMinimap(zone.position);
          const isActive = currentZone === zone.id;
          return (
            <g key={zone.id}>
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={minimapExpanded ? 10 : 7}
                  fill="none"
                  stroke={zone.color}
                  strokeWidth={1}
                  opacity={0.4}
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={minimapExpanded ? 4 : 3}
                fill={isActive ? zone.color : "var(--color-stone)"}
                opacity={isActive ? 1 : 0.5}
              />
              {minimapExpanded && (
                <text
                  x={pos.x}
                  y={pos.y + (minimapExpanded ? 14 : 10)}
                  textAnchor="middle"
                  fill="var(--color-stone)"
                  fontSize={7}
                  fontFamily="var(--font-mono)"
                >
                  {zone.label.length > 8 ? zone.label.slice(0, 7) + "…" : zone.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Agent dots */}
        {agents.map((agent) => {
          const pos = toMinimap(agent.position);
          return (
            <circle
              key={agent.id}
              cx={pos.x}
              cy={pos.y}
              r={2}
              fill={agent.auraColor}
              opacity={0.7}
            />
          );
        })}

        {/* Player dot */}
        {(() => {
          const pp = toMinimap(playerPosition);
          return (
            <circle
              cx={pp.x}
              cy={pp.y}
              r={minimapExpanded ? 4 : 3}
              fill="var(--color-gold)"
              stroke="var(--color-deep)"
              strokeWidth={1.5}
            />
          );
        })()}
      </svg>

      {/* Label */}
      <div
        className="mono"
        style={{
          position: "absolute",
          top: 4,
          left: 6,
          fontSize: 8,
          color: "var(--color-stone)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        MAP
      </div>
    </motion.div>
  );
}
