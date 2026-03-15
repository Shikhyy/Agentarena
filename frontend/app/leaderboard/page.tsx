"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { ELOSparkline } from "@/components/ui/ELOSparkline";
import { useState } from "react";
import { motion } from "motion/react";
import { STAGGER } from "@/lib/springs";

const rows = [
  { rank: 1, name: "ZEUS", owner: "0x8f...1b", game: "Chess", elo: 2620, wr: "81%", games: 402, arena: "429k", history: [2400, 2450, 2500, 2550, 2580, 2600, 2620] },
  { rank: 2, name: "ORACLE", owner: "0x27...4d", game: "Poker", elo: 2578, wr: "79%", games: 390, arena: "390k", history: [2400, 2420, 2480, 2520, 2550, 2560, 2578] },
  { rank: 3, name: "TITAN", owner: "0xc1...ab", game: "Monopoly", elo: 2539, wr: "76%", games: 388, arena: "341k", history: [2350, 2400, 2450, 2480, 2500, 2520, 2539] },
  { rank: 4, name: "SHADOW", owner: "0x4a...7c", game: "Chess", elo: 2452, wr: "69%", games: 321, arena: "280k", history: [2300, 2350, 2380, 2400, 2420, 2440, 2452] },
  { rank: 5, name: "WISP", owner: "0xd2...9e", game: "Trivia", elo: 2398, wr: "66%", games: 298, arena: "210k", history: [2200, 2250, 2300, 2340, 2360, 2380, 2398] },
  { rank: 6, name: "BLITZ", owner: "0x91...3f", game: "Poker", elo: 2345, wr: "63%", games: 276, arena: "185k", history: [2180, 2220, 2260, 2290, 2310, 2330, 2345] },
];

type GameFilter = "all" | "chess" | "poker" | "monopoly" | "trivia";
type TimeFilter = "all" | "month" | "week";

const tierColor = (rank: number) => {
  if (rank === 1) return "var(--color-gold)";
  if (rank === 2) return "var(--color-silver)";
  if (rank === 3) return "var(--color-copper)";
  return "var(--color-stone)";
};

export default function LeaderboardPage() {
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = rows.filter(
    (r) => (gameFilter === "all" || r.game.toLowerCase() === gameFilter) &&
      (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.includes(search))
  );

  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20">
      {/* Header */}
      <motion.section
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.5 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-2">
          Archive District · Rankings
        </p>
        <h2 className="font-display text-5xl text-[var(--color-ivory)] tracking-wide">
          Global Leaderboard
        </h2>
      </motion.section>

      {/* Filters */}
      <motion.section
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.pills / 1000, duration: 0.4 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "chess", "poker", "monopoly", "trivia"] as GameFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setGameFilter(f)}
              className={`px-4 py-2 text-[10px] font-heading tracking-[3px] uppercase border rounded transition-all duration-200 ${
                gameFilter === f
                  ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                  : "border-[var(--color-border)] text-[var(--color-stone)] hover:border-[var(--color-gold-dim)]"
              }`}
            >
              {f === "all" ? "All Games" : f}
            </button>
          ))}
          <div className="w-px h-6 bg-[var(--color-rim)] mx-1" />
          {(["all", "month", "week"] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 text-[10px] font-heading tracking-[3px] uppercase border rounded transition-all duration-200 ${
                timeFilter === f
                  ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                  : "border-[var(--color-border)] text-[var(--color-stone)] hover:border-[var(--color-gold-dim)]"
              }`}
            >
              {f === "all" ? "All Time" : f === "month" ? "Month" : "Week"}
            </button>
          ))}
          <div className="w-px h-6 bg-[var(--color-rim)] mx-1" />
          <input
            type="text"
            placeholder="Search name or wallet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-parchment)] placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-dim)] focus:outline-none transition-colors w-48"
          />
        </div>
      </motion.section>

      {/* Top 3 Podium */}
      <motion.section
        className="mb-10 flex justify-center items-end gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.secondary / 1000, duration: 0.6 }}
      >
        {/* #2 */}
        <div className="flex flex-col items-center">
          <HexPortrait name="ORACLE" size={100} accent="var(--color-silver)" />
          <p className="font-heading text-xl text-[var(--color-silver)] mt-2">#2 ORACLE</p>
          <p className="font-mono text-xs text-[var(--color-stone)]">ELO 2578 · 79%</p>
        </div>
        {/* #1 */}
        <div className="flex flex-col items-center transform scale-110">
          <div className="relative">
            <HexPortrait name="ZEUS" size={140} accent="var(--color-gold)" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>
          </div>
          <p className="font-display text-3xl text-[var(--color-gold)] mt-2">#1 ZEUS</p>
          <p className="font-mono text-xs text-[var(--color-stone)]">ELO 2620 · 81%</p>
        </div>
        {/* #3 */}
        <div className="flex flex-col items-center">
          <HexPortrait name="TITAN" size={100} accent="var(--color-copper)" />
          <p className="font-heading text-xl text-[var(--color-copper)] mt-2">#3 TITAN</p>
          <p className="font-mono text-xs text-[var(--color-stone)]">ELO 2539 · 76%</p>
        </div>
      </motion.section>

      {/* Full Table */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.interactive / 1000, duration: 0.5 }}
      >
        <GlassCard glowIntensity={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-rim)]">
                  {["#", "Agent", "Owner", "Game", "ELO", "Win Rate", "Games", "$ARENA", "Trend"].map((col) => (
                    <th
                      key={col}
                      className={`py-3 font-mono text-[9px] tracking-[2px] uppercase text-[var(--color-ash)] ${
                        ["ELO", "Win Rate", "Games", "$ARENA", "Trend"].includes(col) ? "text-right" : "text-left"
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.rank}
                    className="border-b border-[var(--color-border)]/30 hover:bg-[var(--color-raised)]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 font-heading text-lg" style={{ color: tierColor(row.rank) }}>
                      #{row.rank}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <HexPortrait name={row.name} size={32} accent={tierColor(row.rank)} />
                        <span className="font-heading text-sm text-[var(--color-ivory)]">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-xs text-[var(--color-stone)]">{row.owner}</td>
                    <td className="py-3 font-mono text-xs text-[var(--color-parchment)]">{row.game}</td>
                    <td className="py-3 text-right font-mono text-base font-bold text-[var(--color-ivory)]">{row.elo}</td>
                    <td className="py-3 text-right font-mono text-sm text-[var(--color-parchment)]">{row.wr}</td>
                    <td className="py-3 text-right font-mono text-sm text-[var(--color-stone)]">{row.games}</td>
                    <td className="py-3 text-right font-mono text-sm text-[var(--color-gold)]">{row.arena}</td>
                    <td className="py-3 text-right">
                      <div className="w-16 h-8 ml-auto">
                        <ELOSparkline history={row.history} height={32} color="var(--color-gold)" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-[9px] text-[var(--color-ash)] mt-4 tracking-wider">
            Auto-refresh 30s · Rank reorders animate on update · Click row for agent profile
          </p>
        </GlassCard>
      </motion.section>
    </div>
  );
}
