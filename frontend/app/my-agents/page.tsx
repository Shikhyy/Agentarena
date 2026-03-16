"use client";

import { useEffect, useState } from "react";
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
import { useAgentStore } from "@/lib/stores/index";
import { apiGet } from "@/lib/api";

/* ── types ──────────────────────────────────────────────────── */

interface AgentProfile {
  agent_id: string;
  name: string;
  personality: string;
  skills: string[];
  level: number;
  xp: number;
  elo: number;
  wins: number;
  losses: number;
  status: string;
  win_rate?: number;
  elo_history?: number[];
  arena_earned?: number;
}

type Filter = "all" | "live" | "idle" | "thinking";

/* ── helpers ─────────────────────────────────────────────────── */

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

type CardAccent = "gold" | "teal" | "amber" | "danger";
function personalityAccent(p: string): CardAccent {
  switch (p) {
    case "aggressive":   return "amber";
    case "adaptive":     return "teal";
    case "chaotic":      return "danger";
    default:             return "gold";
  }
}

/* ── agent card ─────────────────────────────────────────────── */

function AgentBentoCard({ agent, i }: { agent: AgentProfile; i: number }) {
  const tierColor = eloTierColor(agent.elo);
  const games     = agent.wins + agent.losses;
  const winPct    = agent.win_rate != null ? Math.round(agent.win_rate * 100) : (games > 0 ? Math.round((agent.wins / games) * 100) : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: STAGGER.interactive / 1000 + i * 0.08 }}
    >
      <GlassCard accent={personalityAccent(agent.personality)}>
        {/* header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <HexPortrait
            name={agent.name}
            size={72}
            accent={tierColor}
            pulse={agent.status === "live"}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="display" style={{ fontSize: 26, margin: 0, lineHeight: 1 }}>{agent.name}</h3>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, border: "1px solid var(--color-border)", color: tierColor, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {eloTierLabel(agent.elo)}
              </span>
              <span className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, border: "1px solid var(--color-border)", color: "var(--color-stone)", textTransform: "capitalize" }}>
                {agent.personality}
              </span>
              <span className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, border: "1px solid var(--color-border)", color: "var(--color-stone)" }}>
                Lv {agent.level}
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={agent.status as any} />
            </div>
          </div>
        </div>

        <BrassRule label="—" />

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { label: "ELO",   value: <EloCounter value={agent.elo} accent={tierColor} size="sm" /> },
            { label: "Win %", value: <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ivory)" }}>{winPct}%</span> },
            { label: "Games", value: <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ivory)" }}>{games}</span> },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center", padding: "8px 4px", background: "var(--color-raised)", borderRadius: 3 }}>
              {value}
              <p className="mono muted" style={{ fontSize: 9, marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* mini sparkline */}
        {agent.elo_history && agent.elo_history.length > 2 && (
          <div style={{ marginBottom: 12 }}>
            <ELOSparkline history={agent.elo_history} height={40} color={tierColor} interactive={false} />
          </div>
        )}

        {/* skills */}
        {agent.skills?.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
            {agent.skills.slice(0, 4).map((sk) => (
              <span key={sk} className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, border: "1px solid var(--color-border)", color: "var(--color-stone)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {sk.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link href={`/agents/${agent.agent_id}`} className="btn" style={{ display: "inline-block", fontSize: 12, width: "100%", textAlign: "center" }}>
          View Dossier →
        </Link>
      </GlassCard>
    </motion.div>
  );
}

/* ── empty state ─────────────────────────────────────────────── */

function EmptyRoster() {
  return (
    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "64px 0" }}>
      <p className="display" style={{ fontSize: 32, marginBottom: 12 }}>No Agents Yet</p>
      <p className="narrative" style={{ opacity: 0.6, marginBottom: 24 }}>
        Your roster awaits. Forge your first agent in the Workshop.
      </p>
      <Link href="/world/workshop" className="btn btn-primary" style={{ fontSize: 13 }}>
        Enter the Workshop →
      </Link>
    </div>
  );
}

/* ── skeleton ─────────────────────────────────────────────────── */

function AgentCardSkeleton() {
  return (
    <GlassCard noHover>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-raised)", opacity: 0.6, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 24, width: "55%", borderRadius: 3, background: "var(--color-raised)", marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {[50, 60, 40].map((w, j) => (
              <div key={j} style={{ height: 16, width: w, borderRadius: 2, background: "var(--color-raised)", opacity: 0.7 }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "var(--color-border)", margin: "12px 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
        {[0,1,2].map((j) => (
          <div key={j} style={{ height: 48, borderRadius: 3, background: "var(--color-raised)", opacity: 0.5 }} />
        ))}
      </div>
      <div style={{ height: 32, borderRadius: 2, background: "var(--color-raised)", opacity: 0.4 }} />
    </GlassCard>
  );
}

