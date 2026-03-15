"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { SkillOrb } from "@/components/ui/SkillOrb";
import { ELOSparkline } from "@/components/ui/ELOSparkline";
import { STAGGER } from "@/lib/springs";

const agents = [
  { name: "ZEUS", elo: 2620, wr: "81%", tier: "Legendary", status: "Deployed", archetype: "Aggressive" },
  { name: "ORACLE", elo: 2578, wr: "79%", tier: "Veteran", status: "Active", archetype: "Adaptive" },
  { name: "TITAN", elo: 2539, wr: "76%", tier: "Veteran", status: "Active", archetype: "Balanced" },
  { name: "WISP", elo: 2398, wr: "66%", tier: "Contender", status: "Active", archetype: "Chaotic" },
  { name: "BLITZ", elo: 2345, wr: "63%", tier: "Contender", status: "Retired", archetype: "Aggressive" },
  { name: "SHADOW", elo: 2452, wr: "69%", tier: "Veteran", status: "Active", archetype: "Conservative" },
];

const matchHistory = [
  { result: "W", opponent: "ORACLE", game: "Chess", delta: "+18" },
  { result: "L", opponent: "SHADOW", game: "Poker", delta: "-10" },
  { result: "W", opponent: "WISP", game: "Trivia", delta: "+13" },
  { result: "W", opponent: "BLITZ", game: "Monopoly", delta: "+8" },
  { result: "L", opponent: "TITAN", game: "Chess", delta: "-6" },
];

type Filter = "all" | "active" | "deployed" | "retired" | "bankrupt";

const tierColor = (tier: string) => {
  switch (tier) {
    case "Legendary": return "var(--color-gold)";
    case "Veteran": return "var(--color-silver)";
    case "Contender": return "var(--color-teal-light)";
    default: return "var(--color-ash)";
  }
};

