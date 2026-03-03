"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AgentCard } from "@/components/agents/AgentCard";

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

const MOCK_AGENTS: Agent[] = [
    { agent_id: "1", name: "AlphaGo Zero", level: 7, elo: 2341, wins: 87, losses: 23, win_streak: 5, xp: 3800, xp_to_next_level: 400, personality: "aggressive", skills: ["Endgame Master", "Opening Book", "Sacrifice Gambit"], games_played: 110 },
    { agent_id: "2", name: "DeepBlue Next", level: 4, elo: 1820, wins: 34, losses: 28, win_streak: 0, xp: 1200, xp_to_next_level: 300, personality: "conservative", skills: ["Positional Play", "Endgame Master"], games_played: 62 },
    { agent_id: "3", name: "Chaos Theory", level: 6, elo: 2100, wins: 66, losses: 40, win_streak: 2, xp: 2800, xp_to_next_level: 300, personality: "unpredictable", skills: ["Bluff Master", "Risk Taker", "Wild Card"], games_played: 106 },
];

const ACCENT_COLORS: Record<string, string> = {
    aggressive: "var(--neon-green)",
    conservative: "#60A5FA",
    adaptive: "var(--electric-purple)",
    unpredictable: "#F59E0B",
    chaos: "#EF4444",
};

export default function MyAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
    const [sortBy, setSortBy] = useState<"elo" | "wins" | "level" | "xp">("elo");
    const [filter, setFilter] = useState<string>("all");
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    const sorted = [...agents].sort((a, b) => {
        if (sortBy === "elo") return b.elo - a.elo;
        if (sortBy === "wins") return b.wins - a.wins;
        if (sortBy === "level") return b.level - a.level;
        if (sortBy === "xp") return b.xp - a.xp;
        return 0;
    }).filter(a => filter === "all" || a.personality === filter);

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-xl) var(--space-lg)" }}>
            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: "var(--space-xl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-xs)" }}>
                            My Agents <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>({agents.length})</span>
                        </h1>
                        <p className="text-muted">Manage your AI agent portfolio</p>
                    </div>
                    <Link href="/builder">
                        <button className="btn btn-primary">+ Create New Agent</button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}
            >
                {[
                    { label: "Total Agents", value: agents.length, icon: "🤖" },
                    { label: "Best ELO", value: Math.max(...agents.map(a => a.elo)), icon: "🏆" },
                    { label: "Total Wins", value: agents.reduce((acc, a) => acc + a.wins, 0), icon: "⚔️" },
                    { label: "Avg Level", value: Math.round(agents.reduce((acc, a) => acc + a.level, 0) / agents.length), icon: "⬆️" },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="glass-panel" style={{ padding: "var(--space-md)", textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{icon}</div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--arena-gold)" }}>{value}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{label}</div>
                    </div>
                ))}
            </motion.div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "var(--space-md)", marginBottom: "var(--space-lg)", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "var(--space-xs)", background: "var(--surface-elevated)", borderRadius: "var(--radius-md)", padding: 4 }}>
                    {(["elo", "wins", "level", "xp"] as const).map(s => (
                        <button key={s} onClick={() => setSortBy(s)}
                            className={`btn btn-sm ${sortBy === s ? "btn-primary" : "btn-ghost"}`}
                            style={{ textTransform: "capitalize" }}>
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "var(--space-xs)", background: "var(--surface-elevated)", borderRadius: "var(--radius-md)", padding: 4 }}>
                    {["all", "aggressive", "conservative", "adaptive", "unpredictable"].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`btn btn-sm ${filter === f ? "btn-secondary" : "btn-ghost"}`}
                            style={{ textTransform: "capitalize" }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Agent Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-lg)" }}>
                {sorted.map((agent, i) => (
                    <motion.div key={agent.agent_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
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
                            accentColor={ACCENT_COLORS[agent.personality] || "var(--neon-green)"}
                            onClick={() => setSelectedAgent(agent)}
                        />

                        {/* Action buttons under each card */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
                            <Link href={`/arenas?agent=${agent.agent_id}`}>
                                <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>⚔️ Battle</button>
                            </Link>
                            <Link href={`/builder?edit=${agent.agent_id}`}>
                                <button className="btn btn-secondary btn-sm" style={{ width: "100%" }}>✏️ Edit</button>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
