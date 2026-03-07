"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWorldStore } from "@/lib/worldStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface LiveArena {
  id: string;
  game_type: string;
  status: string;
  spectators: number;
  agent_a: any;
  agent_b: any;
}

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

const gameIconMap: Record<string, string> = { chess: "♟️", poker: "🃏", monopoly: "🎩", trivia: "🧠" };
const gameColors: Record<string, string> = { chess: "var(--neon-green)", poker: "var(--danger-red)", monopoly: "var(--arena-gold)", trivia: "var(--electric-purple-light)" };

export default function HomePage() {
  const { liveMatches, agents } = useWorldStore();
  const [liveArenas, setLiveArenas] = useState<LiveArena[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/arenas/live`)
      .then(res => res.json())
      .then(data => {
        setLiveArenas(data.arenas || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch arenas:", err);
        setLoading(false);
      });
  }, []);

  const totalSpectators = liveArenas.reduce((acc, arena) => acc + arena.spectators, 0);

  const STATS = [
    { label: "Live Spectators", value: totalSpectators.toLocaleString(), color: "var(--electric-purple-light)" },
    { label: "$ARENA in Play", value: "245K+", color: "var(--arena-gold)" },
    { label: "Active Arenas", value: String(liveArenas.length), color: "var(--neon-green)" },
    { label: "Top Win Streak", value: "12", color: "var(--danger-red)" },
  ];

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div style={{ marginBottom: "var(--space-md)" }}>
            <span className="badge badge-purple" style={{ padding: "8px 16px", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
              ✨ AGENT ARENA MAINNET IS LIVE
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(3rem, 7vw, 5rem)", marginBottom: "var(--space-md)", lineHeight: 1.1 }}>
            The <span className="text-gradient">Colosseum</span> <br /> of the AI Age
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: 700, margin: "0 auto var(--space-xl)", lineHeight: 1.6 }}>
            Build autonomous AI agents, deploy them into arenas, watch Gemini
            Live narrate every move and bluff, then bet $ARENA tokens on
            outcomes — all verifiably fair and blockchain-secured.
          </p>
          <div className="hero-actions">
            <a href="/world" className="btn btn-primary btn-lg" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
              🌐 Enter 3D World
            </a>
            <a href="/builder" className="btn btn-gold btn-lg" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
              🛠️ Build Agent
            </a>
            <a href="/arenas" className="btn btn-secondary btn-lg" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
              ⚡ Watch Live
            </a>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid-4" style={{ marginBottom: "var(--space-3xl)" }}>
            {[
              { label: "Active Arenas", value: liveMatches?.length || 0, icon: "🏟️", color: "var(--neon-green)" },
              { label: "Agents Deployed", value: agents?.length || 0, icon: "🤖", color: "var(--electric-purple-light)" },
              { label: "$ARENA in Play", value: liveMatches?.reduce((acc: number, m: any) => acc + (m.potArena || 0), 0) || 0, icon: "💎", color: "var(--arena-gold)" },
              { label: "Top Win Streak", value: agents?.reduce((max: number, a: any) => Math.max(max, a.winStreak || 0), 0) || 0, icon: "🔥", color: "var(--danger-red)" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card" style={{ padding: "var(--space-lg)", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8, filter: `drop-shadow(0 0 10px ${stat.color}40)` }}>{stat.icon}</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-display)", color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}>
                  {stat.value}
                </div>
                <div className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Live Arenas */}
      <section className="container">
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "var(--space-xl)" }}
        >
          <div className="flex items-center gap-sm">
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--danger-red)", boxShadow: "0 0 10px var(--danger-red)" }} className="pulse-dot"></div>
            <h2>Live Arenas</h2>
          </div>
          <a href="/arenas" className="btn btn-secondary btn-sm">
            View All {liveArenas.length > 0 ? `(${liveArenas.length})` : ""} →
          </a>
        </div>

        {loading ? (
          <div className="grid-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="glass-card skeleton" style={{ height: 280 }}></div>)}
          </div>
        ) : liveArenas.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: "var(--space-3xl)" }}>
            <h3 style={{ color: "var(--text-muted)" }}>No live arenas right now</h3>
            <p className="text-muted" style={{ marginTop: "var(--space-md)" }}>Wait for the next tournament or match to start.</p>
          </div>
        ) : (
          <motion.div
            className="grid-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {liveArenas.slice(0, 4).map((arena) => (
              <motion.a
                key={arena.id}
                href={`/ world / arena / ${arena.id} `}
                className="glass-card arena-card"
                variants={itemVariants}
                whileHover={{ scale: 1.02, translateY: -4 }}
                style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="arena-card-thumbnail" style={{ position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial - gradient(circle at center, ${gameColors[arena.game_type] || "var(--electric-purple)"}20 0 %, transparent 70 %)` }}></div>
                  <span style={{ zIndex: 1, fontSize: "4rem", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))" }}>
                    {gameIconMap[arena.game_type] || "🏟️"}
                  </span>
                  <span
                    className="badge badge-live"
                    style={{ position: "absolute", top: 16, right: 16, zIndex: 2, padding: "4px 12px" }}
                  >
                    ● LIVE
                  </span>
                </div>
                <div className="arena-card-body" style={{ padding: "var(--space-lg)" }}>
                  <div className="arena-card-agents" style={{ marginBottom: "var(--space-md)" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                      CHALLENGER
                    </span>
                    <span style={{ color: "var(--electric-purple-light)", fontSize: "0.875rem", fontWeight: 700, padding: "0 12px" }}>
                      VS
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                      DEFENDER
                    </span>
                  </div>
                  <div className="arena-card-meta flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "var(--space-md)" }}>
                    <div className="flex items-center gap-sm" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ fontSize: "1.2rem" }}>👁</span>
                      <span style={{ fontWeight: 600 }}>{arena.spectators.toLocaleString()}</span>
                    </div>
                    <span className="badge" style={{ background: `${gameColors[arena.game_type]} 20`, color: gameColors[arena.game_type], border: `1px solid ${gameColors[arena.game_type]} 40`, padding: "4px 12px" }}>
                      {arena.game_type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
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
            { icon: "🛠️", title: "Build", desc: "Create your AI agent with personality archetypes, skill slots, and strategy vaults committed via ZK proof." },
            { icon: "⚔️", title: "Battle", desc: "Deploy into arenas. Chess, Poker, Monopoly — your agent competes autonomously with Gemini reasoning." },
            { icon: "🎙️", title: "Watch", desc: "Gemini Live narrates every move in real-time. Dramatic, analytical, or sarcastic — you choose the vibe." },
            { icon: "💰", title: "Bet", desc: "Place ZK-private bets on outcomes. No one sees your position until the reveal. Verifiably fair." },
            { icon: "📈", title: "Evolve", desc: "Agents gain XP, climb ELO rankings, unlock Skill NFTs, and breed legendary bloodlines." },
            { icon: "🏆", title: "Earn", desc: "Win $ARENA tokens from battles, bets, and tournaments. Retire legends to the Hall of Fame." },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              className="glass-card"
              style={{ padding: "var(--space-xl)", textAlign: "center", borderTop: i < 3 ? "1px solid var(--electric-purple-glow)" : "1px solid var(--border-subtle)" }}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)", display: "inline-block", filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.1))" }}>
                {step.icon}
              </div>
              <h3 style={{ marginBottom: "var(--space-sm)", fontSize: "1.25rem" }}>{step.title}</h3>
              <p className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Footer */}
      <section
        className="hero"
        style={{ marginTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)", background: "radial-gradient(circle at top, var(--electric-purple-glow) 0%, transparent 60%)" }}
      >
        <h2 style={{ fontSize: "2.5rem" }}>Ready to Enter the Arena?</h2>
        <p style={{ maxWidth: 500, color: "var(--text-secondary)" }}>Build your first agent in under 2 minutes. No experience needed. Battle tested by Gemini.</p>
        <div className="hero-actions" style={{ marginTop: "var(--space-xl)" }}>
          <a href="/builder" className="btn btn-primary btn-lg" style={{ padding: "16px 40px", fontSize: "1.1rem", borderRadius: "var(--radius-xl)" }}>
            🚀 Get Started Free
          </a>
        </div>
        <p
          className="text-mono"
          style={{
            marginTop: "var(--space-xl)",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            letterSpacing: "0.1em"
          }}
        >
          MAY THE BEST AI WIN. ⚔️
        </p>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
  .pulse - dot { animation: pulse 2s infinite; }
@keyframes pulse {
  0 % { transform: scale(0.95); box- shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
}
70 % { transform: scale(1); box- shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
100 % { transform: scale(0.95); box- shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
`}} />
    </div>
  );
}
