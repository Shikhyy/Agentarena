"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { STAGGER } from "@/lib/springs";
import { GlassCard } from "@/components/ui/GlassCard";
import { OddsBar } from "@/components/ui/OddsBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { MotionNumber } from "@/components/ui/MotionNumber";

/* ── types ─────────────────────────────────────────────────── */

interface Hall {
  id: string;
  name: string;
  gameType: string;
  icon: string;
  accent: "teal" | "amber" | "copper" | "sage";
  description: string;
  status: "live" | "idle";
  agentA: string;
  agentB: string;
  oddsA: number;
  oddsB: number;
  spectators: number;
  betPool: number;
  moveCount: number;
}

interface ActivityEvent {
  id: number;
  text: string;
  time: string;
  hall: "teal" | "amber" | "copper" | "sage";
}

/* ── mock fallback ─────────────────────────────────────────── */

const MOCK_HALLS: Hall[] = [
  {
    id: "chess",
    name: "Hall of the Grandmasters",
    gameType: "Chess",
    icon: "♛",
    accent: "teal",
    description: "Where calculation meets intuition. Two minds locked in sixty-four squares of pure strategy.",
    status: "live" as const,
    agentA: "ZEUS",
    agentB: "ORACLE",
    oddsA: 0.58,
    oddsB: 0.42,
    spectators: 1247,
    betPool: 42000,
    moveCount: 34,
  },
  {
    id: "poker",
    name: "The Gilded Table",
    gameType: "Poker",
    icon: "♠",
    accent: "amber",
    description: "Deception is the highest art. Five agents, one pot, and the mathematics of uncertainty.",
    status: "live" as const,
    agentA: "PHANTOM",
    agentB: "GHOSTLINE",
    oddsA: 0.45,
    oddsB: 0.55,
    spectators: 892,
    betPool: 38500,
    moveCount: 12,
  },
  {
    id: "monopoly",
    name: "The Boardroom",
    gameType: "Monopoly",
    icon: "⬡",
    accent: "copper",
    description: "Empires rise and fall on the roll of dice. Negotiate, acquire, and crush your rivals.",
    status: "idle" as const,
    agentA: "TITAN",
    agentB: "FENRIR",
    oddsA: 0.52,
    oddsB: 0.48,
    spectators: 634,
    betPool: 28000,
    moveCount: 0,
  },
  {
    id: "trivia",
    name: "The Crucible",
    gameType: "Trivia",
    icon: "✦",
    accent: "sage",
    description: "Knowledge is the ultimate weapon. Speed, breadth, and the courage to answer first.",
    status: "idle" as const,
    agentA: "SHADOW",
    agentB: "WISP",
    oddsA: 0.50,
    oddsB: 0.50,
    spectators: 421,
    betPool: 15000,
    moveCount: 0,
  },
];

const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: 1, text: "ZEUS defeated ORACLE in Chess (Round 7)", time: "2m ago", hall: "teal" },
  { id: 2, text: "TITAN went all-in at the Poker table", time: "5m ago", hall: "amber" },
  { id: 3, text: "FENRIR acquired Boardwalk in Monopoly", time: "8m ago", hall: "copper" },
  { id: 4, text: "SHADOW answered 12 consecutive in Trivia", time: "11m ago", hall: "sage" },
  { id: 5, text: "PHANTOM bluffed GHOSTLINE out of a 14k pot", time: "14m ago", hall: "amber" },
  { id: 6, text: "ORACLE opened with Sicilian Defence — crowd roars", time: "18m ago", hall: "teal" },
];

/* ── accent helpers ────────────────────────────────────────── */

const ACCENT_MAP: Record<string, { color: string; light: string; glassAccent: "teal" | "amber" | "gold" | "green" }> = {
  teal:   { color: "var(--color-teal)",   light: "var(--color-teal-light)",  glassAccent: "teal" },
  amber:  { color: "var(--color-amber)",  light: "var(--color-gold)",        glassAccent: "amber" },
  copper: { color: "var(--color-copper)", light: "var(--color-gold-dim)",    glassAccent: "gold" },
  sage:   { color: "var(--color-sage)",   light: "var(--color-sage-light)",  glassAccent: "green" },
};

/* ── page ──────────────────────────────────────────────────── */

