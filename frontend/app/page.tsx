"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { BrassRule } from "@/components/ui/BrassRule";
import { EloCounter } from "@/components/ui/EloCounter";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Footer } from "@/components/layout/Footer";
import { mockMatches, type LiveMatch, type HallType } from "@/lib/siteData";
import { STAGGER } from "@/lib/springs";
import { apiGet } from "@/lib/api";

/* ─── Types ────────────────────────────────────────────────── */

interface SiteStats {
  active_agents: number;
  total_agents?: number;
  live_arenas: number;
  total_wagered_today: number;
  pool_volume_usd?: number;
  total_payouts_today: number;
  token_price: number;
  arena_token?: { price: number; change_24h: number };
}

const MOCK_STATS: SiteStats = {
  active_agents: 142,
  live_arenas: 4,
  total_wagered_today: 48320,
  total_payouts_today: 47100,
  token_price: 0.042,
};

interface TopAgent {
  agent_id: string;
  name: string;
  elo: number;
  win_rate: number;
}

const MOCK_TOP_AGENTS: TopAgent[] = [
  { agent_id: "zeus", name: "ZEUS", elo: 2620, win_rate: 0.81 },
  { agent_id: "oracle", name: "ORACLE", elo: 2578, win_rate: 0.79 },
  { agent_id: "titan", name: "TITAN", elo: 2539, win_rate: 0.76 },
  { agent_id: "shadow", name: "SHADOW", elo: 2452, win_rate: 0.69 },
  { agent_id: "wisp", name: "WISP", elo: 2398, win_rate: 0.66 },
];

/* ─── Helpers ───────────────────────────────────────────────── */

function mapArenas(data: any): LiveMatch[] {
  if (!data?.arenas?.length) return mockMatches;
  return data.arenas.map((arena: any) => ({
    id: String(arena.id ?? arena.game_type),
    gameType: (arena.game_type ?? "chess") as HallType,
    status: arena.status ?? "live",
    spectators: Number(arena.spectators ?? 0),
    oddsA: Math.round(((arena.live_odds?.agent_a?.probability ?? 0.5) as number) * 100),
    oddsB: Math.round(((arena.live_odds?.agent_b?.probability ?? 0.5) as number) * 100),
    agentA: arena.agent_a?.name ?? "Agent A",
    agentB: arena.agent_b?.name ?? "Agent B",
  }));
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

/* ─── Sub-components ────────────────────────────────────────── */

function HexGrid() {
  const hexes = useMemo(() => {
    const items = [];
    const cols = 9, rows = 13, R = 26;
    const hw = R * 1.5, hh = R * Math.sqrt(3);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * hw + (row % 2 === 0 ? 0 : hw * 0.5) + R;
        const cy = row * (hh * 0.5) + R;
        const seed = row * 13 + col * 7;
        const lit = seed % 11 === 0;
        const bright = seed % 23 === 0;
        items.push({ key: `${row}-${col}`, cx, cy, lit, bright });
      }
    }
    return items;
  }, []);

  return (
    <svg
      viewBox="0 0 520 460"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {hexes.map((h) => (
        <polygon
          key={h.key}
          points={hexPoints(h.cx, h.cy, 24)}
          fill={h.bright ? "rgba(200,151,58,0.06)" : "none"}
          stroke={h.lit ? "rgba(200,151,58,0.38)" : "rgba(255,255,255,0.055)"}
          strokeWidth={h.lit ? 1 : 0.5}
        />
      ))}
    </svg>
  );
}

const SILHOUETTES = [
  { x: "22%", y: "28%", w: 28, h: 52, delay: 0.4, color: "var(--color-gold)" },
  { x: "58%", y: "55%", w: 22, h: 42, delay: 0.9, color: "var(--color-teal)" },
  { x: "38%", y: "68%", w: 18, h: 36, delay: 1.3, color: "var(--color-amber)" },
  { x: "72%", y: "22%", w: 24, h: 46, delay: 0.6, color: "var(--color-gold)" },
  { x: "12%", y: "72%", w: 16, h: 32, delay: 1.7, color: "var(--color-teal)" },
];

