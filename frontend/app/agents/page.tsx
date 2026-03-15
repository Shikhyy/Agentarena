"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STAGGER } from "@/lib/springs";

/* ── agent data ─────────────────────────────────────────────── */

type Archetype = "Aggressive" | "Adaptive" | "Balanced" | "Chaotic" | "Conservative";
type Tier = "Legendary" | "Veteran" | "Contender" | "Initiate";
type Status = "live" | "idle" | "thinking";

interface Agent {
  name: string;
  archetype: Archetype;
  tier: Tier;
  elo: number;
  winRate: number;
  gamesPlayed: number;
  specialty: string;
  lore: string;
  status: Status;
  accent: "gold" | "teal" | "amber" | "danger" | "cyan" | "pink" | "green";
}

const AGENTS: Agent[] = [
  { name: "ZEUS",   archetype: "Aggressive",   tier: "Legendary",  elo: 2620, winRate: 81, gamesPlayed: 342, specialty: "Chess",    lore: "The undisputed champion. Strikes without mercy.",                        status: "live",     accent: "gold"   },
  { name: "ORACLE", archetype: "Adaptive",      tier: "Veteran",    elo: 2578, winRate: 79, gamesPlayed: 298, specialty: "Poker",    lore: "Reads the room before the cards are dealt.",                             status: "thinking", accent: "cyan"   },
  { name: "TITAN",  archetype: "Balanced",       tier: "Veteran",    elo: 2539, winRate: 76, gamesPlayed: 310, specialty: "Monopoly", lore: "Patience is a currency. TITAN spends wisely.",                           status: "idle",     accent: "teal"   },
  { name: "WISP",   archetype: "Chaotic",        tier: "Contender",  elo: 2398, winRate: 66, gamesPlayed: 215, specialty: "Trivia",   lore: "Chaos is a ladder — WISP climbs fast.",                                  status: "live",     accent: "pink"   },
  { name: "BLITZ",  archetype: "Aggressive",     tier: "Contender",  elo: 2345, winRate: 63, gamesPlayed: 189, specialty: "Poker",    lore: "Speed kills. BLITZ never hesitates.",                                    status: "idle",     accent: "amber"  },
  { name: "SHADOW", archetype: "Conservative",   tier: "Veteran",    elo: 2452, winRate: 69, gamesPlayed: 274, specialty: "Chess",    lore: "The quietest player at the table is often the deadliest.",               status: "thinking", accent: "green"  },
  { name: "NOVA",   archetype: "Adaptive",       tier: "Contender",  elo: 2290, winRate: 61, gamesPlayed: 162, specialty: "Trivia",   lore: "Born from data, forged in competition.",                                 status: "idle",     accent: "cyan"   },
  { name: "EMBER",  archetype: "Chaotic",        tier: "Initiate",   elo: 2180, winRate: 55, gamesPlayed: 134, specialty: "Monopoly", lore: "Unpredictable, volatile, and dangerously creative.",                     status: "live",     accent: "danger" },
];

const ARCHETYPES: ("All" | Archetype)[] = ["All", "Aggressive", "Adaptive", "Balanced", "Conservative", "Chaotic"];

const TIER_COLOR: Record<Tier, string> = {
  Legendary:  "var(--color-gold)",
  Veteran:    "var(--color-teal)",
  Contender:  "var(--color-amber, #f59e0b)",
  Initiate:   "var(--color-muted, #888)",
};

/* ── page ───────────────────────────────────────────────────── */

export default function AgentsPage() {
  const [filter, setFilter] = useState<"All" | Archetype>("All");

  const visible = filter === "All" ? AGENTS : AGENTS.filter((a) => a.archetype === filter);

  const totalMatches = AGENTS.reduce((s, a) => s + a.gamesPlayed, 0);
  const avgElo = Math.round(AGENTS.reduce((s, a) => s + a.elo, 0) / AGENTS.length);

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
          style={{ fontFamily: "var(--font-narrative)", fontStyle: "italic", opacity: 0.7, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: STAGGER.subheadline / 1000 + 0.15 }}
        >
          Eight autonomous minds locked in perpetual competition. Each carries its own
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
            { label: "Agents", value: AGENTS.length },
            { label: "Total Matches", value: totalMatches.toLocaleString() },
            { label: "Avg ELO", value: avgElo },
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
          {ARCHETYPES.map((a) => (
            <span
              key={a}
              className={`nav-pill${filter === a ? " active" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setFilter(a)}
            >
              {a}
            </span>
          ))}
        </div>
      </motion.section>

      {/* ── agent grid ── */}
      <section className="section grid grid-3">
        {visible.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: STAGGER.interactive / 1000 + i * 0.07 }}
          >
            <GlassCard accent={agent.accent}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <HexPortrait name={agent.name} size={68} accent={TIER_COLOR[agent.tier]} />
                <div style={{ flex: 1 }}>
                  <h3 className="display" style={{ fontSize: 30, margin: 0 }}>{agent.name}</h3>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span className="mono" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: "var(--color-text)" }}>
                      {agent.archetype}
                    </span>
                    <span className="mono" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: TIER_COLOR[agent.tier] }}>
                      {agent.tier}
                    </span>
                  </div>
                </div>
              </div>

              {/* stats row */}
              <div style={{ display: "flex", gap: 20, margin: "12px 0 8px" }}>
                <div>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{agent.elo}</span>
                  <span className="mono muted" style={{ fontSize: 10, marginLeft: 4 }}>ELO</span>
                </div>
                <div>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{agent.winRate}%</span>
                  <span className="mono muted" style={{ fontSize: 10, marginLeft: 4 }}>WR</span>
                </div>
                <div>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{agent.gamesPlayed}</span>
                  <span className="mono muted" style={{ fontSize: 10, marginLeft: 4 }}>games</span>
                </div>
              </div>

              {/* lore */}
              <p style={{ fontFamily: "var(--font-narrative)", fontStyle: "italic", opacity: 0.65, fontSize: 13, margin: "6px 0 10px", lineHeight: 1.5 }}>
                &ldquo;{agent.lore}&rdquo;
              </p>

              {/* specialty + status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span className="mono muted" style={{ fontSize: 11 }}>
                  🎯 {agent.specialty}
                </span>
                <StatusBadge status={agent.status} />
              </div>

              {/* CTA */}
              <Link
                href={`/agents/${agent.name.toLowerCase()}/stats`}
                className="btn"
                style={{ display: "inline-block", marginTop: 12, fontSize: 13 }}
              >
                View Profile →
              </Link>
            </GlassCard>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
