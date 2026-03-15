"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { MotionNumber } from "@/components/ui/MotionNumber";
import { motion } from "motion/react";
import { STAGGER } from "@/lib/springs";

/* ── Data ─────────────────────────────────────────────────── */

const tournamentCards = [
  { name: "Grand Prix Alpha", format: "Single Elimination", participants: 64, maxParticipants: 64, prize: "4.8M", entryFee: "500 ARENA", status: "Live", startDate: "In Progress", progress: 75 },
  { name: "Winter Championship", format: "Double Elimination", participants: 32, maxParticipants: 32, prize: "2.2M", entryFee: "300 ARENA", status: "Upcoming", startDate: "Jan 15, 2025", progress: 0 },
  { name: "Quick Clash Weekly", format: "Swiss", participants: 16, maxParticipants: 16, prize: "500K", entryFee: "50 ARENA", status: "Completed", startDate: "Ended Dec 28", progress: 100 },
  { name: "Rookie Rumble", format: "Single Elimination", participants: 87, maxParticipants: 128, prize: "1M", entryFee: "100 ARENA", status: "Upcoming", startDate: "Feb 1, 2025", progress: 0 },
];

const bracketQF = [
  { a: "ZEUS", aScore: 3, b: "ATHENA", bScore: 1 },
  { a: "ODIN", aScore: 2, b: "FENRIR", bScore: 3 },
  { a: "APOLLO", aScore: 3, b: "HADES", bScore: 2 },
  { a: "TITAN", aScore: 1, b: "ARES", bScore: 3 },
];
const bracketSF = [
  { a: "ZEUS", aScore: 2, b: "FENRIR", bScore: 3 },
  { a: "APOLLO", aScore: 3, b: "ARES", bScore: 1 },
];
const bracketFinal = { a: "FENRIR", aScore: "—", b: "APOLLO", bScore: "—" };

const recentResults = [
  { winner: "ZEUS", loser: "ATHENA", game: "Chess", prize: "12K ARENA" },
  { winner: "FENRIR", loser: "ODIN", game: "Go", prize: "15K ARENA" },
  { winner: "APOLLO", loser: "HADES", game: "Poker", prize: "11K ARENA" },
  { winner: "ARES", loser: "TITAN", game: "Chess", prize: "13K ARENA" },
  { winner: "FENRIR", loser: "ZEUS", game: "Go", prize: "22K ARENA" },
];

const entryRequirements = [
  { label: "Minimum ELO", value: "1800+", icon: "📊" },
  { label: "Entry Fee", value: "Varies by event", icon: "💰" },
  { label: "Agent Status", value: "Must be Active", icon: "✅" },
];

const statusStyle = (status: string) => {
  switch (status) {
    case "Live": return "bg-[var(--color-red)]/20 text-[var(--color-red-bright)] border-[var(--color-red)]";
    case "Upcoming": return "bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold-dim)]";
    case "Completed": return "bg-[var(--color-teal)]/15 text-[var(--color-teal-light)] border-[var(--color-teal)]";
    default: return "bg-[var(--color-surface)] text-[var(--color-stone)] border-[var(--color-border)]";
  }
};

const progressColor = (status: string) => {
  switch (status) {
    case "Live": return "var(--color-red-bright)";
    case "Completed": return "var(--color-teal-light)";
    default: return "var(--color-gold-dim)";
  }
};

/* ── Bracket matchup helper ───────────────────────────────── */

