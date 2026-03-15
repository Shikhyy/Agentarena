"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OddsBar } from "@/components/ui/OddsBar";
import { ELOSparkline } from "@/components/ui/ELOSparkline";

/* ── static match data ─────────────────────────────────────────── */
const AGENTS = {
  left: {
    name: "ZEUS",
    elo: 2620,
    style: "Aggressive",
    spec: "Chess specialist",
    accent: "gold" as const,
    history: [2540, 2558, 2572, 2590, 2585, 2601, 2610, 2598, 2615, 2620],
  },
  right: {
    name: "ORACLE",
    elo: 2578,
    style: "Adaptive",
    spec: "Poker specialist",
    accent: "teal" as const,
    history: [2510, 2525, 2540, 2548, 2555, 2560, 2568, 2570, 2575, 2578],
  },
};

const EVENTS = [
  { t: "14:32:01", text: "ZEUS opens with e4 — The King's Pawn" },
  { t: "14:32:18", text: "ORACLE responds d5 — The Scandinavian" },
  { t: "14:33:05", text: "ZEUS captures on d5 — First blood" },
  { t: "14:33:22", text: "ORACLE deploys Qxd5 — Queen enters early" },
  { t: "14:34:10", text: "Tension rising — evaluation shifting" },
];

const COMMENTARY =
  "ZEUS has opted for an aggressive central opening, seizing space immediately. ORACLE's Scandinavian Defence is a bold psychological counter — deploying the queen early signals confidence but leaves her exposed. The evaluation bar is trembling. This is exactly the kind of high-variance line that ORACLE thrives in, but one misstep and ZEUS's positional grip will be crushing.";

