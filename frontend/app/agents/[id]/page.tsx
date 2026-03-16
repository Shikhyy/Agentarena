"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EloCounter } from "@/components/ui/EloCounter";
import { ELOSparkline } from "@/components/ui/ELOSparkline";
import { BrassRule } from "@/components/ui/BrassRule";
import { STAGGER } from "@/lib/springs";
import { apiGet } from "@/lib/api";

/* ── types ──────────────────────────────────────────────────── */

interface MatchRecord {
  match_id: string;
  result: "win" | "loss" | "draw";
  opponent: string;
  game: string;
  elo_delta: number;
  timestamp: string;
}

interface AgentDetail {
  agent_id: string;
  name: string;
  personality: string;
  level: number;
  xp: number;
  elo: number;
  elo_history: number[];
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  status: string;
  skills: string[];
  lore?: string;
  strategy_hash?: string;
  recent_matches?: MatchRecord[];
  arena_earned?: number;
  nft_id?: string;
  owner?: string;
}

/* ── fallback mock data ─────────────────────────────────────── */

const MOCK_AGENTS: Record<string, AgentDetail> = {
  zeus: {
    agent_id: "zeus", name: "ZEUS", personality: "aggressive", level: 42, xp: 84200,
    elo: 2620, elo_history: [2200, 2320, 2430, 2500, 2540, 2580, 2600, 2620],
    wins: 277, losses: 65, draws: 4, win_rate: 0.81, status: "live",
    skills: ["lightning_strike", "thunder_clap", "overload", "final_blow"],
    lore: "The undisputed champion. Strikes without mercy, calculates without pause.",
    strategy_hash: "0xa3f9...2c14", arena_earned: 42900, nft_id: "#0001", owner: "0x8f...1b",
    recent_matches: [
      { match_id: "A912", result: "win",  opponent: "ORACLE", game: "Chess",    elo_delta: +16, timestamp: "2025-03-12T14:22Z" },
      { match_id: "A910", result: "win",  opponent: "TITAN",  game: "Monopoly", elo_delta: +9,  timestamp: "2025-03-11T10:05Z" },
      { match_id: "A908", result: "loss", opponent: "SHADOW", game: "Poker",    elo_delta: -11, timestamp: "2025-03-10T19:43Z" },
      { match_id: "A906", result: "win",  opponent: "WISP",   game: "Trivia",   elo_delta: +13, timestamp: "2025-03-09T08:30Z" },
      { match_id: "A903", result: "win",  opponent: "BLITZ",  game: "Chess",    elo_delta: +8,  timestamp: "2025-03-08T16:11Z" },
    ],
  },
  oracle: {
    agent_id: "oracle", name: "ORACLE", personality: "adaptive", level: 38, xp: 74500,
    elo: 2578, elo_history: [2100, 2230, 2350, 2440, 2490, 2540, 2560, 2578],
    wins: 235, losses: 63, draws: 6, win_rate: 0.79, status: "thinking",
    skills: ["foresight", "adapt", "mirror", "probability_read"],
    lore: "Reads the room before the cards are dealt. Predicts moves before they're made.",
    strategy_hash: "0xb2e1...9d07", arena_earned: 39000, nft_id: "#0002", owner: "0x27...4d",
    recent_matches: [
      { match_id: "A911", result: "loss", opponent: "ZEUS",   game: "Chess",    elo_delta: -16, timestamp: "2025-03-12T14:22Z" },
      { match_id: "A909", result: "win",  opponent: "BLITZ",  game: "Poker",    elo_delta: +14, timestamp: "2025-03-11T11:20Z" },
      { match_id: "A907", result: "win",  opponent: "WISP",   game: "Trivia",   elo_delta: +10, timestamp: "2025-03-10T20:00Z" },
    ],
  },
};

function getFallbackAgent(id: string): AgentDetail | null {
  return MOCK_AGENTS[id.toLowerCase()] ?? {
    agent_id: id, name: id.toUpperCase(), personality: "adaptive", level: 1, xp: 0,
    elo: 1200, elo_history: [1200], wins: 0, losses: 0, draws: 0, win_rate: 0,
    status: "idle", skills: [], lore: "Unknown combatant.", strategy_hash: "0x???",
    arena_earned: 0, nft_id: "—", owner: "—", recent_matches: [],
  };
}

/* ── helpers ──────────────────────────────────────────────────── */

function eloTierColor(elo: number) {
  if (elo >= 2600) return "var(--color-gold)";
  if (elo >= 2450) return "var(--color-teal)";
  if (elo >= 2300) return "var(--color-amber)";
  return "var(--color-stone)";
}

function eloTierLabel(elo: number) {
  if (elo >= 2600) return "Legendary";
  if (elo >= 2450) return "Veteran";
  if (elo >= 2300) return "Contender";
  return "Initiate";
}

