"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ZKLockIcon } from "@/components/ui/ZKLockIcon";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { ELOSparkline } from "@/components/ui/ELOSparkline";
import { MotionNumber } from "@/components/ui/MotionNumber";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAccount } from "wagmi";
import { motion } from "motion/react";
import { STAGGER } from "@/lib/springs";

/* ── Mock Data ─────────────────────────────────────────────── */

const transactions = [
  { type: "Bet Lock",  icon: "🎲", amount: "-25 ARENA",  status: "Confirmed", time: "2m ago",  hash: "0x4f1a...c992" },
  { type: "Payout",    icon: "💰", amount: "+86 ARENA",  status: "Settled",   time: "5m ago",  hash: "0x8b2e...1fa3" },
  { type: "Bet Lock",  icon: "🎲", amount: "-40 ARENA",  status: "Confirmed", time: "12m ago", hash: "0xd3c7...e481" },
  { type: "Mint",      icon: "✨", amount: "-120 ARENA", status: "Confirmed", time: "1h ago",  hash: "0x1ef9...b027" },
  { type: "Stake",     icon: "🔒", amount: "-500 ARENA", status: "Confirmed", time: "2h ago",  hash: "0x77a2...d913" },
  { type: "Payout",    icon: "💰", amount: "+210 ARENA", status: "Settled",   time: "3h ago",  hash: "0xaa41...7c60" },
  { type: "Transfer",  icon: "↗️", amount: "-50 ARENA",  status: "Confirmed", time: "5h ago",  hash: "0x5bc0...ef82" },
  { type: "Reward",    icon: "🏆", amount: "+300 ARENA", status: "Settled",   time: "1d ago",  hash: "0xfe23...1190" },
];

const ownedNFTs = [
  { token: "#102", collection: "AgentNFT",  name: "ZEUS",         id: "0x1234", rarity: "Legendary" as const },
  { token: "#221", collection: "SkillNFT",  name: "Tempo Vision",  id: "0x5678", rarity: "Rare" as const },
  { token: "#089", collection: "AgentNFT",  name: "ATLAS",         id: "0x9abc", rarity: "Epic" as const },
  { token: "#344", collection: "SkinNFT",   name: "Obsidian Cloak", id: "0xdef0", rarity: "Rare" as const },
  { token: "#015", collection: "AgentNFT",  name: "HERA",          id: "0x1122", rarity: "Common" as const },
];

const activeBets = [
  { match: "ZEUS vs ARES",     agent: "ZEUS",  stake: 80,  payout: 176, endsIn: "4m 12s" },
  { match: "ATLAS vs HERMES",  agent: "ATLAS", stake: 50,  payout: 115, endsIn: "11m 03s" },
  { match: "HERA vs NYX",      agent: "HERA",  stake: 120, payout: 288, endsIn: "32m 45s" },
];

const holdings = [
  { label: "ARENA Tokens", value: 1234.56, max: 2000, color: "var(--color-gold)" },
  { label: "Staked ARENA", value: 500,     max: 2000, color: "var(--color-teal-light)" },
  { label: "ETH",          value: 0.82,    max: 2,    color: "var(--color-parchment)" },
  { label: "MATIC",        value: 340,     max: 1000, color: "var(--color-amber)" },
  { label: "NFT Value",    value: 860,     max: 2000, color: "var(--color-copper)" },
];

const weeklyPnl = [120, -40, 210, 85, -15, 310, 170];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const achievements = [
  { icon: "🎯", label: "First Bet",          earned: true },
  { icon: "🔥", label: "10 Wins",            earned: true },
  { icon: "🏆", label: "Tournament Finalist", earned: true },
  { icon: "⚡", label: "Speed Demon",         earned: true },
  { icon: "💎", label: "Diamond Hands",       earned: false },
  { icon: "👑", label: "Arena Champion",      earned: false },
  { icon: "🧬", label: "Agent Breeder",       earned: false },
  { icon: "🌐", label: "World Explorer",      earned: false },
];