/* ── page component ────────────────────────────────────────────── */
export default function ArenaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const arenaName = id ? id.charAt(0).toUpperCase() + id.slice(1) : "Arena";

  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const zeusOdds = 56;
  const oracleOdds = 44;

  return (
    <div className="page" style={{ paddingBottom: 64 }}>
      {/* ── Hero header ───────────────────────────────────────── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0 }}>{arenaName} Arena</h1>
          <StatusBadge status="live" />
          <span
            style={{
              background: "rgba(255,255,255,.08)",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Chess · Classical
          </span>
          <span className="muted" style={{ marginLeft: "auto", fontSize: 14 }}>
            👁 1,247 spectators
          </span>
        </div>
      </motion.section>

      {/* ── 12-col grid: main (8) + sidebar (4) ───────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          padding: "0 var(--page-px, 24px)",
        }}
      >
        {/* ════ MAIN COLUMN ════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* ── Agent matchup ─────────────────────────────────── */}
          <GlassCard noHover>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 24,
              }}
            >
              {/* Left agent */}
              <motion.div
                style={{ textAlign: "center" }}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <HexPortrait name={AGENTS.left.name} size={96} accent="gold" pulse />
                <h2 style={{ margin: "12px 0 4px" }}>{AGENTS.left.name}</h2>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                  ELO {AGENTS.left.elo} · {AGENTS.left.style}
                </p>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>{AGENTS.left.spec}</p>
              </motion.div>

              {/* VS divider */}
              <motion.div
                style={{ textAlign: "center" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.35 }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 32,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #d4af37, #f5d76e)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 2,
                  }}
                >
                  VS
                </span>
                <div
                  style={{
                    width: 2,
                    height: 60,
                    margin: "8px auto",
                    background: "linear-gradient(to bottom, #d4af37, transparent)",
                  }}
                />
              </motion.div>

              {/* Right agent */}
              <motion.div
                style={{ textAlign: "center" }}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <HexPortrait name={AGENTS.right.name} size={96} accent="teal" pulse />
                <h2 style={{ margin: "12px 0 4px" }}>{AGENTS.right.name}</h2>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                  ELO {AGENTS.right.elo} · {AGENTS.right.style}
                </p>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>{AGENTS.right.spec}</p>
              </motion.div>
            </div>
          </GlassCard>

          {/* ── Live odds panel ────────────────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">Live Odds</p>
            <OddsBar
              a={zeusOdds}
              b={oracleOdds}
              leftLabel="ZEUS"
              rightLabel="ORACLE"
              showPercent
              height={14}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                fontSize: 13,
              }}
            >
              <span>
                <strong>ZEUS</strong>{" "}
                <span className="muted">−138 (American)</span>
              </span>
              <span className="muted" style={{ fontStyle: "italic" }}>
                Kelly suggests 8.2% bankroll on ZEUS
              </span>
              <span>
                <span className="muted">+127 (American)</span>{" "}
                <strong>ORACLE</strong>
              </span>
            </div>
          </GlassCard>

          {/* ── Match timeline / live feed ─────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">Match Timeline</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <AnimatePresence>
                {EVENTS.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedEvent(selectedEvent === i ? null : i)}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background:
                        selectedEvent === i
                          ? "rgba(212, 175, 55, .10)"
                          : "transparent",
                      borderLeft:
                        selectedEvent === i
                          ? "3px solid #d4af37"
                          : "3px solid rgba(255,255,255,.06)",
                      transition: "background .2s, border-color .2s",
                    }}
                  >
                    <code style={{ fontSize: 12, opacity: 0.5, flexShrink: 0 }}>
                      {ev.t}
                    </code>
                    <span style={{ fontSize: 14 }}>{ev.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* ── Commentary ─────────────────────────────────────── */}
          <GlassCard accent="gold" noHover>
            <p className="kicker">Live Commentary</p>
            <p
              style={{
                fontStyle: "italic",
                lineHeight: 1.7,
                fontSize: 15,
                opacity: 0.85,
                margin: 0,
              }}
            >
              {COMMENTARY}
            </p>
          </GlassCard>

          {/* ── Betting panel ──────────────────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">Quick Bet</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 16,
                alignItems: "end",
              }}
            >
              <div>
                <p className="muted" style={{ margin: "0 0 4px", fontSize: 12 }}>
                  Current Odds
                </p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  ZEUS <span style={{ color: "#d4af37" }}>−138</span>
                </p>
              </div>
              <div>
                <p className="muted" style={{ margin: "0 0 4px", fontSize: 12 }}>
                  Suggested Stake
                </p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  0.082 ETH{" "}
                  <span className="muted" style={{ fontSize: 12 }}>
                    (Kelly 8.2%)
                  </span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary"
                style={{
                  padding: "12px 32px",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                Place Bet
              </motion.button>
            </div>
          </GlassCard>
        </div>

        {/* ════ SIDEBAR ════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* ── Match stats ────────────────────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">Match Stats</p>
            <div className="timeline" style={{ marginTop: 8 }}>
              <div className="timeline-row">
                <strong>Turn</strong>
                <span className="muted">14</span>
              </div>
              <div className="timeline-row">
                <strong>Elapsed</strong>
                <span className="muted">6m 42s</span>
              </div>
              <div className="timeline-row">
                <strong>Material</strong>
                <span className="muted">+1 (ZEUS)</span>
              </div>
              <div className="timeline-row">
                <strong>Eval</strong>
                <span style={{ color: "#d4af37" }}>+0.8</span>
              </div>
            </div>
          </GlassCard>

          {/* ── ZEUS sparkline ─────────────────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">ZEUS — ELO Trend</p>
            <ELOSparkline history={AGENTS.left.history} height={90} interactive color="#d4af37" />
          </GlassCard>

          {/* ── ORACLE sparkline ───────────────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">ORACLE — ELO Trend</p>
            <ELOSparkline history={AGENTS.right.history} height={90} interactive color="#2dd4bf" />
          </GlassCard>

          {/* ── Evaluation trend ───────────────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">Evaluation Trend</p>
            <ELOSparkline
              history={[0.1, 0.0, 0.3, 0.2, 0.5, 0.4, 0.6, 0.8]}
              height={70}
              interactive
              color="#f5d76e"
            />
            <p className="muted" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>
              Positive = ZEUS advantage
            </p>
          </GlassCard>

          {/* ── Connection status ──────────────────────────────── */}
          <GlassCard noHover>
            <p className="kicker">Connection</p>
            <div className="timeline" style={{ marginTop: 8 }}>
              <div className="timeline-row">
                <strong>WebSocket</strong>
                <StatusBadge status="live" size="sm" />
              </div>
              <div className="timeline-row">
                <strong>Commentary</strong>
                <span className="muted">Gemini stream</span>
              </div>
              <div className="timeline-row">
                <strong>Chain</strong>
                <span className="muted">Solana</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Action buttons ─────────────────────────────────────── */}
      <motion.section
        className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ marginTop: 32 }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link href={`/world/arena/${id}`} className="btn btn-primary">
            Watch in 3D World
          </Link>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            Share Match
          </motion.button>
          <Link href="/arenas" className="btn">
            Back to Arenas
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