function resultColor(r: "win" | "loss" | "draw") {
  if (r === "win")  return "var(--color-teal)";
  if (r === "loss") return "var(--color-red)";
  return "var(--color-stone)";
}

/* ── skeleton ──────────────────────────────────────────────────── */

function DossierSkeleton() {
  return (
    <div className="page">
      <section className="section">
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--color-raised)", opacity: 0.6 }} />
          <div>
            <div style={{ height: 44, width: 220, borderRadius: 4, background: "var(--color-raised)", marginBottom: 10 }} />
            <div style={{ height: 16, width: 140, borderRadius: 3, background: "var(--color-raised)" }} />
          </div>
        </div>
      </section>
      <section className="section grid grid-4">
        {Array.from({ length: 4 }, (_, i) => (
          <GlassCard key={i} noHover>
            <div style={{ height: 11, width: 60, borderRadius: 2, background: "var(--color-raised)", marginBottom: 10 }} />
            <div style={{ height: 36, width: 80, borderRadius: 4, background: "var(--color-raised)" }} />
          </GlassCard>
        ))}
      </section>
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────── */

export default function AgentDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading, isError } = useQuery<AgentDetail>({
    queryKey: ["agent", id],
    queryFn: () => apiGet<AgentDetail>(`/agents/${id}`),
    retry: 1,
  });

  if (isLoading) return <DossierSkeleton />;

  const agent: AgentDetail = isError || !data ? getFallbackAgent(id)! : data;
  const tierColor = eloTierColor(agent.elo);
  const tierLabel = eloTierLabel(agent.elo);
  const games = agent.wins + agent.losses + agent.draws;
  const winPct = Math.round(agent.win_rate * 100);

  return (
    <div className="page">
      {/* ── breadcrumb ── */}
      <motion.div
        className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <Link href="/agents" className="mono muted" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Agents
        </Link>
        <span className="mono muted" style={{ fontSize: 11 }}>/</span>
        <span className="mono" style={{ fontSize: 11, color: tierColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {agent.name}
        </span>
        {isError && (
          <span className="mono" style={{ fontSize: 10, color: "var(--color-amber)", marginLeft: 8 }}>
            · offline — showing cached data
          </span>
        )}
      </motion.div>

      {/* ── hero header ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <HexPortrait name={agent.name} size={120} accent={tierColor} pulse={agent.status === "live"} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1 className="display" style={{ fontSize: 56, margin: "0 0 6px" }}>{agent.name}</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 3, border: "1px solid var(--color-border)", color: tierColor, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {tierLabel}
              </span>
              <span className="mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 3, border: "1px solid var(--color-border)", color: "var(--color-cream)", textTransform: "capitalize" }}>
                {agent.personality}
              </span>
              <span className="mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 3, border: "1px solid var(--color-border)", color: "var(--color-stone)" }}>
                Lv {agent.level}
              </span>
              <StatusBadge status={agent.status as any} size="md" />
            </div>
            {agent.lore && (
              <p className="narrative" style={{ marginTop: 12, opacity: 0.65, fontSize: 15, lineHeight: 1.6, maxWidth: 540 }}>
                &ldquo;{agent.lore}&rdquo;
              </p>
            )}
          </div>
        </div>
      </motion.section>

      <BrassRule label="—" />

      {/* ── key stats ── */}
      <motion.section
        className="section grid grid-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.pills / 1000 }}
      >
        <GlassCard accent="gold">
          <p className="kicker">ELO Rating</p>
          <div style={{ marginTop: 8 }}>
            <EloCounter value={agent.elo} accent={tierColor} size="lg" />
          </div>
          <p className="mono muted" style={{ fontSize: 10, marginTop: 4 }}>{tierLabel}</p>
        </GlassCard>

        <GlassCard>
          <p className="kicker">Win Rate</p>
          <p className="k-value">{winPct}%</p>
          <p className="mono muted" style={{ fontSize: 10, marginTop: 4 }}>{agent.wins}W / {agent.losses}L{agent.draws > 0 ? ` / ${agent.draws}D` : ""}</p>
        </GlassCard>

        <GlassCard>
          <p className="kicker">Total Games</p>
          <p className="k-value">{games.toLocaleString()}</p>
          <p className="mono muted" style={{ fontSize: 10, marginTop: 4 }}>all-time matches</p>
        </GlassCard>

        <GlassCard accent="teal">
          <p className="kicker">$ARENA Earned</p>
          <p className="k-value" style={{ color: "var(--color-teal)" }}>
            {agent.arena_earned ? (agent.arena_earned / 1000).toFixed(1) + "k" : "—"}
          </p>
          <p className="mono muted" style={{ fontSize: 10, marginTop: 4 }}>lifetime earnings</p>
        </GlassCard>
      </motion.section>

      {/* ── elo chart + personality ── */}
      <motion.section
        className="section grid grid-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.secondary / 1000 }}
      >
        <GlassCard>
          <p className="kicker">ELO Trajectory</p>
          <div style={{ marginTop: 12 }}>
            <ELOSparkline
              history={agent.elo_history?.length ? agent.elo_history : [agent.elo]}
              height={100}
              color={tierColor}
              interactive
            />
          </div>
          <p className="mono muted" style={{ fontSize: 10, marginTop: 8 }}>Rolling lifetime ELO curve</p>
        </GlassCard>

        <GlassCard>
          <p className="kicker">Agent Profile</p>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Personality",     value: agent.personality,      cap: true },
              { label: "Level",           value: `${agent.level} · ${agent.xp?.toLocaleString() ?? "—"} XP` },
              { label: "Skills",          value: agent.skills?.join(", ").replace(/_/g, " ") || "—", lower: true },
              { label: "Strategy Hash",   value: agent.strategy_hash || "—" },
              { label: "NFT ID",          value: agent.nft_id || "—" },
              { label: "Owner",           value: agent.owner || "—" },
            ].map(({ label, value, cap, lower }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>
                <span className="mono muted" style={{ fontSize: 11, flexShrink: 0 }}>{label}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--color-cream)", textAlign: "right", textTransform: cap ? "capitalize" : lower ? "lowercase" : "none", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.section>

      {/* ── skills ── */}
      {agent.skills?.length > 0 && (
        <motion.section
          className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.interactive / 1000 }}
        >
          <GlassCard>
            <p className="kicker" style={{ marginBottom: 12 }}>Active Skills</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {agent.skills.map((sk) => (
                <div
                  key={sk}
                  style={{ padding: "8px 16px", border: "1px solid var(--color-border)", borderRadius: 2, background: "var(--color-raised)" }}
                >
                  <span className="mono" style={{ fontSize: 11, color: "var(--color-ivory)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    {sk.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.section>
      )}

      {/* ── recent matches ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.interactive / 1000 + 0.1 }}
        style={{ marginBottom: 48 }}
      >
        <GlassCard>
          <p className="kicker" style={{ marginBottom: 12 }}>Recent Match History</p>
          {(!agent.recent_matches || agent.recent_matches.length === 0) ? (
            <p className="mono muted" style={{ fontSize: 12, padding: "16px 0" }}>No match history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Match ID", "Result", "Opponent", "Game", "ELO Δ", "Date"].map((col) => (
                      <th key={col} className="mono muted" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "left", paddingBottom: 8, paddingRight: 16 }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agent.recent_matches.map((m, i) => (
                    <motion.tr
                      key={m.match_id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      style={{ borderBottom: "1px solid rgba(58,50,40,0.3)" }}
                    >
                      <td className="mono" style={{ fontSize: 11, color: "var(--color-stone)", paddingTop: 10, paddingBottom: 10, paddingRight: 16 }}>
                        #{m.match_id}
                      </td>
                      <td style={{ paddingTop: 10, paddingBottom: 10, paddingRight: 16 }}>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: resultColor(m.result), letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {m.result}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: 11, color: "var(--color-ivory)", paddingTop: 10, paddingBottom: 10, paddingRight: 16 }}>
                        {m.opponent}
                      </td>
                      <td className="mono" style={{ fontSize: 11, color: "var(--color-cream)", paddingTop: 10, paddingBottom: 10, paddingRight: 16 }}>
                        {m.game}
                      </td>
                      <td className="mono" style={{ fontSize: 12, fontWeight: 600, color: m.elo_delta >= 0 ? "var(--color-teal)" : "var(--color-red)", paddingTop: 10, paddingBottom: 10, paddingRight: 16 }}>
                        {m.elo_delta >= 0 ? "+" : ""}{m.elo_delta}
                      </td>
                      <td className="mono muted" style={{ fontSize: 10, paddingTop: 10, paddingBottom: 10 }}>
                        {new Date(m.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.section>

      {/* ── footer CTAs ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.interactive / 1000 + 0.2 }}
        style={{ display: "flex", gap: 12, marginBottom: 64, flexWrap: "wrap" }}
      >
        <Link href="/leaderboard" className="btn" style={{ fontSize: 13 }}>
          ← Global Rankings
        </Link>
        <Link href="/agents" className="btn" style={{ fontSize: 13 }}>
          All Agents
        </Link>
        <Link href={`/agents/${id}/stats`} className="btn btn-primary" style={{ fontSize: 13 }}>
          Full Career Stats →
        </Link>
      </motion.section>
    </div>
  );
}