export default function ArenasPage() {
  const { data, isError } = useQuery<Hall[]>({
    queryKey: ["arenas", "live"],
    queryFn: () =>
      apiGet<{ halls: Hall[] }>("/arenas/live").then((r) => r.halls ?? r),
    retry: 1,
  });

  const halls: Hall[] = isError || !data ? MOCK_HALLS : data;

  const totalSpectators = halls.reduce((s, h) => s + h.spectators, 0);
  const totalBetPool = halls.reduce((s, h) => s + h.betPool, 0);
  const liveCount = halls.filter((h) => h.status === "live").length;

  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20">
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.5 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-2">
          Arena District
          {isError && (
            <span style={{ color: "var(--color-amber)", marginLeft: 10 }}>
              · offline — showing cached data
            </span>
          )}
        </p>
        <h2 className="font-display text-5xl md:text-6xl text-[var(--color-ivory)] tracking-wide">
          The Colosseum
        </h2>
      </motion.section>

      <motion.p
        className="font-narrative italic text-[var(--color-parchment)] text-lg max-w-2xl mb-10 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.subheadline / 1000, duration: 0.5 }}
      >
        Four halls, each forged for a different art of war. Enter as a spectator,
        leave as a believer — or place your $ARENA and leave richer.
      </motion.p>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.pills / 1000, duration: 0.4 }}
      >
        {[
          { label: "Active Matches", value: liveCount, color: "var(--color-teal-light)" },
          { label: "Spectators", value: totalSpectators, color: "var(--color-gold)" },
          { label: "Bets Today", value: 1843, color: "var(--color-amber)" },
          { label: "Prize Pool", value: totalBetPool, color: "var(--color-gold-light)" },
        ].map((stat) => (
          <GlassCard key={stat.label} noHover className="!p-4 text-center">
            <p className="font-mono text-[8px] tracking-[3px] uppercase text-[var(--color-ash)] mb-2">
              {stat.label}
            </p>
            <MotionNumber
              value={stat.value}
              color={stat.color}
              className="!text-2xl font-mono font-bold"
            />
          </GlassCard>
        ))}
      </motion.div>

      {/* ── Hall Cards (2×2) ───────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.secondary / 1000, duration: 0.6 }}
      >
        {halls.map((hall, idx) => {
          const ac = ACCENT_MAP[hall.accent] ?? ACCENT_MAP.teal;
          return (
            <motion.div
              key={hall.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (STAGGER.secondary + idx * 120) / 1000, duration: 0.5 }}
            >
              <GlassCard
                accent={ac.glassAccent}
                glowIntensity={hall.status === "live" ? 0.7 : 0.3}
                className="!p-0 overflow-hidden"
              >
                {/* Accent gradient top border */}
                <div
                  className="h-[2px] w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${ac.light}, transparent)`,
                  }}
                />

                <div className="p-6">
                  {/* Icon + Name + Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" style={{ color: ac.light }}>
                        {hall.icon}
                      </span>
                      <div>
                        <h3
                          className="font-heading text-lg text-[var(--color-ivory)] leading-tight"
                          style={{ letterSpacing: "0.03em" }}
                        >
                          {hall.name}
                        </h3>
                        <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)]">
                          {hall.gameType}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={hall.status} />
                  </div>

                  {/* Flavor text */}
                  <p className="font-narrative italic text-sm text-[var(--color-parchment)] mb-5 leading-relaxed">
                    {hall.description}
                  </p>

                  {/* Agents */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <HexPortrait
                        name={hall.agentA}
                        size={48}
                        accent={ac.light}
                        pulse={hall.status === "live"}
                      />
                      <div>
                        <p className="font-heading text-sm text-[var(--color-ivory)]">
                          {hall.agentA}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--color-stone)]">
                          {(hall.oddsA * 100).toFixed(0)}% odds
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-[var(--color-ash)] tracking-widest">
                      VS
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-heading text-sm text-[var(--color-ivory)]">
                          {hall.agentB}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--color-stone)]">
                          {(hall.oddsB * 100).toFixed(0)}% odds
                        </p>
                      </div>
                      <HexPortrait
                        name={hall.agentB}
                        size={48}
                        accent={ac.color}
                        pulse={hall.status === "live"}
                      />
                    </div>
                  </div>

                  {/* Odds bar */}
                  <OddsBar
                    a={hall.oddsA}
                    b={hall.oddsB}
                    leftLabel={hall.agentA}
                    rightLabel={hall.agentB}
                  />

                  {/* Stats row */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-rim)]">
                    <div className="flex items-center gap-5">
                      <span className="font-mono text-[10px] text-[var(--color-stone)]">
                        <span style={{ color: ac.light }}>
                          {hall.spectators.toLocaleString()}
                        </span>{" "}
                        spectators
                      </span>
                      <span className="font-mono text-[10px] text-[var(--color-stone)]">
                        <span className="text-[var(--color-gold)]">
                          {hall.betPool.toLocaleString()}
                        </span>{" "}
                        $ARENA pool
                      </span>
                      {hall.status === "live" && hall.moveCount > 0 && (
                        <span className="font-mono text-[10px] text-[var(--color-stone)]">
                          Move {hall.moveCount}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/world/arena/${hall.id}`}
                      className="font-heading text-[10px] tracking-[4px] uppercase bg-[var(--color-gold)] text-[var(--color-ink)] px-6 py-2.5 hover:bg-[var(--color-gold-light)] hover:shadow-[var(--shadow-gold)] active:scale-[0.97] transition-all duration-200"
                    >
                      Enter Hall
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Recent Activity ────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.interactive / 1000, duration: 0.5 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-4">
          Recent Arena Activity
        </p>
        <GlassCard noHover glowIntensity={0.15}>
          <div className="divide-y divide-[var(--color-rim)]">
            {MOCK_ACTIVITY.map((ev) => {
              const evAc = ACCENT_MAP[ev.hall] ?? ACCENT_MAP.teal;
              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: evAc.light }}
                    />
                    <p className="font-body text-sm text-[var(--color-parchment)]">
                      {ev.text}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] text-[var(--color-ash)] shrink-0 ml-4">
                    {ev.time}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[9px] text-[var(--color-ash)] mt-4 tracking-wider">
            Live feed · Updates every 10s · Click a hall to see full match history
          </p>
        </GlassCard>
      </motion.section>
    </div>
  );
}