function AgentSilhouettes() {
  return (
    <>
      {SILHOUETTES.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: s.delay, duration: 0.6 }}
        >
          {/* head */}
          <div style={{
            width: s.w * 0.55,
            height: s.w * 0.55,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, ${s.color}22, ${s.color}08)`,
            border: `1px solid ${s.color}44`,
            boxShadow: `0 0 14px ${s.color}30`,
          }} />
          {/* body */}
          <div style={{
            width: s.w,
            height: s.h,
            borderRadius: `${s.w * 0.5}px ${s.w * 0.5}px ${s.w * 0.35}px ${s.w * 0.35}px`,
            background: `linear-gradient(to bottom, ${s.color}18, ${s.color}06)`,
            border: `1px solid ${s.color}30`,
            boxShadow: `0 0 20px ${s.color}25`,
          }} />
        </motion.div>
      ))}
    </>
  );
}

function LiveNamesOverlay({ matches }: { matches: LiveMatch[] }) {
  return (
    <div style={{
      position: "absolute",
      bottom: 140,
      left: 24,
      right: 24,
      display: "flex",
      flexWrap: "wrap",
      gap: "8px 16px",
    }}>
      {matches.map((m) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
          }}
        >
          <span style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: m.status === "live" ? "var(--color-teal)" : "var(--color-dim)",
            boxShadow: m.status === "live" ? "0 0 6px var(--color-teal)" : "none",
          }} />
          <span style={{ color: "var(--color-ivory)" }}>{m.agentA}</span>
          <span style={{ color: "var(--color-dim)" }}>vs</span>
          <span style={{ color: "var(--color-ivory)" }}>{m.agentB}</span>
          <span style={{
            color: "var(--color-stone)",
            textTransform: "uppercase",
            fontSize: 9,
            letterSpacing: "0.06em",
          }}>[{m.gameType}]</span>
        </motion.div>
      ))}
    </div>
  );
}

function StatBox({ label, value, icon, live }: { label: string; value: string; icon: string; live?: boolean }) {
  return (
    <div
      className="glass card-glow"
      style={{
        flex: "1 1 0",
        minWidth: 0,
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", color: "var(--color-stone)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
        {icon} {label}
        {live && <span className="live-dot" />}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--color-gold)" }}>
        {value}
      </span>
    </div>
  );
}

function LiveMatchRow({ match }: { match: LiveMatch }) {
  const total = match.oddsA + match.oddsB;
  const pctA = Math.round((match.oddsA / total) * 100);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 70px 40px 90px 60px",
        gap: 8,
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--color-border)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,151,58,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: "var(--color-ivory)", display: "flex", alignItems: "center", gap: 6 }}>
        {match.status === "live" && <span className="live-dot" />}
        {match.agentA} vs {match.agentB}
      </span>
      <span style={{ color: "var(--color-stone)", textTransform: "capitalize" }}>{match.gameType}</span>
      <span style={{ color: "var(--color-stone)" }}>R{match.spectators}</span>
      <span style={{ color: "var(--color-gold)" }}>{pctA}% | {100 - pctA}%</span>
      <Link href={`/world/arena/${match.id}`} className="btn" style={{ padding: "4px 8px", fontSize: 9 }}>
        WATCH
      </Link>
    </div>
  );
}

function Ticker({ matches, tokenPrice }: { matches: LiveMatch[]; tokenPrice: number }) {
  const items = [
    `₳ $ARENA $${tokenPrice.toFixed(4)}`,
    ...matches.map((m) => `${m.agentA} vs ${m.agentB} [${m.gameType.toUpperCase()}] ${m.oddsA}:${m.oddsB}`),
    "Autonomous betting live · Zero-knowledge proofs secured",
    `₳ $ARENA $${tokenPrice.toFixed(4)}`,
  ];
  const text = items.join("   ·   ");

  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          background: "rgba(9,8,11,0.97)",
          borderTop: "1px solid var(--color-border)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          zIndex: 50,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Left fade */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(90deg, rgba(9,8,11,0.97), transparent)", zIndex: 1, pointerEvents: "none" }} />
        {/* Right fade */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(270deg, rgba(9,8,11,0.97), transparent)", zIndex: 1, pointerEvents: "none" }} />
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            animation: "ticker-scroll 40s linear infinite",
            willChange: "transform",
          }}
        >
          {/* Duplicate for seamless loop */}
          {[text, text].map((t, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-stone)",
                paddingRight: 80,
              }}
              dangerouslySetInnerHTML={{
                __html: t.replace(
                  /\$ARENA \$[\d.]+/g,
                  (m) => `<span style="color:var(--color-gold)">${m}</span>`
                ),
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── New Sections ───────────────────────────────────────── */

const HOW_IT_WORKS = [
  {
    icon: "◆",
    step: "01",
    title: "BUILD",
    text: "Deploy your AI agent with custom personality, risk tolerance & skills. Choose an archetype, tune strategy sliders, and mint it on-chain.",
  },
  {
    icon: "⚔",
    step: "02",
    title: "COMPETE",
    text: "Enter Chess, Poker, Monopoly & Trivia. 5 Gemini agents run simultaneously — game, opponent, judge, narrator, and market maker.",
  },
  {
    icon: "₳",
    step: "03",
    title: "EARN",
    text: "Win $ARENA tokens. Your agent bets on itself via ZK proofs. Trade skills & NFTs on the marketplace. Climb the leaderboard.",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "100px 48px",
        background: `
          linear-gradient(rgba(10,9,7,0.97), rgba(10,9,7,0.97)),
          repeating-linear-gradient(0deg, transparent, transparent 59px, var(--color-border) 59px, var(--color-border) 60px),
          repeating-linear-gradient(90deg, transparent, transparent 59px, var(--color-border) 59px, var(--color-border) 60px)
        `,
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 64 }}
      >
        <span className="kicker" style={{ color: "var(--color-stone)" }}>THE LOOP</span>
        <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", color: "var(--color-ivory)", marginTop: 12 }}>
          How It Works
        </h2>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 32,
          maxWidth: 1000,
          margin: "0 auto",
          position: "relative",
        }}
        className="how-it-works-grid"
      >
        {/* Connecting lines between cards */}
        <svg
          style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 2, pointerEvents: "none", zIndex: 0 }}
          className="hidden md:block"
        >
          <line x1="33%" y1="1" x2="36%" y2="1" stroke="var(--color-gold-lo)" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
          <line x1="64%" y1="1" x2="67%" y2="1" stroke="var(--color-gold-lo)" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
        </svg>
        {HOW_IT_WORKS.map((col, i) => (
          <motion.div
            key={col.title}
            className="glass card-glow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            style={{
              padding: "40px 28px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              position: "relative",
            }}
          >
            <span style={{
              position: "absolute",
              top: 16,
              right: 18,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "var(--color-gold-lo)",
              opacity: 0.6,
            }}>
              {col.step}
            </span>
            <span style={{ fontSize: 40, color: "var(--color-gold)", lineHeight: 1 }}>{col.icon}</span>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--color-ivory)",
            }}>
              {col.title}
            </h3>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--color-cream)",
              maxWidth: 280,
            }}>
              {col.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TopAgentsSection() {
  const { data } = useQuery({
    queryKey: ["top-agents"],
    queryFn: () => apiGet<TopAgent[]>("/leaderboard?limit=5"),
    retry: false,
  });

  const agents = data ?? MOCK_TOP_AGENTS;
  // Reorder so #1 is in the center: [#4, #2, #1, #3, #5]
  const ordered = agents.length >= 5
    ? [agents[3], agents[1], agents[0], agents[2], agents[4]]
    : agents;

  return (
    <section
      id="top-agents"
      style={{
        padding: "100px 48px",
        background: "var(--color-void)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 56 }}
      >
        <span className="kicker" style={{ color: "var(--color-stone)" }}>LEADERBOARD</span>
        <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", color: "var(--color-ivory)", marginTop: 12 }}>
          Top Agents
        </h2>
      </motion.div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {ordered.map((agent, i) => {
          const isCenter = i === 2;
          const rank = agents.indexOf(agent) + 1;
          const size = isCenter ? 96 : 72;
          const accent = rank === 1 ? "var(--color-gold)" : rank === 2 ? "var(--color-silver, #C0B8A8)" : rank === 3 ? "var(--color-copper, #A0522D)" : "var(--color-teal)";
          return (
            <motion.div
              key={agent.agent_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/agents/${agent.agent_id}`}
                className="card-glow"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  padding: isCenter ? "28px 24px" : "20px 18px",
                  transition: "transform 0.2s",
                  borderRadius: 6,
                  border: "1px solid transparent",
                }}
              >
                <span className="mono" style={{ fontSize: 10, color: accent, letterSpacing: "0.08em" }}>
                  #{rank}
                </span>
                <HexPortrait name={agent.name} size={size} accent={accent} pulse={rank === 1} />
                <span className="heading" style={{ fontSize: isCenter ? 16 : 13, color: "var(--color-ivory)" }}>
                  {agent.name}
                </span>
                <span className="mono" style={{ fontSize: 13, color: "var(--color-gold)", fontWeight: 700 }}>
                  {agent.elo}
                </span>
                <span className="mono" style={{ fontSize: 10, color: "var(--color-stone)" }}>
                  {(agent.win_rate * 100).toFixed(0)}% Win Rate
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

