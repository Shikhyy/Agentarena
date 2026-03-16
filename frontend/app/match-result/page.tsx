"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { BrassRule } from "@/components/ui/BrassRule";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, Suspense } from "react";
import { useMatchAnalysis } from "@/lib/useGeminiStream";

/* ── inner component that reads searchParams ────────────────── */

function MatchResultInner() {
  const params     = useSearchParams();
  const matchId    = params.get("matchId")  ?? "—";
  const winnerName = params.get("winner")   ?? "UNKNOWN";
  const loserName  = params.get("loser")    ?? "UNKNOWN";
  const eloChange  = Number(params.get("eloChange") ?? "0");
  const payout     = Number(params.get("payout")    ?? "0");

  const [phase, setPhase] = useState(0);
  const [particleDists] = useState(() => Array.from({ length: 24 }, () => 160 + Math.random() * 180));

  // Gemini post-match analysis
  const { analysis, isStreaming: analysisStreaming, analyzeMatch } = useMatchAnalysis();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 50),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 600),
      setTimeout(() => setPhase(4), 1000),
      setTimeout(() => setPhase(5), 1400),
      setTimeout(() => setPhase(6), 2000),
      setTimeout(() => setPhase(7), 2400),
      setTimeout(() => setPhase(8), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-generate Gemini analysis when match summary appears
  useEffect(() => {
    if (phase >= 6 && winnerName !== "UNKNOWN" && !analysis) {
      analyzeMatch({
        game_type: "chess",
        winner_name: winnerName,
        loser_name: loserName,
        move_count: 42,
        key_moments: [`${winnerName} gained decisive advantage`, `${loserName} attempted late comeback`],
        match_duration_seconds: 480,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-void)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── ambient glow ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,151,58,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── match id kicker ── */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.p
            className="subline"
            style={{ marginBottom: 20 }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Match #{matchId} · Post-Match Report
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── VICTORY headline ── */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.h1
            className="display"
            style={{ fontSize: "clamp(64px, 12vw, 130px)", color: "var(--color-gold)", margin: "0 0 8px", textAlign: "center" }}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            VICTORY
          </motion.h1>
        )}
      </AnimatePresence>

      {/* ── gold particle burst (CSS-only) ── */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
          >
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i / 24) * 360;
              const dist  = particleDists[i];
              return (
                <motion.div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    width: 4, height: 4,
                    borderRadius: "50%",
                    background: "var(--color-gold)",
                    boxShadow: "0 0 6px var(--color-gold)",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * dist,
                    y: Math.sin((angle * Math.PI) / 180) * dist,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.015 }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── combatants ── */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ display: "flex", alignItems: "center", gap: 40, marginBottom: 32, zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}
          >
            {/* Winner */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <HexPortrait name={winnerName} size={110} accent="var(--color-gold)" pulse />
              <p className="display" style={{ fontSize: 28, color: "var(--color-gold)", margin: 0 }}>{winnerName}</p>
              <p className="mono" style={{ fontSize: 10, color: "var(--color-gold)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Winner</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span className="mono muted" style={{ fontSize: 11 }}>vs</span>
            </div>

            {/* Loser */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.6 }}>
              <HexPortrait name={loserName} size={90} accent="var(--color-stone)" />
              <p className="display" style={{ fontSize: 22, color: "var(--color-stone)", margin: 0 }}>{loserName}</p>
              <p className="mono" style={{ fontSize: 10, color: "var(--color-stone)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Defeated</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── stat cards ── */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "min(640px, 100%)", marginBottom: 24, zIndex: 1 }}
          >
            {/* ELO change */}
            <GlassCard accent="gold" noHover>
              <p className="kicker">ELO Change</p>
              <div style={{ marginTop: 6 }}>
                <AnimatedCounter
                  value={eloChange}
                  prefix={eloChange >= 0 ? "+" : ""}
                  color={eloChange >= 0 ? "var(--color-teal)" : "var(--color-red)"}
                  decimals={0}
                />
              </div>
              <p className="mono muted" style={{ fontSize: 9, marginTop: 4 }}>rating delta</p>
            </GlassCard>

            {/* Payout */}
            <GlassCard accent="teal" noHover>
              <p className="kicker">$ARENA Earned</p>
              <div style={{ marginTop: 6 }}>
                <AnimatedCounter
                  value={payout}
                  color="var(--color-gold)"
                  decimals={0}
                />
              </div>
              <p className="mono muted" style={{ fontSize: 9, marginTop: 4 }}>tokens</p>
            </GlassCard>

            {/* Match ID */}
            <GlassCard noHover>
              <p className="kicker">Match ID</p>
              <p className="mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ivory)", marginTop: 6 }}>
                #{matchId}
              </p>
              <p className="mono muted" style={{ fontSize: 9, marginTop: 4 }}>on-chain ref</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── XP float ── */}
      <AnimatePresence>
        {phase >= 5 && eloChange > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -20] }}
            transition={{ duration: 2.0, times: [0, 0.15, 0.7, 1] }}
            style={{ zIndex: 1, marginBottom: 8 }}
          >
            <span className="mono" style={{ fontSize: 18, color: "var(--color-teal)", fontWeight: 700, letterSpacing: "0.12em" }}>
              +{Math.round(eloChange * 3)} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── divider ── */}
      <AnimatePresence>
        {phase >= 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: "min(640px, 100%)", zIndex: 1 }}
          >
            <BrassRule label="—" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── match summary card ── */}
      <AnimatePresence>
        {phase >= 6 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ width: "min(640px, 100%)", marginBottom: 24, zIndex: 1 }}
          >
            <GlassCard noHover>
              <p className="kicker" style={{ marginBottom: 10 }}>Match Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Winner",        value: winnerName,                        color: "var(--color-gold)" },
                  { label: "Loser",         value: loserName,                         color: "var(--color-stone)" },
                  { label: "ELO Δ (winner)", value: `${eloChange >= 0 ? "+" : ""}${eloChange}`, color: eloChange >= 0 ? "var(--color-teal)" : "var(--color-red)" },
                  { label: "$ARENA Payout", value: `${payout.toLocaleString()} tokens`, color: "var(--color-gold-hi)" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: 7 }}>
                    <span className="mono muted" style={{ fontSize: 11 }}>{label}</span>
                    <span className="mono" style={{ fontSize: 11, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gemini post-match analysis ── */}
      <AnimatePresence>
        {phase >= 7 && (analysis || analysisStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: "min(640px, 100%)", marginBottom: 24, zIndex: 1 }}
          >
            <GlassCard accent="teal" noHover>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>✦</span>
                <p className="kicker" style={{ margin: 0, color: "var(--color-teal-light)" }}>
                  Gemini Match Analysis
                </p>
                {analysisStreaming && (
                  <motion.span
                    style={{
                      marginLeft: "auto",
                      width: 6, height: 6,
                      borderRadius: "50%",
                      background: "var(--color-teal-light)",
                      display: "inline-block",
                    }}
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                )}
              </div>
              <p style={{
                fontFamily: "var(--font-narrative)",
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--color-text)",
                lineHeight: 1.7,
                margin: 0,
              }}>
                {analysis}
                {analysisStreaming && (
                  <span style={{ color: "var(--color-teal-light)" }}>▌</span>
                )}
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── action buttons ── */}
      <AnimatePresence>
        {phase >= 8 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", zIndex: 1 }}
          >
            <Link
              href={`/arenas/${matchId}`}
              className="btn"
              style={{ fontSize: 12, minWidth: 140, textAlign: "center" }}
            >
              ▶ Watch Replay
            </Link>
            <Link
              href="/agents"
              className="btn"
              style={{ fontSize: 12, minWidth: 140, textAlign: "center" }}
            >
              All Agents
            </Link>
            <Link
              href="/world"
              className="btn btn-primary"
              style={{ fontSize: 12, minWidth: 140, textAlign: "center" }}
            >
              Return to Arena →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── page export (Suspense required for useSearchParams) ─────── */

export default function MatchResultPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-void)" }}>
        <p className="mono muted" style={{ fontSize: 12, letterSpacing: "0.2em" }}>Loading result…</p>
      </div>
    }>
      <MatchResultInner />
    </Suspense>
  );
}

// keep postMatchTimeline import to avoid breaking unused-import if referenced elsewhere
