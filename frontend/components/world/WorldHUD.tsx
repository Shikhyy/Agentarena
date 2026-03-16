"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useWorldStore, WORLD_ZONES, type WorldZone } from "@/lib/worldStore";
import { AgentPassport } from "@/components/ui/AgentPassport";

/* ── Shared glass panel style ─────────────────────────────── */
const glass: React.CSSProperties = {
  background: "rgba(10, 9, 7, 0.72)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(200, 150, 60, 0.18)",
  borderRadius: 12,
  padding: "10px 14px",
  color: "#F0E8D8",
};

const shortcuts: { zone: WorldZone; label: string; icon: string }[] = [
  { zone: "central-nexus", label: "Nexus", icon: "◉" },
  { zone: "arena-chess", label: "Chess", icon: "♟" },
  { zone: "arena-poker", label: "Poker", icon: "♠" },
  { zone: "arena-monopoly", label: "Monopoly", icon: "▦" },
  { zone: "workshop", label: "Workshop", icon: "⚙" },
  { zone: "marketplace", label: "Market", icon: "◈" },
];

/* ── Minimap ──────────────────────────────────────────────── */
function Minimap() {
  const currentZone = useWorldStore((s) => s.currentZone);
  const liveMatches = useWorldStore((s) => s.liveMatches);
  const teleportToZone = useWorldStore((s) => s.teleportToZone);

  return (
    <div style={{ ...glass, width: 180, height: 180, borderRadius: 16, padding: 8, borderColor: "rgba(200, 150, 60, 0.25)" }}>
      <svg viewBox="-100 -100 200 200" width="100%" height="100%" aria-label="World minimap">
        {/* Background */}
        <circle cx="0" cy="0" r="98" fill="rgba(10, 9, 7, 0.95)" stroke="rgba(200, 150, 60, 0.2)" strokeWidth="1" />
        {/* Range rings */}
        <circle cx="0" cy="0" r="70" fill="none" stroke="rgba(74, 140, 134, 0.12)" strokeDasharray="4 4" />
        <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(74, 140, 134, 0.12)" strokeDasharray="4 4" />
        {/* Crosshair */}
        <line x1="-96" y1="0" x2="96" y2="0" stroke="rgba(200, 150, 60, 0.06)" />
        <line x1="0" y1="-96" x2="0" y2="96" stroke="rgba(200, 150, 60, 0.06)" />

        {WORLD_ZONES.slice(0, 8).map((zone) => {
          const scale = 0.75;
          const x = zone.position[0] * scale;
          const y = zone.position[2] * scale;
          const isActive = currentZone === zone.id;
          const hasLive = liveMatches.some((m) => m.zone === zone.id && m.status === "live");

          return (
            <g key={zone.id} onClick={() => teleportToZone(zone.id)} style={{ cursor: "pointer" }}>
              {/* Pulse ring for live matches */}
              {hasLive && (
                <>
                  <circle cx={x} cy={y} r={14} fill="none" stroke="rgba(196, 48, 48, 0.5)" strokeWidth={1}>
                    <animate attributeName="r" from="10" to="18" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r={3} fill="#C43030">
                    <animate attributeName="opacity" from="1" to="0.4" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {/* Active glow */}
              {isActive && <circle cx={x} cy={y} r={12} fill={zone.color} opacity={0.12} />}
              {/* Zone dot */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? 7 : 4.5}
                fill={isActive ? zone.color : "rgba(90, 82, 72, 0.6)"}
                stroke={zone.color}
                strokeWidth={isActive ? 2 : 0.8}
              />
              {/* Zone label */}
              <text
                x={x}
                y={y + (isActive ? 14 : 11)}
                textAnchor="middle"
                fill={isActive ? "#F0E8D8" : "#8C7C68"}
                fontSize={isActive ? "7" : "6"}
                fontFamily="monospace"
              >
                {zone.icon}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Zone navigation bar ──────────────────────────────────── */
function WorldNav() {
  const currentZone = useWorldStore((s) => s.currentZone);
  const teleportToZone = useWorldStore((s) => s.teleportToZone);

  return (
    <div style={{ ...glass, display: "flex", gap: 4, padding: "6px 10px", borderRadius: 999 }}>
      {shortcuts.map((item) => {
        const active = item.zone === currentZone;
        const zoneConfig = WORLD_ZONES.find((z) => z.id === item.zone);
        return (
          <button
            key={item.zone}
            onClick={() => teleportToZone(item.zone)}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: "0.7rem",
              fontWeight: active ? 700 : 500,
              letterSpacing: "0.04em",
              color: active ? "#F0E8D8" : "#8C7C68",
              background: active ? `rgba(200, 150, 60, 0.18)` : "transparent",
              border: active ? `1px solid ${zoneConfig?.color ?? "#C8963C"}44` : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Match ticker (top center) ────────────────────────────── */
function MatchTicker() {
  const matches = useWorldStore((s) => s.liveMatches).filter((m) => m.status === "live").slice(0, 4);
  const teleportToZone = useWorldStore((s) => s.teleportToZone);

  if (matches.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {matches.map((match) => (
        <motion.button
          key={match.id}
          onClick={() => teleportToZone(match.zone)}
          whileHover={{ y: -2, borderColor: "rgba(200, 150, 60, 0.4)" }}
          style={{
            ...glass,
            all: undefined,
            background: "rgba(10, 9, 7, 0.78)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(200, 150, 60, 0.15)",
            borderRadius: 10,
            padding: "8px 14px",
            color: "#F0E8D8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 200,
            textAlign: "left" as const,
          }}
        >
          {/* Live pulse dot */}
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#C43030",
            boxShadow: "0 0 8px rgba(196, 48, 48, 0.6)",
            animation: "pulse 1.5s ease-in-out infinite",
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {match.agentA.name} vs {match.agentB.name}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#8C7C68", fontFamily: "monospace" }}>
              {match.gameType.toUpperCase()} · {match.spectators.toLocaleString()} watching
            </div>
          </div>
          <span style={{
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
            color: "#C43030", textTransform: "uppercase",
          }}>
            LIVE
          </span>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Balance display ──────────────────────────────────────── */
function BalanceChip() {
  const arenaBalance = useWorldStore((s) => s.arenaBalance);

  return (
    <div style={{ ...glass, display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8963C", boxShadow: "0 0 6px rgba(200, 150, 60, 0.5)" }} />
        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 700, color: "#E8B86D" }}>
          {arenaBalance.toLocaleString()} <span style={{ color: "#8C7C68", fontWeight: 500 }}>$ARENA</span>
        </span>
      </div>
      <span style={{ width: 1, height: 14, background: "rgba(200, 150, 60, 0.2)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4A8C86", boxShadow: "0 0 6px rgba(74, 140, 134, 0.5)" }} />
        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 700, color: "#4A8C86" }}>
          2.45 <span style={{ color: "#8C7C68", fontWeight: 500 }}>ETH</span>
        </span>
      </div>
    </div>
  );
}

/* ── Agent mini-card ──────────────────────────────────────── */
function AgentMiniCard() {
  const myAgentId = useWorldStore((s) => s.myAgentId);
  const agents = useWorldStore((s) => s.agents);
  const myAgent = agents.find((a) => a.id === myAgentId);

  if (!myAgent) return null;

  const statusColor: Record<string, string> = {
    idle: "#8C7C68", walking: "#4A8C86", competing: "#C8963C",
    celebrating: "#E8B86D", thinking: "#7A9A6A", seated: "#5A5248",
  };

  return (
    <div style={{ ...glass, display: "flex", alignItems: "center", gap: 12, minWidth: 240 }}>
      {/* Avatar circle with aura */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: `linear-gradient(135deg, ${myAgent.auraColor}44, ${myAgent.auraColor}11)`,
        border: `2px solid ${myAgent.auraColor}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.9rem", fontWeight: 800, color: myAgent.auraColor,
        boxShadow: `0 0 12px ${myAgent.auraColor}33`,
        flexShrink: 0,
      }}>
        {myAgent.name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.02em" }}>{myAgent.name}</div>
        <div style={{ display: "flex", gap: 8, fontSize: "0.68rem", fontFamily: "monospace", color: "#8C7C68" }}>
          <span>LV {myAgent.level}</span>
          <span style={{ color: "#C8963C" }}>ELO {myAgent.elo}</span>
          <span style={{ color: "#4A8C86" }}>{(myAgent.winRate * 100).toFixed(0)}% WR</span>
        </div>
      </div>
      <span style={{
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em",
        padding: "3px 8px", borderRadius: 6, textTransform: "uppercase",
        color: statusColor[myAgent.status] ?? "#8C7C68",
        background: `${statusColor[myAgent.status] ?? "#8C7C68"}18`,
        border: `1px solid ${statusColor[myAgent.status] ?? "#8C7C68"}30`,
      }}>
        {myAgent.status}
      </span>
    </div>
  );
}

/* ── Agent Passport overlay (click agent in 3D world) ─────── */
function AgentPassportOverlay() {
  const selectedAgentId = useWorldStore((s) => s.selectedAgentId);
  const selectAgent = useWorldStore((s) => s.selectAgent);
  const agents = useWorldStore((s) => s.agents);

  const agent = agents.find((a) => a.id === selectedAgentId) ?? null;

  // Escape key closes passport
  useEffect(() => {
    if (!agent) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") selectAgent(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agent, selectAgent]);

  return (
    <AnimatePresence>
      {agent && (
        <>
          {/* Click-elsewhere backdrop (transparent, only pointer-events) */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 119, cursor: "default" }}
            onClick={() => selectAgent(null)}
          />
          {/* Passport panel */}
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              bottom: 80,
              right: 16,
              zIndex: 120,
              pointerEvents: "auto",
            }}
          >
            <AgentPassport
              agent={{
                id: agent.id,
                name: agent.name,
                elo: agent.elo,
                level: agent.level,
                winRate: agent.winRate,
                accent: agent.auraColor,
                status: agent.status as Parameters<typeof AgentPassport>[0]["agent"]["status"],
              }}
              size="full"
            />
            {/* Close button */}
            <button
              onClick={() => selectAgent(null)}
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "rgba(10,9,7,0.7)",
                border: "1px solid rgba(200,150,60,0.25)",
                borderRadius: 4,
                color: "#8C7C68",
                fontFamily: "monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.06em",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              ESC ✕
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Main HUD ─────────────────────────────────────────────── */
export function WorldHUD() {
  const hudVisible = useWorldStore((s) => s.hudVisible);
  const hudOpacity = useWorldStore((s) => s.hudOpacity);
  const spectatorCount = useWorldStore((s) => s.spectatorCount);
  const currentZone = useWorldStore((s) => s.currentZone);

  const zone = WORLD_ZONES.find((z) => z.id === currentZone);

  if (!hudVisible) return null;

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 110, pointerEvents: "none" }}
      animate={{ opacity: hudOpacity }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Pulse animation keyframes */}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* ── TOP ROW ── */}
      <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, zIndex: 112 }}>
        {/* Left: exit + balance + minimap */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, pointerEvents: "auto" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link
              href="/"
              style={{
                ...glass,
                textDecoration: "none",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                color: "#C8B89A",
              }}
            >
              ← EXIT
            </Link>
            <BalanceChip />
          </div>
          <Minimap />
        </div>

        {/* Center: zone label + match ticker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", pointerEvents: "auto" }}>
          <div style={{
            ...glass,
            textAlign: "center",
            padding: "8px 24px",
            borderColor: `${zone?.color ?? "#C8963C"}30`,
          }}>
            <div style={{ fontSize: "0.6rem", color: "#8C7C68", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>
              Current Zone
            </div>
            <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.03em", color: zone?.color ?? "#F0E8D8" }}>
              {zone?.icon} {zone?.label || "Unknown"}
            </div>
          </div>
          <MatchTicker />
        </div>

        {/* Right: spectator count */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", pointerEvents: "auto" }}>
          <div style={{ ...glass, minWidth: 160, textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#4A8C86", fontFamily: "monospace" }}>
              {spectatorCount.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#8C7C68", letterSpacing: "0.1em" }}>
              Global Online
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, zIndex: 112 }}>
        {/* Left: controls hint */}
        <div style={{
          ...glass,
          pointerEvents: "auto",
          fontFamily: "monospace",
          fontSize: "0.65rem",
          color: "#5A5248",
          padding: "6px 12px",
          letterSpacing: "0.04em",
        }}>
          LMB orbit · Scroll zoom · Click to move
        </div>

        {/* Center: zone nav */}
        <div style={{ pointerEvents: "auto" }}>
          <WorldNav />
        </div>

        {/* Right: agent mini-card */}
        <div style={{ pointerEvents: "auto" }}>
          <AgentMiniCard />
        </div>
      </div>

      {/* Agent Passport — shown when an agent is clicked in the 3D world */}
      <AgentPassportOverlay />
    </motion.div>
  );
}
