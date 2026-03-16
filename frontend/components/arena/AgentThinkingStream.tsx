"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAgentReasoning } from "@/lib/useGeminiStream";

interface AgentThinkingStreamProps {
  /** Agent name shown in header */
  agentName: string;
  /** The personality type for display */
  personality?: string;
  /** Game being played */
  gameType: string;
  /** The move just made — triggers a new generation */
  move: string | null;
  /** Opponent name for richer context */
  opponentName?: string;
  /** Current game state to give Gemini context */
  gameState?: Record<string, unknown>;
  /** Optional CSS class additions */
  className?: string;
}

const PERSONALITY_COLOR: Record<string, string> = {
  aggressive:   "var(--color-amber)",
  conservative: "var(--color-teal-light)",
  unpredictable:"var(--color-gold)",
  chaos:        "var(--color-red-bright)",
  adaptive:     "var(--color-sage-light)",
};

const PERSONALITY_ICON: Record<string, string> = {
  aggressive:   "⚔",
  conservative: "🛡",
  unpredictable:"🎲",
  chaos:        "⚡",
  adaptive:     "🧠",
};

export function AgentThinkingStream({
  agentName,
  personality = "adaptive",
  gameType,
  move,
  opponentName = "Opponent",
  gameState,
  className = "",
}: AgentThinkingStreamProps) {
  const { reasoning, isStreaming, error, generateReasoning, reset } = useAgentReasoning();

  // Trigger new reasoning whenever move changes
  useEffect(() => {
    if (!move) return;
    reset();
    generateReasoning({
      game_type: gameType,
      agent_name: agentName,
      personality,
      move,
      opponent_name: opponentName,
      game_state: gameState ?? {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [move]);

  const accentColor = PERSONALITY_COLOR[personality] ?? "var(--color-gold)";
  const icon = PERSONALITY_ICON[personality] ?? "🧠";

  return (
    <div
      className={className}
      style={{
        background: "rgba(22,19,16,0.92)",
        border: `1px solid ${accentColor}44`,
        borderRadius: 8,
        padding: "12px 16px",
        boxShadow: `0 0 24px ${accentColor}18`,
        minHeight: 72,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: accentColor,
          }}
        >
          {agentName}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.1em",
            color: "var(--color-stone)",
            textTransform: "uppercase",
          }}
        >
          · reasoning
        </span>
        {isStreaming && (
          <motion.span
            style={{
              marginLeft: "auto",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: accentColor,
              display: "inline-block",
            }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--color-rim)", marginBottom: 10 }} />

      {/* Reasoning text */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--color-stone)",
              margin: 0,
            }}
          >
            ⚠ {error}
          </motion.p>
        ) : !move ? (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            style={{
              fontFamily: "var(--font-narrative)",
              fontSize: 13,
              fontStyle: "italic",
              color: "var(--color-stone)",
              margin: 0,
            }}
          >
            Awaiting {agentName}&apos;s next move…
          </motion.p>
        ) : (
          <motion.p
            key={move}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: "var(--font-narrative)",
              fontSize: 13,
              fontStyle: "italic",
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {reasoning || (isStreaming ? "…" : "")}
            {isStreaming && (
              <motion.span
                style={{ color: accentColor }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ▌
              </motion.span>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
