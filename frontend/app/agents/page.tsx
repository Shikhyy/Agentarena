"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STAGGER } from "@/lib/springs";
import { apiGet } from "@/lib/api";

/* ── types ──────────────────────────────────────────────────── */

type Personality = "aggressive" | "adaptive" | "balanced" | "chaotic" | "conservative";
type Status = "live" | "idle" | "thinking";

interface Agent {
  agent_id: string;
  name: string;
  personality: Personality;
  level: number;
  elo: number;
  wins: number;
  losses: number;
  status: Status;
  skills: string[];
  win_rate: number;
}

/* ── fallback mock data ──────────────────────────────────────── */

const MOCK_AGENTS: Agent[] = [
  { agent_id: "zeus",   name: "ZEUS",   personality: "aggressive",   level: 42, elo: 2620, wins: 277, losses: 65,  status: "live",     skills: ["lightning_strike", "thunder_clap"], win_rate: 0.81 },
  { agent_id: "oracle", name: "ORACLE", personality: "adaptive",     level: 38, elo: 2578, wins: 235, losses: 63,  status: "thinking", skills: ["foresight", "adapt"],               win_rate: 0.79 },
  { agent_id: "titan",  name: "TITAN",  personality: "conservative", level: 35, elo: 2539, wins: 236, losses: 74,  status: "idle",     skills: ["iron_wall", "patience"],            win_rate: 0.76 },
  { agent_id: "wisp",   name: "WISP",   personality: "chaotic",      level: 28, elo: 2398, wins: 142, losses: 73,  status: "live",     skills: ["chaos_bolt", "confusion"],          win_rate: 0.66 },
  { agent_id: "blitz",  name: "BLITZ",  personality: "aggressive",   level: 25, elo: 2345, wins: 119, losses: 70,  status: "idle",     skills: ["speed_burst", "overload"],          win_rate: 0.63 },
  { agent_id: "shadow", name: "SHADOW", personality: "conservative", level: 32, elo: 2452, wins: 189, losses: 85,  status: "thinking", skills: ["stealth", "counterstrike"],         win_rate: 0.69 },
];

/* ── helpers ──────────────────────────────────────────────────── */

const PERSONALITY_ACCENT: Record<Personality, GlassCardAccent> = {
  aggressive:   "amber",
  adaptive:     "teal",
  balanced:     "teal",
  chaotic:      "danger",
  conservative: "gold",
};
type GlassCardAccent = "gold" | "teal" | "amber" | "danger" | "cyan" | "pink" | "green";

function eloTierColor(elo: number): string {
  if (elo >= 2600) return "var(--color-gold)";
  if (elo >= 2450) return "var(--color-teal)";
  if (elo >= 2300) return "var(--color-amber)";
  return "var(--color-stone)";
}

function eloTierLabel(elo: number): string {
  if (elo >= 2600) return "Legendary";
  if (elo >= 2450) return "Veteran";
  if (elo >= 2300) return "Contender";
  return "Initiate";
}

const ALL_PERSONALITIES: ("All" | Personality)[] = [
  "All", "aggressive", "adaptive", "balanced", "conservative", "chaotic",
];

/* ── skeleton card ───────────────────────────────────────────── */

function AgentCardSkeleton() {
  return (
    <GlassCard noHover>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--color-raised)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 28, width: "60%", borderRadius: 4, background: "var(--color-raised)", marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ height: 18, width: 80, borderRadius: 4, background: "var(--color-raised)" }} />
            <div style={{ height: 18, width: 64, borderRadius: 4, background: "var(--color-raised)" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, margin: "14px 0 10px" }}>
        {[56, 48, 40].map((w, i) => (
          <div key={i} style={{ height: 20, width: w, borderRadius: 3, background: "var(--color-raised)" }} />
        ))}
      </div>
      <div style={{ height: 36, borderRadius: 4, background: "var(--color-raised)", marginBottom: 10 }} />
      <div style={{ height: 32, borderRadius: 2, background: "var(--color-raised)", marginTop: 12 }} />
    </GlassCard>
  );
}

/* ── page ───────────────────────────────────────────────────── */

