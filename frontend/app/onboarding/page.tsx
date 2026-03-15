"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";

/* ── Data ──────────────────────────────────────────────────── */

const journeySteps = [
  {
    num: 1,
    tag: "CONNECT",
    title: "Link Your Wallet",
    desc: "Connect your wallet to claim your starter pack — 200 ARENA tokens and a default agent skin. Your identity stays private via zero-knowledge proofs.",
    icon: "🔗",
  },
  {
    num: 2,
    tag: "FORGE",
    title: "Build Your Agent",
    desc: "Enter the Workshop and forge your first AI agent. Choose an archetype, set its personality traits, and equip skill orbs to shape its fighting style.",
    icon: "⚒️",
  },
  {
    num: 3,
    tag: "COMPETE",
    title: "Enter the Arena",
    desc: "Deploy your agent to the Arena floor. Watch your first live match, place your first bet, and earn ARENA tokens as you climb the ranks.",
    icon: "⚔️",
  },
];

const starterPack = [
  { icon: "🪙", label: "200 ARENA Tokens",       desc: "Enough to place bets and mint your first agent" },
  { icon: "🎭", label: "Default Agent Skin",      desc: "Obsidian frame — customize later with NFT skins" },
  { icon: "🔮", label: "3 Basic Skill Orbs",      desc: "Aggression, Defense, and Tempo — shape your strategy" },
  { icon: "🏛️", label: "All Game Halls Access",   desc: "Explore every arena district from day one" },
];

const quickLinks = [
  {
    href: "/builder",
    title: "Agent Builder",
    desc: "Forge, customize, and train your AI combatants in the Workshop.",
    cta: "Open Workshop",
    accent: "gold" as const,
    color: "var(--color-gold)",
    icon: "⚒️",
  },
  {
    href: "/world",
    title: "Enter World",
    desc: "Explore the 3D arena district, interact with other operators, and discover events.",
    cta: "Enter World",
    accent: "teal" as const,
    color: "var(--color-teal-light)",
    icon: "🌐",
  },
  {
    href: "/arenas",
    title: "Watch Matches",
    desc: "Spectate live agent battles, analyze strategies, and place real-time bets.",
    cta: "Watch Live",
    accent: "amber" as const,
    color: "var(--color-amber)",
    icon: "📡",
  },
];

const faqs = [
  {
    q: "What is $ARENA?",
    a: "ARENA is the native utility token of AgentArena. Use it to place bets, mint agents, purchase skill orbs, and trade NFTs. Earn ARENA by winning matches and tournaments.",
  },
  {
    q: "How do agents work?",
    a: "Agents are AI-driven combatants you forge in the Workshop. Each has an archetype, personality traits, and skill orbs that determine its battle strategy. They fight autonomously in real-time matches.",
  },
  {
    q: "Is betting private?",
    a: "Yes. All bets are sealed with zero-knowledge proofs. Your wager amounts and picks are encrypted on-chain — only revealed at settlement. No one sees your strategy.",
  },
  {
    q: "Can I earn real value?",
    a: "Absolutely. ARENA tokens are tradeable. Win bets, climb the leaderboard, breed rare agents, and trade NFTs on the marketplace. Top operators earn significant returns.",
  },
];

/* ── Component ─────────────────────────────────────────────── */

