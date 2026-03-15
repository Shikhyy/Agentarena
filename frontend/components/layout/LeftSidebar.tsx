"use client";

import { motion, AnimatePresence } from "motion/react";
import { useWorldStore, type WorldAgent } from "@/lib/worldStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ELOSparkline } from "@/components/ui/ELOSparkline";

/** A small inline agent card shown when an agent is selected */
function AgentMiniCard({ agent }: { agent: WorldAgent }) {
  // Generate a fake ELO history from the agent's current ELO
  const eloHistory = Array.from({ length: 12 }, (_, i) =>
    agent.elo - 200 + Math.floor(Math.random() * 300) + i * 15
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="glass panel"
      style={{
        width: 220,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header: Portrait + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <HexPortrait
          name={agent.name}
          size={48}
          accent={agent.auraColor}
          pulse={agent.status === "competing" || agent.status === "thinking"}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="display"
            style={{
              fontSize: 16,
              color: "var(--color-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {agent.name}
          </div>
          <div
            className="mono muted"
            style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}
          >
            LV {agent.level}
            <StatusBadge
              status={
                agent.status === "competing"
                  ? "battling"
                  : agent.status === "thinking"
                  ? "battling"
                  : agent.status === "idle"
                  ? "idle"
                  : "live"
              }
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 4,
          textAlign: "center",
        }}
      >
        <div className="stat-card" style={{ padding: 6 }}>
          <div className="kicker">ELO</div>
          <div className="mono" style={{ color: "var(--color-gold)", fontSize: 13, fontWeight: 500 }}>
            {agent.elo}
          </div>
        </div>
        <div className="stat-card" style={{ padding: 6 }}>
          <div className="kicker">Win %</div>
          <div className="mono" style={{ color: "var(--color-teal-light)", fontSize: 13, fontWeight: 500 }}>
            {(agent.winRate * 100).toFixed(0)}%
          </div>
        </div>
        <div className="stat-card" style={{ padding: 6 }}>
          <div className="kicker">Style</div>
          <div className="mono" style={{ color: "var(--color-gold)", fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>
            {agent.personality.slice(0, 4)}
          </div>
        </div>
      </div>

      {/* ELO sparkline */}
      <div style={{ height: 40 }}>
        <ELOSparkline history={eloHistory} color="var(--color-gold)" interactive={false} />
      </div>
    </motion.div>
  );
}

export function LeftSidebar() {
  const selectedAgentId = useWorldStore((s) => s.selectedAgentId);
  const agents = useWorldStore((s) => s.agents);
  const hudVisible = useUIStore((s) => s.hudVisible);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  if (!hudVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        top: "calc(var(--topbar-h) + var(--balance-h) + 12px)",
        zIndex: 200,
        pointerEvents: "auto",
      }}
    >
      <AnimatePresence>
        {selectedAgent && (
          <AgentMiniCard key={selectedAgent.id} agent={selectedAgent} />
        )}
      </AnimatePresence>
    </div>
  );
}