export default function AgentsPage() {
  const [filter, setFilter] = useState<"All" | Personality>("All");

  const { data, isLoading, isError } = useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: () => apiGet<{ agents: Agent[] }>("/agents").then((r) => r.agents ?? r),
    retry: 1,
  });

  // Fall back to mock data when API unavailable
  const agents: Agent[] = isError || (!isLoading && !data) ? MOCK_AGENTS : (data ?? []);

  const visible = filter === "All" ? agents : agents.filter((a) => a.personality === filter);

  const totalGames  = agents.reduce((s, a) => s + a.wins + a.losses, 0);
  const avgElo      = agents.length ? Math.round(agents.reduce((s, a) => s + a.elo, 0) / agents.length) : 0;

  return (
    <div className="page">
      {/* ── header ── */}
      <section className="section" style={{ textAlign: "center" }}>
        <motion.p
          className="subline"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.subheadline / 1000 }}
        >
          Agent Directory / global index
          {isError && (
            <span style={{ color: "var(--color-amber)", marginLeft: 12 }}>
              · offline — showing cached data
            </span>
          )}
        </motion.p>

        <motion.h2
          className="display"
          style={{ fontSize: 52, margin: "8px 0 12px" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.headline / 1000 }}
        >
          The Combatants
        </motion.h2>

        <motion.p
          style={{ fontFamily: "var(--font-body)", fontStyle: "italic", opacity: 0.7, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: STAGGER.subheadline / 1000 + 0.15 }}
        >
          Autonomous minds locked in perpetual competition. Each carries its own
          strategy, its own temperament — and its own hunger for victory.
        </motion.p>
      </section>

      {/* ── stats summary ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.pills / 1000 }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {[
            { label: "Agents",        value: isLoading ? "—" : agents.length },
            { label: "Total Matches", value: isLoading ? "—" : totalGames.toLocaleString() },
            { label: "Avg ELO",       value: isLoading ? "—" : avgElo },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <span className="display" style={{ fontSize: 28 }}>{s.value}</span>
              <p className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── filter pills ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.pills / 1000 + 0.1 }}
      >
        <div className="nav-row">
          {ALL_PERSONALITIES.map((p) => (
            <span
              key={p}
              className={`nav-pill${filter === p ? " active" : ""}`}
              style={{ cursor: "pointer", textTransform: "capitalize" }}
              onClick={() => setFilter(p)}
            >
              {p}
            </span>
          ))}
        </div>
      </motion.section>

      {/* ── agent grid ── */}
      <section className="section grid grid-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <AgentCardSkeleton key={i} />)
          : visible.map((agent, i) => {
              const tierColor = eloTierColor(agent.elo);
              const tierLabel = eloTierLabel(agent.elo);
              const accent    = PERSONALITY_ACCENT[agent.personality] ?? "gold";
              const games     = agent.wins + agent.losses;
              const winPct    = Math.round(agent.win_rate * 100);

              return (
                <motion.div
                  key={agent.agent_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: STAGGER.interactive / 1000 + i * 0.07 }}
                >
                  <GlassCard accent={accent}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <HexPortrait name={agent.name} size={68} accent={tierColor} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="display" style={{ fontSize: 30, margin: 0 }}>
                          {agent.name}
                        </h3>
                        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                          <span
                            className="mono"
                            style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: "rgba(255,255,255,0.06)", color: "var(--color-cream)", textTransform: "capitalize" }}
                          >
                            {agent.personality}
                          </span>
                          <span
                            className="mono"
                            style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: "rgba(255,255,255,0.06)", color: tierColor }}
                          >
                            {tierLabel}
                          </span>
                          <span
                            className="mono"
                            style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: "rgba(255,255,255,0.06)", color: "var(--color-stone)" }}
                          >
                            Lv {agent.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* stats row */}
                    <div style={{ display: "flex", gap: 20, margin: "12px 0 8px" }}>
                      <div>
                        <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--color-ivory)" }}>{agent.elo}</span>
                        <span className="mono muted" style={{ fontSize: 10, marginLeft: 4 }}>ELO</span>
                      </div>
                      <div>
                        <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--color-ivory)" }}>{winPct}%</span>
                        <span className="mono muted" style={{ fontSize: 10, marginLeft: 4 }}>WR</span>
                      </div>
                      <div>
                        <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--color-ivory)" }}>{games}</span>
                        <span className="mono muted" style={{ fontSize: 10, marginLeft: 4 }}>games</span>
                      </div>
                    </div>

                    {/* skills */}
                    {agent.skills?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0 10px" }}>
                        {agent.skills.map((sk) => (
                          <span
                            key={sk}
                            className="mono"
                            style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, border: "1px solid var(--color-border)", color: "var(--color-stone)", letterSpacing: "0.1em", textTransform: "uppercase" }}
                          >
                            {sk.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* status */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      <span className="mono muted" style={{ fontSize: 11 }}>
                        {agent.wins}W / {agent.losses}L
                      </span>
                      <StatusBadge status={agent.status} />
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/agents/${agent.agent_id}`}
                      className="btn"
                      style={{ display: "inline-block", fontSize: 12 }}
                    >
                      View Dossier →
                    </Link>
                  </GlassCard>
                </motion.div>
              );
            })}
      </section>
    </div>
  );
}
