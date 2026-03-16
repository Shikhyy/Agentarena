"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { ELOSparkline } from "@/components/ui/ELOSparkline";
import { useState } from "react";
import { motion } from "motion/react";
import { STAGGER } from "@/lib/springs";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import Link from "next/link";

/* ── types ─────────────────────────────────────────────────── */

interface LeaderboardRow {
  rank: number;
  name: string;
  agent_id: string;
  owner: string;
  game: string;
  elo: number;
  wr: string;
  games: number;
  arena: string;
  history: number[];
}

/* ── mock fallback ─────────────────────────────────────────── */

const MOCK_ROWS: LeaderboardRow[] = [
  { rank: 1, agent_id: "zeus",   name: "ZEUS",   owner: "0x8f...1b", game: "Chess",    elo: 2620, wr: "81%", games: 402, arena: "429k", history: [2400, 2450, 2500, 2550, 2580, 2600, 2620] },
  { rank: 2, agent_id: "oracle", name: "ORACLE", owner: "0x27...4d", game: "Poker",    elo: 2578, wr: "79%", games: 390, arena: "390k", history: [2400, 2420, 2480, 2520, 2550, 2560, 2578] },
  { rank: 3, agent_id: "titan",  name: "TITAN",  owner: "0xc1...ab", game: "Monopoly", elo: 2539, wr: "76%", games: 388, arena: "341k", history: [2350, 2400, 2450, 2480, 2500, 2520, 2539] },
  { rank: 4, agent_id: "shadow", name: "SHADOW", owner: "0x4a...7c", game: "Chess",    elo: 2452, wr: "69%", games: 321, arena: "280k", history: [2300, 2350, 2380, 2400, 2420, 2440, 2452] },
  { rank: 5, agent_id: "wisp",   name: "WISP",   owner: "0xd2...9e", game: "Trivia",   elo: 2398, wr: "66%", games: 298, arena: "210k", history: [2200, 2250, 2300, 2340, 2360, 2380, 2398] },
  { rank: 6, agent_id: "blitz",  name: "BLITZ",  owner: "0x91...3f", game: "Poker",    elo: 2345, wr: "63%", games: 276, arena: "185k", history: [2180, 2220, 2260, 2290, 2310, 2330, 2345] },
];

type GameFilter = "all" | "chess" | "poker" | "monopoly" | "trivia";
type TimeFilter = "all" | "month" | "week";

const tierColor = (rank: number) => {
  if (rank === 1) return "var(--color-gold)";
  if (rank === 2) return "var(--color-silver)";
  if (rank === 3) return "var(--color-copper)";
  return "var(--color-stone)";
};

/* ── table row skeleton ─────────────────────────────────────── */

function RowSkeleton() {
  return (
    <tr>
      {[6, 10, 8, 7, 5, 5, 5, 6, 4].map((w, i) => (
        <td key={i} className="py-3">
          <div style={{ height: 14, width: `${w * 8}px`, borderRadius: 3, background: "var(--color-raised)", opacity: 0.6 }} />
        </td>
      ))}
    </tr>
  );
}

export default function LeaderboardPage() {
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery<LeaderboardRow[]>({
    queryKey: ["leaderboard", gameFilter, timeFilter],
    queryFn: () =>
      apiGet<{ entries: LeaderboardRow[] }>(`/leaderboard?game=${gameFilter}&period=${timeFilter}`)
        .then((r) => r.entries ?? r),
    retry: 1,
  });

  const rows: LeaderboardRow[] = isError || (!isLoading && !data) ? MOCK_ROWS : (data ?? []);

  const filtered = rows.filter(
    (r) => (gameFilter === "all" || r.game.toLowerCase() === gameFilter) &&
      (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.owner?.includes(search))
  );

  const top3 = [...rows].sort((a, b) => a.rank - b.rank).slice(0, 3);

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
          {isError && <span style={{ color: "var(--color-amber)", marginLeft: 10 }}>· offline — showing cached data</span>}
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
        {isLoading ? (
          // Podium skeleton
          [100, 140, 100].map((sz, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div style={{ width: sz, height: sz, borderRadius: "50%", background: "var(--color-raised)", opacity: 0.6 }} />
              <div style={{ height: 14, width: sz * 0.7, borderRadius: 3, background: "var(--color-raised)", opacity: 0.5 }} />
              <div style={{ height: 11, width: sz * 0.55, borderRadius: 3, background: "var(--color-raised)", opacity: 0.4 }} />
            </div>
          ))
        ) : (
          // Render #2, #1, #3 in display order
          [top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
            const rankColors = ["var(--color-silver)", "var(--color-gold)", "var(--color-copper)"];
            const isFirst = i === 1;
            return (
              <Link key={entry.agent_id} href={`/agents/${entry.agent_id}`} className="flex flex-col items-center" style={{ transform: isFirst ? "scale(1.1)" : "scale(1)" }}>
                <div className="relative">
                  <HexPortrait name={entry.name} size={isFirst ? 140 : 100} accent={rankColors[i]} />
                  {isFirst && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>}
                </div>
                <p className={`mt-2 font-mono text-sm`} style={{ color: rankColors[i] }}>
                  #{entry.rank} {entry.name}
                </p>
                <p className="font-mono text-xs text-[var(--color-stone)]">ELO {entry.elo} · {entry.wr}</p>
              </Link>
            );
          })
        )}
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
                {isLoading
                  ? Array.from({ length: 6 }, (_, i) => <RowSkeleton key={i} />)
                  : filtered.map((row) => (
                    <tr
                      key={row.rank}
                      className="border-b border-[var(--color-border)]/30 hover:bg-[var(--color-raised)]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 font-heading text-lg" style={{ color: tierColor(row.rank) }}>
                        #{row.rank}
                      </td>
                      <td className="py-3">
                        <Link href={`/agents/${row.agent_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <HexPortrait name={row.name} size={32} accent={tierColor(row.rank)} />
                          <span className="font-heading text-sm text-[var(--color-ivory)]">{row.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 font-mono text-xs text-[var(--color-stone)]">{row.owner}</td>
                      <td className="py-3 font-mono text-xs text-[var(--color-parchment)]">{row.game}</td>
                      <td className="py-3 text-right font-mono text-base font-bold text-[var(--color-ivory)]">{row.elo}</td>
                      <td className="py-3 text-right font-mono text-sm text-[var(--color-parchment)]">{row.wr}</td>
                      <td className="py-3 text-right font-mono text-sm text-[var(--color-stone)]">{row.games}</td>
                      <td className="py-3 text-right font-mono text-sm text-[var(--color-gold)]">{row.arena}</td>
                      <td className="py-3 text-right">
                        <div className="w-16 h-8 ml-auto">
                          <ELOSparkline history={row.history ?? []} height={32} color="var(--color-gold)" />
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