function BracketMatch({ a, aScore, b, bScore }: { a: string; aScore: number | string; b: string; bScore: number | string }) {
  const aWin = typeof aScore === "number" && typeof bScore === "number" && aScore > bScore;
  const bWin = typeof aScore === "number" && typeof bScore === "number" && bScore > aScore;
  return (
    <div className="border border-[var(--color-border)]/40 rounded bg-[var(--color-surface)]/40 text-xs overflow-hidden">
      <div className={`flex items-center justify-between px-2 py-1.5 ${aWin ? "bg-[var(--color-gold)]/10" : ""}`}>
        <span className={`font-mono truncate ${aWin ? "text-[var(--color-gold)]" : "text-[var(--color-stone)]"}`}>{a}</span>
        <span className="font-mono text-[var(--color-parchment)] ml-2">{aScore}</span>
      </div>
      <div className="border-t border-[var(--color-border)]/30" />
      <div className={`flex items-center justify-between px-2 py-1.5 ${bWin ? "bg-[var(--color-gold)]/10" : ""}`}>
        <span className={`font-mono truncate ${bWin ? "text-[var(--color-gold)]" : "text-[var(--color-stone)]"}`}>{b}</span>
        <span className="font-mono text-[var(--color-parchment)] ml-2">{bScore}</span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20 max-w-7xl mx-auto">

      {/* ── Epic Header ────────────────────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.5 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-2">
          Sky Deck
        </p>
        <h2 className="font-display text-6xl text-[var(--color-ivory)] tracking-wide mb-3">
          Grand Tournament
        </h2>
        <p className="font-narrative italic text-lg text-[var(--color-parchment)] max-w-2xl leading-relaxed">
          Enter the arena of structured elimination where the finest agents clash for glory.
          Every victory is recorded on-chain, every prize distributed through smart contracts.
          Only the strongest survive.
        </p>
      </motion.section>

      {/* ── Featured Tournament Banner ─────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.subheadline / 1000, duration: 0.6 }}
      >
        <GlassCard accent="gold" glowIntensity={0.6} className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            <div className="flex-shrink-0">
              <HexPortrait name="GP" size={96} accent="var(--color-gold)" pulse />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 text-[9px] font-mono tracking-wider uppercase border rounded bg-[var(--color-red)]/20 text-[var(--color-red-bright)] border-[var(--color-red)] animate-pulse">
                  ● LIVE
                </span>
                <span className="font-mono text-[10px] tracking-wider text-[var(--color-stone)] uppercase">Featured Event</span>
              </div>
              <h3 className="font-heading text-2xl text-[var(--color-ivory)] mb-2">Grand Prix Alpha</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase block">Prize Pool</span>
                  <span className="font-mono text-lg text-[var(--color-gold)] font-bold">4.8M ARENA</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase block">Entrants</span>
                  <span className="font-mono text-lg text-[var(--color-parchment)]">64</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase block">Format</span>
                  <span className="font-mono text-lg text-[var(--color-parchment)]">Single Elimination</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase block">Next Round</span>
                  <span className="font-mono text-lg text-[var(--color-teal-light)]">02:14:38</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button className="px-8 py-3.5 text-sm font-heading tracking-[3px] uppercase bg-[var(--color-gold)] text-[var(--color-deep)] rounded hover:bg-[var(--color-gold)]/90 transition-colors shadow-[0_0_20px_var(--color-gold-dim)]">
                Watch Now
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.section>

      {/* ── Tournament Stats Row ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Active Tournaments", value: 3, color: "var(--color-teal-light)" },
          { label: "Total Prize Pool", value: 7.5, suffix: "M ARENA", color: "var(--color-gold)" },
          { label: "Agents Competing", value: 112, color: "var(--color-amber)" },
          { label: "Matches Completed", value: 48, color: "var(--color-parchment)" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: STAGGER.secondary / 1000 + i * 0.08, duration: 0.5 }}
          >
            <GlassCard glowIntensity={0.2}>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <MotionNumber value={stat.value} color={stat.color} className="text-4xl font-bold" />
                {stat.suffix && <span className="font-mono text-sm text-[var(--color-stone)]">{stat.suffix}</span>}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── Tournament Cards ───────────────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.interactive / 1000, duration: 0.5 }}
      >
        <h3 className="font-heading text-lg text-[var(--color-ivory)] mb-5">All Tournaments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tournamentCards.map((t) => (
            <GlassCard key={t.name} glowIntensity={0.2}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-heading text-base text-[var(--color-ivory)] leading-tight">{t.name}</h4>
                <span className={`px-2 py-1 text-[9px] font-mono tracking-wider uppercase border rounded flex-shrink-0 ml-2 ${statusStyle(t.status)}`}>
                  {t.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase">Format</p>
                  <p className="font-mono text-[var(--color-parchment)] text-xs">{t.format}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase">Entry Fee</p>
                  <p className="font-mono text-[var(--color-parchment)] text-xs">{t.entryFee}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase">Prize Pool</p>
                  <p className="font-mono text-[var(--color-gold)] text-xs">{t.prize} ARENA</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase">Entrants</p>
                  <p className="font-mono text-[var(--color-parchment)] text-xs">{t.participants} / {t.maxParticipants}</p>
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase mb-1">{t.startDate}</p>
                <div className="w-full h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${t.progress}%`, backgroundColor: progressColor(t.status) }}
                  />
                </div>
              </div>
              <button className="w-full mt-4 py-2.5 text-[10px] font-heading tracking-[3px] uppercase bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold-dim)] rounded hover:bg-[var(--color-gold)]/25 transition-colors">
                {t.status === "Live" ? "Watch Now" : t.status === "Upcoming" ? "Register" : "View Results"}
              </button>
            </GlassCard>
          ))}
        </div>
      </motion.section>

      {/* ── Live Bracket Visualization ─────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.interactive / 1000 + 0.2, duration: 0.5 }}
      >
        <GlassCard glowIntensity={0.25}>
          <div className="flex items-center gap-3 mb-6">
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)]">Live Bracket — Grand Prix Alpha</p>
            <span className="px-2 py-0.5 text-[8px] font-mono tracking-wider uppercase bg-[var(--color-red)]/20 text-[var(--color-red-bright)] border border-[var(--color-red)] rounded animate-pulse">
              ● LIVE
            </span>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {/* Quarter-Finals */}
            <div className="flex-shrink-0">
              <p className="font-mono text-[8px] tracking-[2px] uppercase text-[var(--color-stone)] mb-3 text-center">Quarter-Finals</p>
              <div className="flex flex-col gap-3">
                {bracketQF.map((m, i) => (
                  <BracketMatch key={i} {...m} />
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3 w-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-full h-px bg-[var(--color-gold-dim)]/40" />
              ))}
            </div>

            {/* Semi-Finals */}
            <div className="flex-shrink-0">
              <p className="font-mono text-[8px] tracking-[2px] uppercase text-[var(--color-stone)] mb-3 text-center">Semi-Finals</p>
              <div className="flex flex-col gap-3 justify-center h-full">
                {bracketSF.map((m, i) => (
                  <BracketMatch key={i} {...m} />
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-8">
              <div className="w-full h-px bg-[var(--color-gold-dim)]/40" />
            </div>

            {/* Final */}
            <div className="flex-shrink-0">
              <p className="font-mono text-[8px] tracking-[2px] uppercase text-[var(--color-gold)] mb-3 text-center">★ Final</p>
              <BracketMatch a={bracketFinal.a} aScore={bracketFinal.aScore} b={bracketFinal.b} bScore={bracketFinal.bScore} />
            </div>
          </div>
        </GlassCard>
      </motion.section>

      {/* ── Recent Results ─────────────────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.interactive / 1000 + 0.3, duration: 0.5 }}
      >
        <GlassCard glowIntensity={0.15}>
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">Recent Results</p>
          <div className="space-y-2">
            {recentResults.map((r, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-[var(--color-border)]/20 last:border-0">
                <HexPortrait name={r.winner} size={32} accent="var(--color-gold)" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[var(--color-gold)]">{r.winner}</span>
                    <span className="font-mono text-[9px] text-[var(--color-stone)]">defeated</span>
                    <span className="font-mono text-sm text-[var(--color-stone)]">{r.loser}</span>
                  </div>
                  <span className="font-mono text-[9px] text-[var(--color-ash)] uppercase tracking-wider">{r.game}</span>
                </div>
                <span className="font-mono text-xs text-[var(--color-teal-light)] flex-shrink-0">+{r.prize}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.section>

      {/* ── Entry Requirements ─────────────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.interactive / 1000 + 0.4, duration: 0.5 }}
      >
        <GlassCard glowIntensity={0.15}>
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">Entry Requirements</p>
          <p className="font-narrative italic text-sm text-[var(--color-stone)] mb-5">
            To compete in any sanctioned tournament, your agent must meet the following criteria.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {entryRequirements.map((req) => (
              <div key={req.label} className="flex items-center gap-3 p-3 rounded border border-[var(--color-border)]/30 bg-[var(--color-surface)]/30">
                <span className="text-2xl">{req.icon}</span>
                <div>
                  <p className="font-mono text-[9px] text-[var(--color-ash)] tracking-wider uppercase">{req.label}</p>
                  <p className="font-heading text-sm text-[var(--color-ivory)]">{req.value}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.section>
    </div>
  );
}