/* ── page ────────────────────────────────────────────────────── */

export default function MyAgentsPage() {
  const [filter, setFilter]   = useState<Filter>("all");
  const [wallet, setWallet]   = useState<string | null>(null);

  // Read wallet from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("agentarena_token");
    setWallet(token);
  }, []);

  // Sync to Zustand agent store
  const { fetchMyAgents, myAgents: storeAgents } = useAgentStore();

  const { data, isLoading, isError, refetch } = useQuery<AgentProfile[]>({
    queryKey: ["my-agents", wallet],
    queryFn: () => apiGet<{ agents: AgentProfile[] }>("/agents/my").then((r) => r.agents ?? (r as unknown as AgentProfile[])),
    enabled: true,
    retry: 1,
  });

  // Sync to Zustand store whenever data arrives
  useEffect(() => {
    if (data && wallet) fetchMyAgents(wallet);
  }, [data, wallet, fetchMyAgents]);

  const agents: AgentProfile[] = isError || (!isLoading && !data) ? storeAgents : (data ?? []);

  const filtered = agents.filter((a) => filter === "all" || a.status === filter);

  const totalElo   = agents.reduce((s, a) => s + a.elo, 0);
  const avgElo     = agents.length ? Math.round(totalElo / agents.length) : 0;
  const totalWins  = agents.reduce((s, a) => s + a.wins, 0);
  const totalGames = agents.reduce((s, a) => s + a.wins + a.losses, 0);
  const liveCount  = agents.filter((a) => a.status === "live").length;

  return (
    <div className="page">
      {/* ── header ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000 }}
      >
        <p className="subline" style={{ marginBottom: 4 }}>
          Collection · My Agents
          {isError && (
            <span style={{ color: "var(--color-amber)", marginLeft: 10, fontSize: 9 }}>
              · offline — showing store data
            </span>
          )}
        </p>
        <h2 className="display" style={{ fontSize: 48, margin: "0 0 8px" }}>Agent Roster</h2>
        <p className="narrative" style={{ opacity: 0.6, maxWidth: 480 }}>
          {wallet
            ? `Wallet: ${wallet.slice(0, 6)}…${wallet.slice(-4)}`
            : "Connect wallet to see your agents on-chain."}
        </p>
      </motion.section>

      {/* ── roster stats ── */}
      <motion.section
        className="section grid grid-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.pills / 1000 }}
      >
        {[
          { label: "Roster Size",  value: isLoading ? "—" : agents.length,               color: "var(--color-ivory)" },
          { label: "Active Now",   value: isLoading ? "—" : liveCount,                    color: "var(--color-teal)" },
          { label: "Avg ELO",      value: isLoading ? "—" : avgElo,                       color: "var(--color-gold)" },
          { label: "Total Wins",   value: isLoading ? "—" : totalWins.toLocaleString(),   color: "var(--color-amber)" },
        ].map((s) => (
          <GlassCard key={s.label} noHover>
            <p className="kicker">{s.label}</p>
            <p className="k-value" style={{ color: s.color }}>{s.value}</p>
          </GlassCard>
        ))}
      </motion.section>

      {/* ── filter + action row ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.pills / 1000 + 0.1 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
      >
        <div className="nav-row">
          {(["all", "live", "thinking", "idle"] as Filter[]).map((f) => (
            <span
              key={f}
              className={`nav-pill${filter === f ? " active" : ""}`}
              style={{ cursor: "pointer", textTransform: "capitalize" }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f}
              {f !== "all" && (
                <span className="mono" style={{ marginLeft: 4, fontSize: 9, opacity: 0.6 }}>
                  ({agents.filter((a) => a.status === f).length})
                </span>
              )}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => refetch()} className="btn" style={{ fontSize: 11 }}>
            ↻ Refresh
          </button>
          <Link href="/world/workshop" className="btn btn-primary" style={{ fontSize: 11 }}>
            + New Agent
          </Link>
        </div>
      </motion.section>

      {/* ── bento grid ── */}
      <section className="section grid grid-3" style={{ marginBottom: 64 }}>
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <AgentCardSkeleton key={i} />)
          : filtered.length === 0
            ? <EmptyRoster />
            : filtered.map((agent, i) => (
                <AgentBentoCard key={agent.agent_id} agent={agent} i={i} />
              ))}
      </section>
    </div>
  );
}
