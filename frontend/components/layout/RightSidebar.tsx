"use client";

import { motion, AnimatePresence } from "motion/react";
import { useArenaStore, useUIStore } from "@/lib/stores";
import { OddsBar } from "@/components/ui/OddsBar";

/** Commentary ribbon — shows latest commentary entries */
function CommentaryRibbon() {
  const commentary = useArenaStore((s) => s.commentary);
  const ribbonExpanded = useUIStore((s) => s.ribbonExpanded);
  const setRibbonExpanded = useUIStore((s) => s.setRibbonExpanded);

  const displayCommentary = ribbonExpanded ? commentary.slice(0, 8) : commentary.slice(0, 3);

  if (commentary.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass panel"
      style={{ width: 260, maxHeight: ribbonExpanded ? 400 : 180, overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span className="kicker">Commentary</span>
        <button
          className="btn"
          style={{ padding: "4px 8px", fontSize: 9 }}
          onClick={() => setRibbonExpanded(!ribbonExpanded)}
        >
          {ribbonExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AnimatePresence initial={false}>
          {displayCommentary.map((entry, i) => {
            const dramaColor =
              entry.dramaScore >= 8
                ? "var(--color-red-bright)"
                : entry.dramaScore >= 5
                ? "var(--color-gold)"
                : "var(--color-stone)";

            return (
              <motion.div
                key={`${entry.timestamp}-${i}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: 11,
                  lineHeight: 1.4,
                  borderLeft: `2px solid ${dramaColor}`,
                  paddingLeft: 8,
                  color: "var(--color-text)",
                }}
              >
                <span className="mono" style={{ color: dramaColor, fontSize: 9 }}>
                  {entry.eventType.toUpperCase()}
                </span>
                <div style={{ opacity: 0.85 }}>{entry.text}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** Probability bar showing agent A vs agent B odds */
function ProbabilityPanel() {
  const agentA = useArenaStore((s) => s.agentA);
  const agentB = useArenaStore((s) => s.agentB);
  const agentAProb = useArenaStore((s) => s.agentAProb);
  const agentBProb = useArenaStore((s) => s.agentBProb);

  if (!agentA || !agentB) return null;

  const pctA = Math.round(agentAProb * 100);
  const pctB = Math.round(agentBProb * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass panel"
      style={{ width: 260 }}
    >
      <div className="kicker" style={{ marginBottom: 8 }}>
        Win Probability
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span className="mono" style={{ color: "var(--color-gold)", fontSize: 12 }}>
          {agentA.name}
        </span>
        <span className="mono" style={{ color: "var(--color-red-bright)", fontSize: 12 }}>
          {agentB.name}
        </span>
      </div>

      <OddsBar
        a={pctA}
        b={pctB}
        leftLabel={agentA.name}
        rightLabel={agentB.name}
        showPercent
        height={10}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <span className="mono" style={{ fontSize: 18, color: "var(--color-gold)" }}>
          {pctA}%
        </span>
        <span className="mono" style={{ fontSize: 18, color: "var(--color-red-bright)" }}>
          {pctB}%
        </span>
      </div>
    </motion.div>
  );
}

export function RightSidebar() {
  const hudVisible = useUIStore((s) => s.hudVisible);
  const wsConnected = useArenaStore((s) => s.wsConnected);

  if (!hudVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        top: "calc(var(--topbar-h) + var(--balance-h) + 12px)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "auto",
      }}
    >
      {wsConnected && <ProbabilityPanel />}
      <CommentaryRibbon />
    </div>
  );
}