export default function OnboardingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20 max-w-[1200px] mx-auto">

      {/* ── Immersive Welcome Header ─────────────────────── */}
      <motion.section
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.p
          className="font-mono text-[9px] tracking-[6px] uppercase text-[var(--color-gold-dim)] mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          First Session · Onboarding
        </motion.p>
        <h1 className="font-display text-5xl md:text-7xl text-[var(--color-gold)] tracking-wider mb-6"
            style={{ textShadow: "0 0 40px rgba(200,150,60,0.25)" }}>
          Welcome to the Arena
        </h1>
        <motion.p
          className="font-narrative text-lg md:text-xl text-[var(--color-stone)] max-w-2xl mx-auto leading-relaxed italic"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Beneath the neon spires of a world forged by code, AI gladiators clash in arenas of
          light. You are an Operator — architect of champions, keeper of wagers, seeker of glory.
          Your journey begins with a single connection.
        </motion.p>
      </motion.section>

      {/* ── 3-Step Journey ───────────────────────────────── */}
      <motion.section
        className="relative mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {/* Progress line connecting steps */}
        <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-[var(--color-gold-dim)] via-[var(--color-gold)] to-[var(--color-gold-dim)] opacity-30" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {journeySteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
            >
              <GlassCard glowIntensity={0.3}>
                <div className="flex flex-col items-center text-center">
                  {/* Gold numbered circle */}
                  <div className="relative z-10 w-14 h-14 rounded-full border-2 border-[var(--color-gold)] bg-[var(--color-gold)]/10 flex items-center justify-center mb-4"
                       style={{ boxShadow: "0 0 20px rgba(200,150,60,0.2)" }}>
                    <span className="font-display text-2xl text-[var(--color-gold)]">{step.num}</span>
                  </div>
                  <span className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-gold)] mb-2">{step.tag}</span>
                  <h3 className="font-heading text-xl text-[var(--color-ivory)] mb-3">{step.title}</h3>
                  <p className="text-sm text-[var(--color-stone)] leading-relaxed">{step.desc}</p>
                  <span className="text-3xl mt-4">{step.icon}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Starter Pack Showcase ─────────────────────────── */}
      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <GlassCard accent="gold" glowIntensity={0.4}>
          <div className="text-center mb-6">
            <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-gold-dim)] mb-2">Claim on connect</p>
            <h2 className="font-heading text-2xl text-[var(--color-gold)]">Starter Pack</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {starterPack.map((item, i) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center text-center p-4 rounded-lg border border-[var(--color-gold-dim)]/20 bg-[var(--color-gold)]/5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <p className="font-heading text-sm text-[var(--color-ivory)] mb-1">{item.label}</p>
                <p className="font-mono text-[10px] text-[var(--color-stone)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.section>

      {/* ── Quick Links Grid ─────────────────────────────── */}
      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-ash)] text-center mb-6">Choose Your Path</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
            >
              <GlassCard accent={link.accent} glowIntensity={0.3}>
                <div className="flex flex-col items-center text-center h-full">
                  <span className="text-4xl mb-3">{link.icon}</span>
                  <h3 className="font-heading text-xl mb-2" style={{ color: link.color }}>{link.title}</h3>
                  <p className="text-sm text-[var(--color-stone)] mb-5 flex-1">{link.desc}</p>
                  <Link
                    href={link.href}
                    className="w-full py-3 font-heading text-base text-center rounded border transition-all hover:scale-[1.02]"
                    style={{
                      color: link.color,
                      borderColor: link.color + "60",
                      background: link.color + "12",
                    }}
                  >
                    {link.cta}
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Hero CTA ─────────────────────────────────────── */}
      <motion.section
        className="text-center mb-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
      >
        <Link href="/world">
          <motion.button
            className="px-12 py-4 font-heading text-xl text-[var(--color-deep)] bg-[var(--color-gold)] rounded-lg border-2 border-[var(--color-gold-light)]"
            style={{ boxShadow: "0 0 30px rgba(200,150,60,0.3)" }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(200,150,60,0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Begin Your Journey
          </motion.button>
        </Link>
        <p className="font-mono text-[10px] text-[var(--color-stone)] mt-3">No gas required for onboarding</p>
      </motion.section>

      {/* ── FAQ Section ───────────────────────────────────── */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-ash)] text-center mb-6">Common Questions</p>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <GlassCard key={i} glowIntensity={0.1}>
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-heading text-base text-[var(--color-ivory)]">{faq.q}</span>
                <motion.span
                  className="text-[var(--color-gold)] text-xl ml-4 shrink-0"
                  animate={{ rotate: openFaq === i ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-[var(--color-stone)] mt-4 pt-4 border-t border-[var(--color-rim)] leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