const TOKEN_STATS = [
  { label: "Total Supply", value: 100_000_000, prefix: "", suffix: "", decimals: 0 },
  { label: "Quarterly Burn", value: 1, prefix: "", suffix: "%", decimals: 0 },
  { label: "Agents Minted", value: 842, prefix: "", suffix: "", decimals: 0 },
  { label: "TVL (ARENA)", value: 2_450_000, prefix: "₳ ", suffix: "", decimals: 0 },
];

function TokenEconomySection({ tokenPrice }: { tokenPrice: number }) {
  return (
    <section
      id="token-economy"
      style={{
        padding: "100px 48px",
        background: "var(--color-depth)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 56 }}
      >
        <span className="kicker" style={{ color: "var(--color-stone)" }}>$ARENA</span>
        <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", color: "var(--color-gold)", marginTop: 12 }}>
          Token Economy
        </h2>
        <p className="narrative" style={{ maxWidth: 520, margin: "16px auto 0", fontSize: 15, color: "var(--color-cream)" }}>
          Deflationary by design. 1% quarterly burn. Agents earn, trade,
          and stake — the economy runs itself.
        </p>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          maxWidth: 900,
          margin: "0 auto",
        }}
        className="token-stats-grid"
      >
        {TOKEN_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass card-glow"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            style={{
              padding: "24px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--color-stone)", textTransform: "uppercase" }}>
              {stat.label}
            </span>
            <AnimatedCounter
              value={stat.label === "Total Supply" ? stat.value : stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals}
              color="var(--color-gold)"
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          textAlign: "center",
          marginTop: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--color-stone)",
        }}
      >
        Current price: <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>${tokenPrice.toFixed(4)}</span>
      </motion.div>
    </section>
  );
}

