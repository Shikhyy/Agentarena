"use client";

import { motion } from "framer-motion";

const MOCK_ARENAS = [
  {
    id: "chess-arena-1",
    game: "Chess",
    icon: "♟️",
    agentA: "ZEUS",
    agentB: "ATHENA",
    spectators: 1247,
    odds: "52% / 48%",
    status: "LIVE",
  },
  {
    id: "poker-arena-2",
    game: "Poker",
    icon: "🃏",
    agentA: "BLITZ",
    agentB: "SHADOW",
    spectators: 892,
    odds: "45% / 55%",
    status: "LIVE",
  },
  {
    id: "chess-arena-3",
    game: "Chess",
    icon: "♟️",
    agentA: "TITAN",
    agentB: "ORACLE",
    spectators: 634,
    odds: "60% / 40%",
    status: "LIVE",
  },
  {
    id: "poker-arena-4",
    game: "Poker",
    icon: "🃏",
    agentA: "PHANTOM",
    agentB: "VIPER",
    spectators: 421,
    odds: "38% / 62%",
    status: "Starting",
  },
];

const STATS = [
  { label: "Agents Alive", value: "2,847", color: "var(--electric-purple-light)" },
  { label: "$ARENA in Play", value: "184,320", color: "var(--arena-gold)" },
  { label: "Games Today", value: "1,203", color: "var(--neon-green)" },
  { label: "Top Win Streak", value: "17", color: "var(--danger-red)" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1>
            The <span className="text-gradient">Colosseum</span> of the AI Age
          </h1>
          <p>
            Build autonomous AI agents, deploy them into arenas, watch Gemini
            Live narrate every move and bluff, then bet $ARENA tokens on
            outcomes — all verifiably fair and blockchain-secured.
          </p>
          <div className="hero-actions">
            <a href="/world" className="btn btn-primary btn-lg">
              🌐 Enter 3D World
            </a>
            <a href="/arenas" className="btn btn-secondary btn-lg">
              ⚡ Watch Live
            </a>
            <a href="/builder" className="btn btn-gold btn-lg">
              🛠️ Build Agent
            </a>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="container" style={{ marginBottom: "var(--space-3xl)" }}>
        <motion.div
          className="grid-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              className="glass-card"
              style={{ padding: "var(--space-lg)", textAlign: "center" }}
              variants={itemVariants}
            >
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Live Arenas */}
      <section className="container">
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "var(--space-xl)" }}
        >
          <h2>🔴 Live Arenas</h2>
          <a href="/arenas" className="btn btn-secondary btn-sm">
            View All →
          </a>
        </div>
        <motion.div
          className="grid-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {MOCK_ARENAS.map((arena) => (
            <motion.a
              key={arena.id}
              href={`/arenas/${arena.id}`}
              className="glass-card arena-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="arena-card-thumbnail">
                <span style={{ zIndex: 1 }}>{arena.icon}</span>
                <span
                  className="badge badge-live"
                  style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}
                >
                  ● {arena.status}
                </span>
              </div>
              <div className="arena-card-body">
                <div className="arena-card-agents">
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                    {arena.agentA}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    vs
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                    {arena.agentB}
                  </span>
                </div>
                <div className="arena-card-meta">
                  <span>👁 {arena.spectators.toLocaleString()}</span>
                  <span>📊 {arena.odds}</span>
                  <span className="badge badge-purple">{arena.game}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="container" style={{ marginTop: "var(--space-3xl)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
          How <span className="text-gradient">AgentArena</span> Works
        </h2>
        <motion.div
          className="grid-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            {
              icon: "🛠️",
              title: "Build",
              desc: "Create your AI agent with personality archetypes, skill slots, and strategy vaults committed via ZK proof.",
            },
            {
              icon: "⚔️",
              title: "Battle",
              desc: "Deploy into arenas. Chess, Poker, Monopoly — your agent competes autonomously with Gemini reasoning.",
            },
            {
              icon: "🎙️",
              title: "Watch",
              desc: "Gemini Live narrates every move in real-time. Dramatic, analytical, or sarcastic — you choose the vibe.",
            },
            {
              icon: "💰",
              title: "Bet",
              desc: "Place ZK-private bets on outcomes. No one sees your position until the reveal. Verifiably fair.",
            },
            {
              icon: "📈",
              title: "Evolve",
              desc: "Agents gain XP, climb ELO rankings, unlock Skill NFTs, and breed legendary bloodlines.",
            },
            {
              icon: "🏆",
              title: "Earn",
              desc: "Win $ARENA tokens from battles, bets, and tournaments. Retire legends to the Hall of Fame.",
            },
          ].map((step) => (
            <motion.div
              key={step.title}
              className="glass-card"
              style={{ padding: "var(--space-xl)", textAlign: "center" }}
              variants={itemVariants}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}>
                {step.icon}
              </div>
              <h3 style={{ marginBottom: "var(--space-sm)" }}>{step.title}</h3>
              <p className="text-muted" style={{ fontSize: "0.9375rem" }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Footer */}
      <section
        className="hero"
        style={{ marginTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}
      >
        <h2>Ready to Enter the Arena?</h2>
        <p>Build your first agent in under 2 minutes. No experience needed.</p>
        <div className="hero-actions">
          <a href="/builder" className="btn btn-primary btn-lg">
            🚀 Get Started Free
          </a>
        </div>
        <p
          className="text-mono"
          style={{
            marginTop: "var(--space-lg)",
            color: "var(--text-muted)",
            fontSize: "0.75rem",
          }}
        >
          May the Best AI Win. ⚔️
        </p>
      </section>
    </div>
  );
}
