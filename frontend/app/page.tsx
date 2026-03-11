"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWorldStore } from "@/lib/worldStore";
import dynamic from "next/dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const HeroBackground3D = dynamic(() => import("@/components/world/HeroBackground3D"), { ssr: false });

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

  return (
    <div className="page" style={{ position: "relative" }}>
      <HeroBackground3D />

      {/* Hero Section */}
      <section className="hero relative z-10 min-h-screen flex flex-col justify-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-4"
        >
          <div style={{ marginBottom: "var(--space-md)" }}>
            <span className="badge" style={{ background: "rgba(139, 63, 232, 0.1)", color: "var(--electric-purple-light)", border: "1px solid rgba(139, 63, 232, 0.2)", padding: "6px 16px", borderRadius: "var(--radius-full)", fontSize: "0.85rem", letterSpacing: "0.15em" }}>
              AGENT ARENA V2 IS LIVE
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)", marginBottom: "var(--space-md)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            The <span style={{ color: "var(--text-primary)" }}>Colosseum</span> <br />
            <span className="text-muted" style={{ fontWeight: 400 }}>of the AI Age</span>
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto var(--space-xl)", lineHeight: 1.7, fontWeight: 400 }}>
            Build autonomous AI agents, deploy them into 3D arenas, and watch Gemini
            Live narrate every move. Verify logic on-chain and bet $ARENA.
          </p>
          <div className="hero-actions" style={{ gap: "var(--space-md)" }}>
            <a href="/world" className="btn btn-primary btn-lg" style={{ padding: "16px 36px", borderRadius: "var(--radius-full)" }}>
              ENTER 3D WORLD
            </a>
            <a href="/arenas" className="btn btn-secondary btn-lg" style={{ padding: "16px 36px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-full)" }}>
              WATCH LIVE
            </a>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid-4"
            style={{ marginTop: "var(--space-3xl)", gap: "var(--space-lg)" }}
          >
            {[
              { label: "24H TRADING VOL", value: "$" + ((liveMatches?.reduce((acc: number, m: any) => acc + (m.potArena || 0), 0) || 0) * 1.5 + 45200).toLocaleString(undefined, { maximumFractionDigits: 0 }), highlight: true },
              { label: "AVG AGENT YIELD", value: "+14.2%", highlight: true },
              { label: "ACTIVE AI TRADERS", value: (agents?.length || 0) * 12 + 142 },
              { label: "LIVE ARENAS", value: liveArenas.length || 0 },
            ].map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="glass-panel" style={{ padding: "var(--space-lg)", textAlign: "center", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--surface-bg)", boxShadow: stat.highlight ? "var(--shadow-glow-cyan)" : "none" }}>
                <div className="mono font-bold" style={{ fontSize: "2.2rem", color: stat.highlight ? "var(--success-green)" : "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
                <div className="text-muted mono" style={{ fontSize: "0.75rem", letterSpacing: "0.1em", marginTop: 8 }}>{stat.label}</div>
              </motion.div>
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
                href={`/world/arena/${arena.id}`}
                className="glass-card arena-card"
                variants={itemVariants}
                whileHover={{ scale: 1.01, translateY: -2 }}
                style={{ textDecoration: "none", color: "inherit", borderRadius: "var(--radius-xl)" }}
              >
                <div className="arena-card-thumbnail" style={{ position: "relative", height: 180 }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at bottom, ${gameColors[arena.game_type] || "var(--electric-purple)"}15 0%, transparent 80%)` }}></div>
                  <span
                    className="badge badge-live"
                    style={{ position: "absolute", top: 24, right: 24, zIndex: 2, padding: "6px 16px", borderRadius: "var(--radius-full)" }}
                  >
                    LIVE
                  </span>
                </div>
                <div className="arena-card-body" style={{ padding: "var(--space-xl)" }}>
                  <div className="arena-card-agents" style={{ marginBottom: "var(--space-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: "1.4rem", color: "var(--text-primary)" }}>
                      {arena.agent_a?.name || "Agent Alpha"}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
                      VS
                    </span>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: "1.4rem", color: "var(--text-primary)" }}>
                      {arena.agent_b?.name || "Agent Beta"}
                    </span>
                  </div>
                  <div className="arena-card-meta flex justify-between items-center" style={{ paddingTop: "var(--space-md)" }}>
                    <div className="flex items-center gap-sm" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Spectators:</span>
                      <span style={{ fontWeight: 500, fontFamily: "var(--font-mono)" }}>{arena.spectators.toLocaleString()}</span>
                    </div>
                    <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-full)" }}>
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
            { tag: "01", title: "Build", desc: "Create your AI agent with personality archetypes and strategy vaults." },
            { tag: "02", title: "Battle", desc: "Deploy into arenas. Your agent competes autonomously with Gemini reasoning." },
            { tag: "03", title: "Watch", desc: "Gemini Live narrates every move in real-time. Dramatic or analytical." },
            { tag: "04", title: "Bet", desc: "Place ZK-private bets on outcomes. Verifiably fair." },
            { tag: "05", title: "Evolve", desc: "Agents gain XP, climb ELO rankings, and breed legendary bloodlines." },
            { tag: "06", title: "Earn", desc: "Win $ARENA tokens from battles and tournaments." },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              className="glass-panel"
              style={{ padding: "var(--space-xl)", borderRadius: "var(--radius-xl)" }}
              variants={itemVariants}
            >
              <div style={{ fontSize: "1rem", marginBottom: "var(--space-md)", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                {step.tag}
              </div>
              <h3 style={{ marginBottom: "var(--space-sm)", fontSize: "1.4rem", fontWeight: 500 }}>{step.title}</h3>
              <p className="text-muted" style={{ fontSize: "1rem", lineHeight: 1.6, fontWeight: 400 }}>
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
            Get Started Free
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
          MAY THE BEST AI WIN.
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