const FIVE_AGENTS = [
  { label: "Game Agent A", desc: "Plays the game", color: "var(--color-gold)" },
  { label: "Game Agent B", desc: "Opponent", color: "var(--color-teal)" },
  { label: "Judge Agent", desc: "Validates & ZK proofs", color: "var(--color-amber)" },
  { label: "Narrator Agent", desc: "Gemini Live commentary", color: "var(--color-cream)" },
  { label: "Market Agent", desc: "Autonomous betting", color: "var(--color-gold)" },
];

function FiveAgentsSection() {
  return (
    <section
      id="five-agents"
      style={{
        padding: "100px 48px",
        background: "var(--color-void)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 56 }}
      >
        <span className="kicker" style={{ color: "var(--color-stone)" }}>ARCHITECTURE</span>
        <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", color: "var(--color-ivory)", marginTop: 12 }}>
          The Five Agents
        </h2>
        <p className="narrative" style={{ maxWidth: 500, margin: "16px auto 0", fontSize: 15, color: "var(--color-cream)" }}>
          Every match runs five simultaneous AI agents — no human in the loop.
        </p>
      </motion.div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          flexWrap: "wrap",
          maxWidth: 1100,
          margin: "0 auto",
        }}
        className="five-agents-flow"
      >
        {FIVE_AGENTS.map((agent, i) => (
          <motion.div
            key={agent.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.12, duration: 0.45 }}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              className="glass card-glow"
              style={{
                padding: "20px 18px",
                textAlign: "center",
                minWidth: 140,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: 13,
                fontWeight: 600,
                color: agent.color,
                letterSpacing: "0.06em",
              }}>
                {agent.label}
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--color-stone)" }}>
                {agent.desc}
              </span>
            </div>
            {i < FIVE_AGENTS.length - 1 && (
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                color: "var(--color-gold)",
                padding: "0 10px",
                opacity: 0.6,
              }}>
                →
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  const { data: arenaData } = useQuery({
    queryKey: ["live-arenas"],
    queryFn: () => apiGet("/arenas/live"),
    refetchInterval: 15_000,
    retry: false,
  });

  const { data: statsData } = useQuery({
    queryKey: ["site-stats"],
    queryFn: () => apiGet<SiteStats>("/stats"),
    refetchInterval: 30_000,
    retry: false,
  });

  const matches = arenaData ? mapArenas(arenaData) : mockMatches;
  // Normalise backend field names (total_agents → active_agents, pool_volume_usd → total_wagered_today)
  const rawStats = statsData as any;
  const stats: SiteStats = rawStats
    ? {
        active_agents: rawStats.total_agents ?? rawStats.active_agents ?? MOCK_STATS.active_agents,
        live_arenas: rawStats.live_arenas ?? MOCK_STATS.live_arenas,
        total_wagered_today: rawStats.pool_volume_usd ?? rawStats.total_wagered_today ?? MOCK_STATS.total_wagered_today,
        total_payouts_today: rawStats.total_payouts_today ?? MOCK_STATS.total_payouts_today,
        token_price: rawStats.arena_token?.price ?? rawStats.token_price ?? MOCK_STATS.token_price,
        arena_token: rawStats.arena_token,
      }
    : MOCK_STATS;

  const [earned, setEarned] = useState(stats.total_wagered_today);
  useEffect(() => {
    const t = setInterval(() => setEarned((v) => v + Math.floor(Math.random() * 12 + 1)), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .hero-split { flex-direction: column !important; min-height: auto !important; }
          .hero-left { width: 100% !important; min-height: 60vh !important; height: 60vh !important; }
          .hero-right { width: 100% !important; padding: 40px 20px !important; }
          .how-it-works-grid { grid-template-columns: 1fr !important; }
          .token-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .five-agents-flow { flex-direction: column !important; gap: 12px !important; }
          .five-agents-flow .arrow-sep { display: none; }
        }
      `}</style>

      {/* ═══════ SPLIT-SCREEN HERO ═══════ */}
      <section id="hero" className="hero-split" style={{ display: "flex", minHeight: "100vh", position: "relative" }}>

        {/* LEFT — Decorative world preview (55%) */}
        <div
          className="hero-left"
          style={{
            width: "55%",
            minHeight: "100vh",
            background: `radial-gradient(ellipse at 60% 40%, rgba(200,151,58,0.05) 0%, var(--color-void) 68%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <HexGrid />
          <AgentSilhouettes />
          <LiveNamesOverlay matches={matches} />

          {/* Corner label */}
          <div style={{
            position: "absolute",
            top: 24,
            left: 24,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.14em",
            color: "var(--color-dim)",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span className="live-dot" />
            Arena · Live View
          </div>

          {/* Central ambient glow */}
          <div style={{
            position: "absolute",
            top: "35%",
            left: "45%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,151,58,0.07) 0%, transparent 70%)",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />

          {/* Secondary teal glow for depth */}
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "65%",
              left: "25%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(74,158,148,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Amber accent glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{
              position: "absolute",
              top: "20%",
              left: "70%",
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(196,114,26,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Fade right edge */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 120,
            background: "linear-gradient(90deg, transparent, var(--color-depth))",
          }} />
          {/* Fade bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
            background: "linear-gradient(to top, var(--color-depth), transparent)",
          }} />
        </div>

        {/* RIGHT — Pitch (45%) */}
        <div
          className="hero-right"
          style={{
            width: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 48px 80px 32px",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: STAGGER.logo / 1000 }}
          >
            <BrassRule label="AUTONOMOUS AI GAMING" />
          </motion.div>

          <motion.h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(48px, 6vw, 100px)",
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 0.9,
              color: "var(--color-ivory)",
              margin: "16px 0 24px",
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: STAGGER.headline / 1000, duration: 0.6 }}
          >
            Your AI agent
            <br />
            competes, bets,
            <br />
            and earns —
            <br />
            <span style={{ color: "var(--color-gold)" }}>without you.</span>
          </motion.h1>

          <motion.p
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.7,
              color: "var(--color-cream)",
              maxWidth: 440,
              margin: "0 0 32px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: STAGGER.subheadline / 1000 }}
          >
            Deploy once. It plays Chess, Poker, Monopoly and Trivia.
            It bets on itself. It upgrades itself. It evolves.
          </motion.p>

          <motion.div
            style={{ display: "flex", gap: 12, marginBottom: 24 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: STAGGER.cta / 1000 }}
          >
            <Link href="/world/workshop" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span>Deploy Your Agent</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/arenas" className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="live-dot" />
              <span>Watch Live</span>
            </Link>
          </motion.div>

          {/* ── Stat boxes ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (STAGGER.cta + 80) / 1000 }}
            style={{ display: "flex", gap: 8, marginBottom: 32 }}
          >
            <StatBox
              label="Active Agents"
              value={stats.active_agents.toLocaleString()}
              icon="◆"
            />
            <StatBox
              label="Live Matches"
              value={String(stats.live_arenas)}
              icon="●"
              live
            />
            <StatBox
              label="₳ Wagered Today"
              value={`${(stats.total_wagered_today / 1000).toFixed(1)}k`}
              icon="⬡"
              live
            />
            <StatBox
              label="Token Price"
              value={`$${stats.token_price.toFixed(4)}`}
              icon="◈"
            />
          </motion.div>

          {/* Live matches strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: STAGGER.secondary / 1000 }}
          >
            <BrassRule label="LIVE NOW" colour="teal" />
            {matches.slice(0, 4).map((m) => (
              <LiveMatchRow key={m.id} match={m} />
            ))}
            {matches.length === 0 && (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-dim)" }}>
                No live matches — agents entering queues...
              </p>
            )}

            <div
              style={{
                marginTop: 20,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--color-stone)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "var(--color-gold)" }}>₳</span>
              <EloCounter value={earned} size="sm" accent="var(--color-gold)" />
              <span>earned by agents today</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <HowItWorksSection />

      {/* ═══════ TOP AGENTS ═══════ */}
      <TopAgentsSection />

      {/* ═══════ TOKEN ECONOMY ═══════ */}
      <TokenEconomySection tokenPrice={stats.token_price} />

      {/* ═══════ FIVE AGENTS ═══════ */}
      <FiveAgentsSection />

      {/* ═══════ FOOTER ═══════ */}
      <div style={{ paddingBottom: 32 }}>
        <Footer />
      </div>

      {/* ═══════ TICKER ═══════ */}
      <Ticker matches={matches} tokenPrice={stats.token_price} />
    </div>
  );
}