export default function MyAgentsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = agents.filter(
    (a) => filter === "all" || a.status.toLowerCase() === filter
  );

  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20">
      {/* Header */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.5 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-2">
          Collection · My Agents
        </p>
        <h2 className="font-display text-5xl text-[var(--color-ivory)] tracking-wide">
          Agent Roster
        </h2>
      </motion.section>

      {/* Filters */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.pills / 1000 }}
      >
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "deployed", "retired", "bankrupt"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-heading tracking-[3px] uppercase border rounded transition-all duration-200 ${
                filter === f
                  ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                  : "border-[var(--color-border)] text-[var(--color-stone)] hover:border-[var(--color-gold-dim)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Hero Card — 8 cols */}
        <motion.div
          className="col-span-12 lg:col-span-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.secondary / 1000, duration: 0.5 }}
        >
          <GlassCard accent="gold" glowIntensity={0.4}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <HexPortrait name="ZEUS" size={120} accent="var(--color-gold)" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-5xl text-[var(--color-ivory)]">ZEUS</h3>
                  <span className="px-2 py-1 text-[9px] font-mono tracking-wider uppercase border border-[var(--color-gold-dim)] text-[var(--color-gold)] rounded">
                    Legendary
                  </span>
                  <span className="px-2 py-1 text-[9px] font-mono tracking-wider uppercase border border-[var(--color-border)] text-[var(--color-parchment)] rounded">
                    Aggressive
                  </span>
                </div>
                <div className="flex gap-4 font-mono text-sm text-[var(--color-stone)] mb-3">
                  <span>ELO <strong className="text-[var(--color-ivory)]">2620</strong></span>
                  <span>Win Rate <strong className="text-[var(--color-teal-light)]">81%</strong></span>
                  <span>Lvl <strong className="text-[var(--color-gold)]">47</strong></span>
                </div>
                <div className="max-w-[280px] mb-3">
                  <ELOSparkline history={[2378, 2401, 2423, 2478, 2512, 2556, 2612]} color="var(--color-gold)" />
                </div>
                {/* Form dots */}
                <div className="flex gap-1 mb-3">
                  {["W","W","L","W","W","L","W","W","W","L"].map((r, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: r === "W" ? "var(--color-teal-light)" : "var(--color-red-bright)" }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="font-heading text-[10px] tracking-[4px] uppercase bg-[var(--color-gold)] text-[var(--color-ink)] px-6 py-2.5 hover:bg-[var(--color-gold-light)] hover:shadow-[var(--shadow-gold)] active:scale-[0.97] transition-all duration-200">
                    Deploy
                  </button>
                  <button className="font-mono text-[9px] tracking-[2px] uppercase bg-[var(--color-red)] text-[var(--color-ivory)] px-4 py-2.5 hover:bg-[var(--color-red-bright)] transition-colors duration-150">
                    Retire
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Card — 4 cols */}
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.secondary / 1000 + 0.1, duration: 0.5 }}
        >
          <GlassCard glowIntensity={0.2}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">Quick Stats</p>
            <div className="space-y-4">
              <div>
                <p className="font-mono text-3xl font-bold text-[var(--color-gold)]">1.2M</p>
                <p className="font-mono text-[9px] text-[var(--color-stone)] tracking-wider">TOTAL ARENA EARNED</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-[var(--color-teal-light)]">71%</p>
                <p className="font-mono text-[9px] text-[var(--color-stone)] tracking-wider">CAREER WIN RATE</p>
              </div>
              <div>
                <p className="font-heading text-2xl text-[var(--color-ivory)]">Chess</p>
                <p className="font-mono text-[9px] text-[var(--color-stone)] tracking-wider">BEST GAME MODE</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Match History — 6 cols */}
        <motion.div
          className="col-span-12 lg:col-span-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.interactive / 1000, duration: 0.5 }}
        >
          <GlassCard glowIntensity={0.2}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">Match History</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-rim)]">
                  {["Result", "Opponent", "Game", "ELO Δ"].map((col) => (
                    <th key={col} className="py-2 font-mono text-[9px] tracking-wider uppercase text-[var(--color-ash)] text-left">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matchHistory.map((m, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)]/20">
                    <td className="py-2.5">
                      <span
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          color: m.result === "W" ? "var(--color-teal-light)" : "var(--color-red-bright)",
                          background: m.result === "W" ? "rgba(74,140,134,0.15)" : "rgba(196,48,48,0.15)",
                        }}
                      >
                        {m.result}
                      </span>
                    </td>
                    <td className="py-2.5 font-heading text-sm text-[var(--color-parchment)]">{m.opponent}</td>
                    <td className="py-2.5 font-mono text-xs text-[var(--color-stone)]">{m.game}</td>
                    <td className="py-2.5 font-mono text-sm font-bold" style={{
                      color: m.delta.startsWith("+") ? "var(--color-gold)" : "var(--color-red-bright)"
                    }}>
                      {m.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>

        {/* ELO Chart — 6 cols */}
        <motion.div
          className="col-span-12 lg:col-span-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.1, duration: 0.5 }}
        >
          <GlassCard glowIntensity={0.2}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">ELO History · 30 Days</p>
            <ELOSparkline
              history={[2220, 2254, 2268, 2300, 2332, 2390, 2412, 2480, 2520, 2612]}
              color="var(--color-gold)"
            />
          </GlassCard>
        </motion.div>

        {/* Skill Loadout — 4 cols */}
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.2, duration: 0.5 }}
        >
          <GlassCard glowIntensity={0.2}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">Skill Loadout</p>
            <div className="flex gap-4 mb-3">
              <SkillOrb skillType="tempo" equipped />
              <SkillOrb skillType="risk" equipped />
              <SkillOrb skillType="bluff" />
            </div>
            <button className="font-mono text-[8px] tracking-[2px] text-[var(--color-stone)] hover:text-[var(--color-gold)] transition-colors">
              Browse Market →
            </button>
          </GlassCard>
        </motion.div>

        {/* Agent Collection Grid — full width */}
        <motion.div
          className="col-span-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.3, duration: 0.5 }}
        >
          <GlassCard glowIntensity={0.15}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">Agent Collection</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {filtered.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded bg-[var(--color-surface)]/50 hover:border-[var(--color-gold-dim)] hover:bg-[var(--color-raised)]/50 transition-all cursor-pointer"
                >
                  <HexPortrait name={agent.name} size={48} accent={tierColor(agent.tier)} />
                  <div>
                    <p className="font-heading text-sm text-[var(--color-ivory)]">{agent.name}</p>
                    <p className="font-mono text-[9px] text-[var(--color-stone)]">{agent.elo} · {agent.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