const rarityColor: Record<string, string> = {
  Legendary: "var(--color-gold)",
  Epic: "var(--color-amber)",
  Rare: "var(--color-teal-light)",
  Common: "var(--color-stone)",
};

const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
  Confirmed: { bg: "var(--color-teal)/15",       text: "var(--color-teal-light)", border: "var(--color-teal)" },
  Settled:   { bg: "var(--color-gold)/15",        text: "var(--color-gold)",       border: "var(--color-gold-dim)" },
  Pending:   { bg: "var(--color-amber)/15",       text: "var(--color-amber)",      border: "var(--color-amber)" },
};

/* ── Component ─────────────────────────────────────────────── */

export default function ProfilePage() {
  const { address } = useAccount();
  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "0x71C7...F29a";

  const tier = "Gold";
  const tierProgress = 72; // percent to next tier

  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20 max-w-[1400px] mx-auto">

      {/* ── Profile Hero ───────────────────────────────────── */}
      <motion.section
        className="relative mb-8 overflow-hidden rounded-xl border border-[var(--color-gold-dim)]/40"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.6 }}
      >
        {/* Banner gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-dim)]/20 via-[var(--color-deep)] to-[var(--color-teal)]/10" />
        <div className="relative flex flex-col md:flex-row items-center gap-6 p-8">
          <div className="relative">
            <HexPortrait name="Operator" size={96} accent="var(--color-gold)" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-[10px]">
              ⚡
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-1">
              Wallet · Operator Profile
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-[var(--color-ivory)] tracking-wide mb-2">
              Operator Dashboard
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <span className="font-mono text-sm text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-3 py-1 rounded border border-[var(--color-gold-dim)]/40">
                {truncated}
              </span>
              <span className="font-mono text-xs text-[var(--color-stone)]">Account age: 47 days</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-1">ARENA Balance</p>
            <p className="font-display text-4xl text-[var(--color-gold)]">
              <MotionNumber value={1234} cellWidth={22} color="var(--color-gold)" />
              <span className="text-lg opacity-60">.56</span>
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── Portfolio Overview (4 stats) ───────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Value",  value: "3,935",  unit: "ARENA", accent: "gold" as const },
          { label: "Betting PnL",  value: "+840",   unit: "ARENA", accent: "teal" as const },
          { label: "Win Rate",     value: "64%",    unit: "42 bets", accent: "amber" as const },
          { label: "Active Bets",  value: "3",      unit: "open",  accent: "cyan" as const },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: STAGGER.secondary / 1000 + i * 0.08 }}
          >
            <GlassCard accent={stat.accent} glowIntensity={0.3}>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-2">{stat.label}</p>
              <p className="font-mono text-2xl font-bold text-[var(--color-ivory)]">{stat.value}</p>
              <p className="font-mono text-[10px] text-[var(--color-stone)] mt-1">{stat.unit}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── Bento Dashboard Grid ──────────────────────────── */}
      <div className="grid grid-cols-12 gap-4 mb-8">

        {/* Holdings (8 cols) */}
        <motion.div
          className="col-span-12 lg:col-span-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.interactive / 1000 }}
        >
          <GlassCard glowIntensity={0.2}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-5">Holdings Breakdown</p>
            <div className="space-y-4">
              {holdings.map((h) => (
                <div key={h.label} className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-[var(--color-stone)] w-24 shrink-0">{h.label}</span>
                  <div className="flex-1 h-5 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]/30">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: h.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(h.value / h.max) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[var(--color-parchment)] w-24 text-right">
                    {h.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Tier Badge (4 cols) */}
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.1 }}
        >
          <GlassCard accent="gold" glowIntensity={0.5}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">Operator Tier</p>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border-2 border-[var(--color-gold)] bg-[var(--color-gold)]/10 flex items-center justify-center mb-3"
                   style={{ boxShadow: "0 0 24px rgba(200,150,60,0.3)" }}>
                <span className="text-3xl">🥇</span>
              </div>
              <p className="font-display text-2xl text-[var(--color-gold)] mb-1">{tier}</p>
              <p className="font-mono text-[10px] text-[var(--color-stone)] mb-4">Next: Platinum</p>
              <div className="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]/30">
                <motion.div
                  className="h-full rounded-full bg-[var(--color-gold)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${tierProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                />
              </div>
              <p className="font-mono text-[10px] text-[var(--color-stone)] mt-2">{tierProgress}% to Platinum</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Transaction Feed (6 cols) */}
        <motion.div
          className="col-span-12 lg:col-span-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.2 }}
        >
          <GlassCard glowIntensity={0.2}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)]">Transaction Feed</p>
              <ZKLockIcon locked txHash="0x4f1...992" />
            </div>
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--color-panel)]">
                  <tr className="border-b border-[var(--color-rim)]">
                    {["Type", "Amount", "Status", "Hash"].map((col) => (
                      <th key={col} className={`py-2 font-mono text-[9px] tracking-wider uppercase text-[var(--color-ash)] ${col === "Type" ? "text-left" : "text-right"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => {
                    const st = statusStyle[tx.status] ?? statusStyle.Confirmed;
                    return (
                      <motion.tr
                        key={i}
                        className="border-b border-[var(--color-border)]/30 hover:bg-[var(--color-raised)]/50 transition-colors"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: STAGGER.interactive / 1000 + 0.25 + i * 0.04 }}
                      >
                        <td className="py-3 font-heading text-sm text-[var(--color-parchment)]">
                          <span className="mr-2">{tx.icon}</span>{tx.type}
                          <span className="block font-mono text-[9px] text-[var(--color-stone)]">{tx.time}</span>
                        </td>
                        <td className={`py-3 text-right font-mono font-semibold ${
                          tx.amount.startsWith("+") ? "text-[var(--color-teal-light)]" : "text-[var(--color-red-bright)]"
                        }`}>
                          {tx.amount}
                        </td>
                        <td className="py-3 text-right">
                          <motion.span
                            className={`inline-block px-2 py-1 text-[9px] font-mono tracking-wider uppercase border rounded`}
                            style={{
                              background: `${st.bg.split("/")[0]}`,
                              opacity: 0.9,
                              color: st.text,
                              borderColor: st.border,
                            }}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            {tx.status}
                          </motion.span>
                        </td>
                        <td className="py-3 text-right font-mono text-[10px] text-[var(--color-teal-light)] hover:underline cursor-pointer">
                          {tx.hash}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* Active Bets (6 cols) */}
        <motion.div
          className="col-span-12 lg:col-span-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.3 }}
        >
          <GlassCard accent="amber" glowIntensity={0.3}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">Active Bets</p>
            <div className="space-y-3">
              {activeBets.map((bet, i) => (
                <motion.div
                  key={bet.match}
                  className="p-4 rounded-lg border border-[var(--color-border)]/40 bg-[var(--color-surface)]/30 hover:bg-[var(--color-raised)]/50 transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: STAGGER.interactive / 1000 + 0.35 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HexPortrait name={bet.agent} size={28} accent="var(--color-gold)" />
                      <div>
                        <p className="font-heading text-sm text-[var(--color-ivory)]">{bet.match}</p>
                        <p className="font-mono text-[9px] text-[var(--color-stone)]">Picked: {bet.agent}</p>
                      </div>
                    </div>
                    <StatusBadge status="live" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-[var(--color-stone)]">Stake</span>
                      <p className="font-mono text-sm text-[var(--color-red-bright)]">-{bet.stake} ARENA</p>
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-[10px] text-[var(--color-stone)]">Potential</span>
                      <p className="font-mono text-sm text-[var(--color-teal-light)]">+{bet.payout} ARENA</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-[var(--color-stone)]">Ends in</span>
                      <p className="font-mono text-sm text-[var(--color-amber)] tabular-nums">{bet.endsIn}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* NFT Gallery (8 cols) */}
        <motion.div
          className="col-span-12 lg:col-span-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.4 }}
        >
          <GlassCard glowIntensity={0.2}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-4">NFT Gallery</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ownedNFTs.map((nft) => (
                <motion.div
                  key={nft.id}
                  className="group relative flex flex-col items-center p-3 rounded-lg border bg-[var(--color-surface)]/30 hover:bg-[var(--color-raised)]/50 transition-all cursor-pointer"
                  style={{ borderColor: rarityColor[nft.rarity] + "40" }}
                  whileHover={{ y: -4, boxShadow: `0 8px 24px ${rarityColor[nft.rarity]}22` }}
                >
                  <div className="relative mb-2">
                    <HexPortrait name={nft.name} size={56} accent={rarityColor[nft.rarity]} />
                  </div>
                  <p className="font-heading text-xs text-[var(--color-ivory)] text-center">{nft.name}</p>
                  <p className="font-mono text-[8px] text-[var(--color-stone)]">{nft.collection} {nft.token}</p>
                  <span
                    className="font-mono text-[8px] tracking-wider uppercase mt-1 px-2 py-0.5 rounded-full border"
                    style={{ color: rarityColor[nft.rarity], borderColor: rarityColor[nft.rarity] + "50", background: rarityColor[nft.rarity] + "12" }}
                  >
                    {nft.rarity}
                  </span>
                  {/* Quick actions on hover */}
                  <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-[var(--color-deep)]/80 to-transparent rounded-lg">
                    <div className="flex gap-1">
                      {["View", "List", "Send"].map((action) => (
                        <button
                          key={action}
                          className="px-2 py-0.5 text-[8px] font-mono tracking-wider bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold-dim)]/50 rounded hover:bg-[var(--color-gold)]/30 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Performance Chart (4 cols) */}
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STAGGER.interactive / 1000 + 0.5 }}
        >
          <GlassCard accent="teal" glowIntensity={0.3}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">Weekly PnL</p>
            <ELOSparkline history={weeklyPnl} height={100} color="var(--color-teal-light)" />
            <div className="flex justify-between mt-2">
              {weekDays.map((d) => (
                <span key={d} className="font-mono text-[8px] text-[var(--color-stone)]">{d}</span>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-rim)] space-y-2">
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[var(--color-stone)]">Best Day</span>
                <span className="font-mono text-xs text-[var(--color-teal-light)]">+310 ARENA (Sat)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[var(--color-stone)]">Worst Day</span>
                <span className="font-mono text-xs text-[var(--color-red-bright)]">-40 ARENA (Tue)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[var(--color-stone)]">Best Agent</span>
                <div className="flex items-center gap-1">
                  <HexPortrait name="ZEUS" size={18} accent="var(--color-gold)" />
                  <span className="font-heading text-xs text-[var(--color-gold)]">ZEUS</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

      </div>

      {/* ── Achievements ──────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.interactive / 1000 + 0.6 }}
      >
        <GlassCard glowIntensity={0.15}>
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-5">Achievements</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {achievements.map((a) => (
              <motion.div
                key={a.label}
                className={`flex flex-col items-center text-center p-3 rounded-lg border transition-colors ${
                  a.earned
                    ? "border-[var(--color-gold-dim)]/40 bg-[var(--color-gold)]/5"
                    : "border-[var(--color-border)]/20 bg-[var(--color-surface)]/20 opacity-40"
                }`}
                whileHover={a.earned ? { scale: 1.05, y: -2 } : {}}
              >
                <span className="text-2xl mb-1">{a.icon}</span>
                <span className="font-mono text-[9px] text-[var(--color-parchment)] leading-tight">{a.label}</span>
                {!a.earned && (
                  <span className="font-mono text-[8px] text-[var(--color-stone)] mt-1">Locked</span>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.section>
    </div>
  );
}
