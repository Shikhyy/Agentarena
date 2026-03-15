"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { postMatchTimeline } from "@/lib/pdfContent";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

// keep postMatchTimeline import to avoid breaking unused-import if referenced elsewhere
void postMatchTimeline;

type MatchResult = "win" | "loss";

const STAGGER = {
  background: 0,
  headline: 200,
  subheadline: 350,
  secondary: 800,
  interactive: 1000,
} as const;

/* ── Comparison data ──────────────────────────────────────── */

const comparisonStats = [
  { label: "Moves Made", you: 38, opp: 41 },
  { label: "Blunders", you: 1, opp: 4 },
  { label: "Brilliant Moves", you: 6, opp: 2 },
  { label: "Avg Eval", you: "+1.4", opp: "-0.8" },
];

export default function MatchResultPage() {
  const [result] = useState<MatchResult>("win");
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 0),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 600),
      setTimeout(() => setPhase(4), 1000),
      setTimeout(() => setPhase(5), 1400),
      setTimeout(() => setPhase(6), 2000),
      setTimeout(() => setPhase(7), 2400),
      setTimeout(() => setPhase(8), 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase < 8) return;
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatCountdown = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-deep)]/95 z-50 overflow-auto">
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen p-6 pt-16 max-w-5xl mx-auto"
          >
            {/* ── Victory / Defeat Presentation ──────────── */}
            <section className="mb-10 text-center">
              <AnimatePresence mode="wait">
                {phase >= 2 && (
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mb-4 relative inline-block"
                  >
                    {/* Particle glow ring */}
                    <div className="absolute inset-0 rounded-full bg-[var(--color-gold)]/20 blur-2xl scale-150 animate-pulse pointer-events-none" />
                    <HexPortrait
                      name="ZEUS"
                      size={200}
                      accent="var(--color-gold)"
                      pulse
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {phase >= 3 && (
                  <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    {result === "win" ? (
                      <h2
                        className="text-8xl font-heading tracking-[0.15em] text-[var(--color-gold)]"
                        style={{ textShadow: "0 0 40px var(--color-gold), 0 0 80px var(--color-gold-dim), 0 4px 12px rgba(0,0,0,0.5)" }}
                      >
                        VICTORY
                      </h2>
                    ) : (
                      <h2
                        className="text-8xl font-heading tracking-[0.15em] text-[var(--color-red-bright)]"
                        style={{ textShadow: "0 0 40px var(--color-red), 0 0 80px var(--color-red), 0 4px 12px rgba(0,0,0,0.5)" }}
                      >
                        DEFEAT
                      </h2>
                    )}
                    <p className="font-mono text-xs text-[var(--color-stone)] mt-2 tracking-wider uppercase">
                      ZEUS vs ATHENA · Chess · 38 moves
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Narrative summary */}
              <AnimatePresence>
                {phase >= 4 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="font-narrative italic text-[var(--color-parchment)] text-sm mt-4 max-w-lg mx-auto leading-relaxed"
                  >
                    A hard-fought battle on the 64 squares. ZEUS sacrificed a knight on move 22 to shatter ATHENA&apos;s
                    pawn structure, then converted the endgame with surgical precision. The decisive blow came with a
                    queen infiltration on the 36th move.
                  </motion.p>
                )}
              </AnimatePresence>
            </section>

            {/* ── 3-Card Summary Row ─────────────────────── */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {/* Payout Card */}
              <AnimatePresence>
                {phase >= 5 && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.0 }}
                  >
                    <GlassCard accent="gold" glowIntensity={0.8} className="h-full">
                      <p className="font-mono text-[9px] uppercase tracking-[3px] text-[var(--color-ash)] mb-3">
                        Payout
                      </p>
                      {result === "win" ? (
                        <>
                          <p className="text-4xl font-heading text-[var(--color-gold)] mb-3">
                            +340 ARENA
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--color-stone)]">XP Gained</span>
                              <span className="text-sm font-mono text-[var(--color-teal-light)]">+45 XP</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--color-stone)]">Streak Bonus</span>
                              <span className="text-sm font-mono text-[var(--color-amber)]">×1.5</span>
                            </div>
                            <div className="mt-2">
                              <span className="px-2 py-0.5 text-[10px] font-mono bg-[var(--color-teal-light)]/20 text-[var(--color-teal-light)] rounded tracking-wider">
                                LEVEL UP!
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-heading text-[var(--color-red-bright)] mb-2">-25 ARENA</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--color-stone)]">XP Gained</span>
                            <span className="text-sm font-mono text-[var(--color-teal-light)]">+10 XP</span>
                          </div>
                        </>
                      )}
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Agent Evolution Card */}
              <AnimatePresence>
                {phase >= 6 && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <GlassCard glowIntensity={0.4} className="h-full">
                      <p className="font-mono text-[9px] uppercase tracking-[3px] text-[var(--color-ash)] mb-3">
                        Agent Evolution
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[var(--color-stone)] text-xs mb-1">ELO Rating</p>
                          <p className="text-2xl font-heading">
                            <AnimatedCounter value={2620} color="var(--color-parchment)" />
                            <span className="text-[var(--color-stone)] mx-1">→</span>
                            <span className="text-[var(--color-teal-light)]">2655</span>
                            <span className="text-sm text-[var(--color-teal-light)] ml-1">(+35)</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--color-stone)] text-xs mb-1">Rank Change</p>
                          <p className="font-heading text-lg text-[var(--color-amber)]">#14 → #12 ↑</p>
                        </div>
                        <div>
                          <p className="text-[var(--color-stone)] text-xs mb-1">Achievement Unlocked</p>
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold-dim)] rounded tracking-wider">
                            🏆 5-WIN STREAK
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Match Replay Stats Card */}
              <AnimatePresence>
                {phase >= 6 && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <GlassCard glowIntensity={0.3} className="h-full">
                      <p className="font-mono text-[9px] uppercase tracking-[3px] text-[var(--color-ash)] mb-3">
                        Replay Stats
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[var(--color-stone)] text-xs">Total Turns</p>
                          <p className="text-xl font-heading text-[var(--color-parchment)]">38</p>
                        </div>
                        <div>
                          <p className="text-[var(--color-stone)] text-xs">Avg Think Time</p>
                          <p className="text-xl font-heading text-[var(--color-parchment)]">2.4s</p>
                        </div>
                        <div>
                          <p className="text-[var(--color-stone)] text-xs">Critical Moments</p>
                          <p className="text-xl font-heading text-[var(--color-amber)]">3</p>
                        </div>
                        <div>
                          <p className="text-[var(--color-stone)] text-xs">Accuracy</p>
                          <p className="text-xl font-heading text-[var(--color-teal-light)]">94.2%</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[var(--color-stone)] text-xs">Duration</p>
                          <p className="font-mono text-lg text-[var(--color-parchment)]">4:32</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* ── Agent Comparison Table ──────────────────── */}
            <AnimatePresence>
              {phase >= 7 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <GlassCard glowIntensity={0.2}>
                    <p className="font-mono text-[9px] uppercase tracking-[3px] text-[var(--color-ash)] mb-4">
                      Agent Comparison
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--color-border)]/40">
                            <th className="text-left py-2 font-mono text-[9px] tracking-wider uppercase text-[var(--color-ash)]">Stat</th>
                            <th className="text-center py-2">
                              <div className="flex items-center justify-center gap-2">
                                <HexPortrait name="ZEUS" size={24} accent="var(--color-gold)" />
                                <span className="font-mono text-xs text-[var(--color-gold)]">ZEUS</span>
                              </div>
                            </th>
                            <th className="text-center py-2">
                              <div className="flex items-center justify-center gap-2">
                                <HexPortrait name="ATHENA" size={24} accent="var(--color-red-bright)" />
                                <span className="font-mono text-xs text-[var(--color-stone)]">ATHENA</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonStats.map((stat) => (
                            <tr key={stat.label} className="border-b border-[var(--color-border)]/20 last:border-0">
                              <td className="py-2.5 font-mono text-xs text-[var(--color-stone)]">{stat.label}</td>
                              <td className="py-2.5 text-center font-mono text-sm text-[var(--color-parchment)]">{stat.you}</td>
                              <td className="py-2.5 text-center font-mono text-sm text-[var(--color-stone)]">{stat.opp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </motion.section>
              )}
            </AnimatePresence>

            {/* ── Action Buttons ──────────────────────────── */}
            <AnimatePresence>
              {phase >= 8 && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex flex-col items-center gap-6 pb-12"
                >
                  <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-10 py-3.5 bg-[var(--color-gold)] text-[var(--color-deep)] font-heading text-lg tracking-wider rounded shadow-[0_0_20px_var(--color-gold-dim)] hover:shadow-[0_0_30px_var(--color-gold)] hover:bg-[var(--color-gold)]/90 transition-all flex items-center gap-3">
                      <span>⚔️</span>
                      <span>Rematch</span>
                      <span className="text-sm opacity-70 font-mono">({formatCountdown(countdown)})</span>
                    </button>
                    <button className="px-8 py-3.5 bg-[var(--color-surface)] text-[var(--color-ivory)] border border-[var(--color-amber)]/50 font-heading text-lg tracking-wider rounded hover:bg-[var(--color-amber)]/10 hover:border-[var(--color-amber)] transition-all flex items-center gap-2">
                      <span>📤</span>
                      <span>Share Moment</span>
                    </button>
                    <Link
                      href="/world"
                      className="px-8 py-3.5 bg-[var(--color-surface)] text-[var(--color-stone)] border border-[var(--color-border)] font-heading text-lg tracking-wider rounded hover:text-[var(--color-ivory)] hover:border-[var(--color-stone)] transition-all flex items-center gap-2"
                    >
                      <span>🏠</span>
                      <span>Return to Nexus</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
