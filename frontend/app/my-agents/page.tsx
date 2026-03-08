"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AgentCard } from "@/components/agents/AgentCard";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Agent {
    agent_id: string;
    name: string;
    level: number;
    elo: number;
    wins: number;
    losses: number;
    win_streak: number;
    xp: number;
    xp_to_next_level: number;
    personality: string;
    skills: string[];
    games_played: number;
    is_hall_of_fame?: boolean;
}

const ACCENT_COLORS: Record<string, string> = {
    aggressive: "var(--neon-green)",
    conservative: "#60A5FA",
    adaptive: "var(--electric-purple-light)",
    unpredictable: "var(--arena-gold)",
    chaos: "var(--danger-red)",
};

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

export default function MyAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"elo" | "wins" | "level" | "xp">("elo");
    const [filter, setFilter] = useState<string>("all");
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    useEffect(() => {
        // Fetch agents for the current user (assuming a  user ID for now or just fetching all)
        // In a real app, you'd pass the auth token to get only the user's agents.
        // For the sake of the demo, we fetch all agents.
        fetch(`${BACKEND_URL}/agents`)
            .then(res => res.json())
            .then(data => {
                const aArray = Array.isArray(data) ? data : Object.values(data);
                setAgents(aArray as Agent[]);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch agents:", err);
                setLoading(false);
            });
    }, []);

    const sorted = [...agents].sort((a, b) => {
        if (sortBy === "elo") return b.elo - a.elo;
        if (sortBy === "wins") return b.wins - a.wins;
        if (sortBy === "level") return b.level - a.level;
        if (sortBy === "xp") return b.xp - a.xp;
        return 0;
    }).filter(a => filter === "all" || a.personality === filter);

    return (
        <div className="page" style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: "var(--space-2xl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-md)" }}>
                    <div>
                        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "var(--space-xs)", display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}></span>
                            <span className="text-gradient">My Agents</span>
                        </h1>
                        <p className="text-muted" style={{ fontSize: "1.1rem" }}>Build, manage, and deploy your AI champions.</p>
                    </div>
                    <Link href="/builder">
                        <button className="btn btn-primary" style={{ padding: "12px 24px", fontSize: "1.05rem", boxShadow: "0 0 20px var(--electric-purple-glow)" }}>
                            <span style={{ marginRight: 8 }}>+</span> Create New Agent
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-2xl)" }}
            >
                {[
                    { label: "Total Agents", value: agents.length, icon: "", color: "var(--electric-purple-light)" },
                    { label: "Best ELO", value: agents.length ? Math.max(...agents.map(a => a.elo)) : 0, color: "var(--arena-gold)" },
                    { label: "Total Wins", value: agents.reduce((acc, a) => acc + a.wins, 0), color: "var(--neon-green)" },
                    { label: "Avg Level", value: agents.length ? Math.round(agents.reduce((acc, a) => acc + a.level, 0) / agents.length) : 0, color: "var(--text-primary)" },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="glass-card" style={{ padding: "var(--space-lg)", textAlign: "center", background: "rgba(10,5,20,0.4)" }}>
                        <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: color, textShadow: `0 0 20px ${color}40` }}>
                            {value}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{label}</div>
                    </div>
                ))}
            </motion.div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "var(--space-md)", marginBottom: "var(--space-xl)", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "var(--space-md)" }}>
                <div style={{ display: "flex", gap: "var(--space-xs)", background: "rgba(0,0,0,0.3)", borderRadius: "100px", padding: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                    {(["elo", "wins", "level", "xp"] as const).map(s => (
                        <button key={s} onClick={() => setSortBy(s)}
                            className={`btn btn-sm ${sortBy === s ? "btn-primary" : "btn-ghost"}`}
                            style={{ textTransform: "capitalize", borderRadius: "100px", padding: "6px 16px" }}>
                            {s === "elo" ? "Top ELO" : s}
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "var(--space-xs)", background: "rgba(0,0,0,0.3)", borderRadius: "100px", padding: 6, border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
                    {["all", "aggressive", "conservative", "adaptive", "unpredictable", "chaos"].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`btn btn-sm ${filter === f ? "btn-secondary" : "btn-ghost"}`}
                            style={{ textTransform: "capitalize", borderRadius: "100px", padding: "6px 16px" }}>
                            {f === "all" ? "All Archetypes" : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Agent Grid */}
            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-lg)" }}>
                    {[1, 2, 3].map(i => <div key={i} className="glass-card skeleton" style={{ height: 280 }}></div>)}
                </div>
            ) : sorted.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: "var(--space-3xl)", background: "rgba(10,5,20,0.4)" }}>
                    <div style={{ fontSize: "4rem", opacity: 0.5, marginBottom: "var(--space-md)" }}></div>
                    <h3 style={{ color: "var(--text-muted)", marginBottom: "var(--space-sm)" }}>No agents found</h3>
                    <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                        {filter !== "all" ? `You don't have any ${filter} agents.` : "You haven't built any agents yet."}
                    </p>
                    {filter === "all" && (
                        <Link href="/builder">
                            <button className="btn btn-primary">Go to Builder</button>
                        </Link>
                    )}
                </div>
            ) : (
                <motion.div
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-xl)" }}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {sorted.map((agent) => (
                        <motion.div key={agent.agent_id} variants={itemVariants} style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ flexGrow: 1 }}>
                                <AgentCard
                                    agentId={agent.agent_id}
                                    name={agent.name}
                                    level={agent.level}
                                    elo={agent.elo}
                                    wins={agent.wins}
                                    losses={agent.losses}
                                    winStreak={agent.win_streak}
                                    xp={agent.xp}
                                    xpToNext={agent.xp_to_next_level}
                                    skills={agent.skills}
                                    personality={agent.personality}
                                    accentColor={ACCENT_COLORS[agent.personality] || "var(--electric-purple-light)"}
                                    onClick={() => setSelectedAgent(agent)}
                                />
                            </div>

                            {/* Action buttons under each card */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
                                <Link href={`/arenas?agent=${agent.agent_id}`}>
                                    <button className="btn" style={{
                                        width: "100%",
                                        padding: "12px",
                                        background: "rgba(139, 92, 246, 0.15)",
                                        border: "1px solid rgba(139, 92, 246, 0.4)",
                                        color: "var(--electric-purple-light)",
                                        borderRadius: "var(--radius-md)"
                                    }}>
                                        ️ Deploy to Arena
                                    </button>
                                </Link>
                                <Link href={`/builder?edit=${agent.agent_id}`}>
                                    <button className="btn btn-secondary" style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)" }}>
                                        ️ Edit Agent
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
