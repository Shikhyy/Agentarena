"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { MotionNumber } from "@/components/ui/MotionNumber";
import { motion, AnimatePresence } from "motion/react";
import { STAGGER } from "@/lib/springs";
import { apiGet } from "@/lib/api";
import { useAgentStore } from "@/lib/stores";
import Link from "next/link";
import { useAccount, useWriteContract } from "wagmi";
import { CONTRACTS, ARENA_TOKEN_ABI, parseArena } from "@/lib/contracts";
import type { Address } from "viem";

/* ── Data ─────────────────────────────────────────────────── */

const _NOW = Date.now();
const tournamentCards = [
  { name: "Grand Prix Alpha", format: "Single Elimination", participants: 64, maxParticipants: 64, prize: "4.8M", entryFee: "500 ARENA", status: "Live", startDate: "In Progress", progress: 75, startTimestamp: 0 },
  { name: "Winter Championship", format: "Double Elimination", participants: 32, maxParticipants: 32, prize: "2.2M", entryFee: "300 ARENA", status: "Upcoming", startDate: "Jan 15, 2026", progress: 0, startTimestamp: _NOW + 5 * 86_400_000 },
  { name: "Quick Clash Weekly", format: "Swiss", participants: 16, maxParticipants: 16, prize: "500K", entryFee: "50 ARENA", status: "Completed", startDate: "Ended Dec 28", progress: 100, startTimestamp: 0 },
  { name: "Rookie Rumble", format: "Single Elimination", participants: 87, maxParticipants: 128, prize: "1M", entryFee: "100 ARENA", status: "Upcoming", startDate: "Feb 1, 2026", progress: 0, startTimestamp: _NOW + 18 * 86_400_000 },
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

const pastChampions = [
  { name: "ZEUS", tournament: "Autumn Invitational", prize: "3.2M ARENA", date: "Nov 2024" },
  { name: "FENRIR", tournament: "Summer Grand Prix", prize: "5.1M ARENA", date: "Aug 2024" },
  { name: "APOLLO", tournament: "Spring Championship", prize: "2.8M ARENA", date: "Apr 2024" },
];

const FILTER_TABS = ["All", "Live", "Upcoming", "Completed"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const COUNTDOWN_INITIAL = 2 * 60 * 60; // 2 hours in seconds

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDetailedCountdown(totalSeconds: number) {
  const d = Math.floor(totalSeconds / 86_400);
  const h = Math.floor((totalSeconds % 86_400) / 3_600);
  const m = Math.floor((totalSeconds % 3_600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

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

/* ── Registration Modal ─────────────────────────────────────── */

type RegStep = "idle" | "approving" | "registering" | "success" | "error";

function RegistrationModal({
  tournament,
  onClose,
}: {
  tournament: typeof tournamentCards[0];
  onClose: () => void;
}) {
  const { isConnected } = useAccount();
  const { myAgents } = useAgentStore();
  const { writeContractAsync } = useWriteContract();

  const [selectedAgent, setSelectedAgent] = useState(myAgents[0] ?? null);
  const [step, setStep] = useState<RegStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const feeMatch = tournament.entryFee.match(/\d+/);
  const feeWei = parseArena(feeMatch ? feeMatch[0] : "0");
  const isBusy = step === "approving" || step === "registering";

  async function handleApproveAndRegister() {
    if (!isConnected) { setErrorMsg("Connect your wallet first."); setStep("error"); return; }
    if (!selectedAgent) { setErrorMsg("Select an agent to enter."); setStep("error"); return; }
    setErrorMsg("");
    try {
      // Step 1: Approve ARENA spend
      setStep("approving");
      await writeContractAsync({
        address: CONTRACTS.ARENA_TOKEN as Address,
        abi: ARENA_TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.ARENA_TOKEN as Address, feeWei],
      });
      // Step 2: Register (mocked — tournament contract not yet deployed)
      setStep("registering");
      await new Promise((r) => setTimeout(r, 1_500));
      setStep("success");
    } catch (e: unknown) {
      const msg = (e as { shortMessage?: string; message?: string })?.shortMessage
        ?? (e as { message?: string })?.message
        ?? "Transaction failed.";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md"
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        <GlassCard accent="gold" glowIntensity={0.4}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-1">
                Tournament Registration
              </p>
              <h3 className="font-heading text-xl text-[var(--color-ivory)]">{tournament.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="font-mono text-lg text-[var(--color-stone)] hover:text-[var(--color-parchment)] leading-none mt-0.5"
            >
              ✕
            </button>
          </div>

          {step === "success" ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🏆</div>
              <p className="font-heading text-lg text-[var(--color-gold)] mb-2">Registered!</p>
              <p className="font-narrative italic text-sm text-[var(--color-parchment)] mb-1">
                <span className="text-[var(--color-gold)]">{selectedAgent?.name}</span>{" "}
                has entered the tournament.
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-stone)] mb-6">
                Results will be attested on-chain
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 text-[10px] font-heading tracking-[3px] uppercase bg-[var(--color-gold)] text-[var(--color-deep)] rounded hover:bg-[var(--color-gold-light)] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Tournament summary */}
              <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded border border-[var(--color-border)]/40 bg-[var(--color-surface)]/30">
                <div>
                  <p className="font-mono text-[8px] tracking-wider uppercase text-[var(--color-ash)]">Entry Fee</p>
                  <p className="font-mono text-sm text-[var(--color-amber)] mt-0.5">{tournament.entryFee}</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] tracking-wider uppercase text-[var(--color-ash)]">Prize Pool</p>
                  <p className="font-mono text-sm text-[var(--color-gold)] mt-0.5">{tournament.prize} ARENA</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] tracking-wider uppercase text-[var(--color-ash)]">Format</p>
                  <p className="font-mono text-xs text-[var(--color-parchment)] mt-0.5">{tournament.format}</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] tracking-wider uppercase text-[var(--color-ash)]">Entrants</p>
                  <p className="font-mono text-xs text-[var(--color-parchment)] mt-0.5">
                    {tournament.participants} / {tournament.maxParticipants}
                  </p>
                </div>
              </div>

              {/* Agent selector */}
              <div className="mb-5">
                <p className="font-mono text-[9px] tracking-[2px] uppercase text-[var(--color-ash)] mb-2">
                  Select Agent
                </p>
                {myAgents.length === 0 ? (
                  <Link
                    href="/world/workshop"
                    className="text-xs font-narrative italic text-[var(--color-gold)] hover:underline"
                  >
                    Build an Agent First →
                  </Link>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {myAgents.map((agent) => (
                      <button
                        key={agent.agent_id}
                        onClick={() => setSelectedAgent(agent)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors text-left ${
                          selectedAgent?.agent_id === agent.agent_id
                            ? "border-[var(--color-gold-dim)] bg-[var(--color-gold)]/10"
                            : "border-[var(--color-border)]/40 hover:border-[var(--color-gold-dim)]/50"
                        }`}
                      >
                        <HexPortrait name={agent.name} size={28} accent="var(--color-gold)" />
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-xs text-[var(--color-ivory)] block">{agent.name}</span>
                          <span className="font-mono text-[9px] text-[var(--color-stone)]">
                            ELO {agent.elo} · Lv{agent.level}
                          </span>
                        </div>
                        {selectedAgent?.agent_id === agent.agent_id && (
                          <span className="text-[var(--color-gold)] text-xs flex-shrink-0">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Estimated rewards */}
              <div className="mb-5 px-3 py-2 rounded border border-[var(--color-teal)]/40 bg-[var(--color-teal)]/5">
                <p className="font-mono text-[8px] tracking-wider uppercase text-[var(--color-teal-light)] mb-1">
                  Estimated 1st Place Reward
                </p>
                <p className="font-mono text-sm text-[var(--color-teal-light)]">
                  ~{tournament.prize} ARENA (≈75% of pool)
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-4">
                {(["approving", "registering"] as const).map((s, i) => {
                  const label = i === 0 ? "1. Approve ₳" : "2. Register";
                  const done =
                    (s === "approving" && (step === ("registering" as RegStep) || step === ("success" as RegStep))) ||
                    (s === "registering" && step === ("success" as RegStep));
                  const active = step === s;
                  return (
                    <div
                      key={s}
                      className={`flex-1 py-1.5 px-2 rounded text-center font-mono text-[8px] tracking-wider uppercase border transition-colors ${
                        done
                          ? "bg-[var(--color-teal)]/15 border-[var(--color-teal)] text-[var(--color-teal-light)]"
                          : active
                          ? "bg-[var(--color-gold)]/15 border-[var(--color-gold-dim)] text-[var(--color-gold)] animate-pulse"
                          : "border-[var(--color-border)]/30 text-[var(--color-ash)]"
                      }`}
                    >
                      {done ? "✓ " : ""}{label}
                    </div>
                  );
                })}
              </div>

              {/* Error */}
              {step === "error" && errorMsg && (
                <p className="mb-3 px-3 py-2 rounded border border-[var(--color-red)] bg-[var(--color-red)]/10 font-mono text-[9px] text-[var(--color-red-bright)]">
                  {errorMsg}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={step === "error" ? () => setStep("idle") : handleApproveAndRegister}
                disabled={isBusy || !selectedAgent}
                className="w-full py-3 text-[10px] font-heading tracking-[3px] uppercase rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-gold)] text-[var(--color-deep)] hover:bg-[var(--color-gold-light)] shadow-[0_0_20px_var(--color-gold-dim)]"
              >
                {isBusy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    {step === "approving" ? "Approving Spend…" : "Registering…"}
                  </span>
                ) : step === "error" ? (
                  "Try Again"
                ) : (
                  `Approve ₳ & Register — ${tournament.entryFee}`
                )}
              </button>

              {!isConnected && (
                <p className="mt-2 text-center font-mono text-[8px] text-[var(--color-stone)]">
                  Connect wallet to register
                </p>
              )}
            </>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function TournamentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [countdown, setCountdown] = useState(COUNTDOWN_INITIAL);
  const [registrationTarget, setRegistrationTarget] = useState<typeof tournamentCards[0] | null>(null);
  const [registerOpen, setRegisterOpen] = useState<string | null>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const { myAgents } = useAgentStore();
  const [countdowns, setCountdowns] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const t of tournamentCards) {
      if (t.startTimestamp) map[t.name] = Math.max(0, Math.floor((t.startTimestamp - Date.now()) / 1000));
    }
    return map;
  });

  const { data: tournaments = tournamentCards } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => apiGet<typeof tournamentCards>("/tournaments"),
    staleTime: 60_000,
  });

  // Live countdown timer (featured banner)
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Per-tournament countdown for upcoming events
  useEffect(() => {
    const id = setInterval(() => {
      setCountdowns(() => {
        const map: Record<string, number> = {};
        for (const t of tournamentCards) {
          if (t.startTimestamp) map[t.name] = Math.max(0, Math.floor((t.startTimestamp - Date.now()) / 1000));
        }
        return map;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const filteredTournaments =
    activeFilter === "All"
      ? tournaments
      : tournaments.filter((t) => t.status === activeFilter);
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
                  <span className="font-mono text-lg text-[var(--color-teal-light)]">{formatCountdown(countdown)}</span>
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 text-[10px] font-mono tracking-[2px] uppercase rounded border transition-colors ${
                activeFilter === tab
                  ? "bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold-dim)]"
                  : "bg-transparent text-[var(--color-stone)] border-[var(--color-border)] hover:text-[var(--color-parchment)] hover:border-[var(--color-gold-dim)]/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTournaments.map((t) => (
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
              <div className="relative mt-4" ref={t.status === "Upcoming" ? registerRef : undefined}>
                <button
                  onClick={() => {
                    if (t.status === "Upcoming") {
                      setRegisterOpen(registerOpen === t.name ? null : t.name);
                    }
                  }}
                  className="w-full py-2.5 text-[10px] font-heading tracking-[3px] uppercase bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold-dim)] rounded hover:bg-[var(--color-gold)]/25 transition-colors"
                >
                  {t.status === "Live" ? "Watch Now" : t.status === "Upcoming" ? "Register" : "View Results"}
                </button>
                <AnimatePresence>
                  {t.status === "Upcoming" && registerOpen === t.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-2 z-20 rounded border border-[var(--color-border)] bg-[var(--color-panel)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    >
                      <p className="px-3 pt-2.5 pb-1.5 font-mono text-[9px] tracking-[2px] uppercase text-[var(--color-ash)]">
                        Select Agent
                      </p>
                      {myAgents.length === 0 ? (
                        <Link
                          href="/world/workshop"
                          className="block px-3 py-2.5 text-xs font-narrative italic text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors"
                        >
                          Build an Agent First →
                        </Link>
                      ) : (
                        <div className="max-h-40 overflow-y-auto">
                          {myAgents.map((agent) => (
                            <button
                              key={agent.agent_id}
                              onClick={() => setRegisterOpen(null)}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--color-gold)]/10 transition-colors"
                            >
                              <HexPortrait name={agent.name} size={22} accent="var(--color-gold)" />
                              <div>
                                <span className="font-mono text-xs text-[var(--color-ivory)]">{agent.name}</span>
                                <span className="font-mono text-[9px] text-[var(--color-stone)] ml-2">ELO {agent.elo}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

      {/* ── Past Champions ───────────────────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.interactive / 1000 + 0.5, duration: 0.5 }}
      >
        <GlassCard glowIntensity={0.2}>
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">Past Champions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pastChampions.map((champ, i) => (
              <div
                key={champ.name}
                className="flex items-center gap-4 p-4 rounded border border-[var(--color-border)]/30 bg-[var(--color-surface)]/30"
              >
                <div className="relative flex-shrink-0">
                  <HexPortrait
                    name={champ.name}
                    size={48}
                    accent={i === 0 ? "var(--color-gold)" : i === 1 ? "var(--color-silver)" : "var(--color-copper)"}
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-gold)]/20 border border-[var(--color-gold-dim)] font-mono text-[9px] text-[var(--color-gold)]">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm text-[var(--color-gold)] font-bold">{champ.name}</p>
                  <p className="font-narrative italic text-xs text-[var(--color-parchment)] truncate">{champ.tournament}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[9px] text-[var(--color-teal-light)]">🏆 {champ.prize}</span>
                    <span className="font-mono text-[9px] text-[var(--color-ash)]">{champ.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.section>
    </div>
  );
}
