"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AgentCard } from "@/components/agents/AgentCard";
import { apiGet } from "@/lib/api";

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

const PERSONALITY_CONFIG: Record<string, { color: string }> = {
    aggressive:    { color: "var(--apex-red)" },
    conservative:  { color: "var(--apex-cyan)" },
    adaptive:      { color: "var(--apex-violet)" },
    unpredictable: { color: "var(--apex-gold)" },
    chaos:         { color: "#FF6EFF" },
};

const SORT_OPTIONS = [
    { id: "elo",  label: "Top ELO" },
    { id: "wins", label: "Wins" },
    { id: "level",label: "Level" },
    { id: "xp",   label: "XP" },
] as const;

const PERSONALITY_FILTERS = ["all", "aggressive", "conservative", "adaptive", "unpredictable", "chaos"];

export default function MyAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"elo" | "wins" | "level" | "xp">("elo");
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        apiGet("/agents")
            .then(data => {
                // Backend returns { agents: [...], total: N }
                const raw: any[] = data.agents || (Array.isArray(data) ? data : []);
                const normalized = raw.map(a => ({
                    ...a,
                    wins: a.wins ?? 0,
                    losses: a.losses ?? 0,
                    xp: a.xp ?? 0,
                    xp_to_next_level: a.xp_to_next_level ?? 100,
                    win_streak: a.win_streak ?? 0,
                    games_played: a.games_played ?? 0,
                    skills: a.skills ?? [],
                }));
                setAgents(normalized);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const sorted = [...agents]
        .sort((a, b) => {
            if (sortBy === "elo")   return b.elo - a.elo;
            if (sortBy === "wins")  return b.wins - a.wins;
            if (sortBy === "level") return b.level - a.level;
            if (sortBy === "xp")   return b.xp - a.xp;
            return 0;
        })
        .filter(a => filter === "all" || a.personality === filter);

    const statCards = [
        { label: "Total Agents",  value: agents.length,                                                          color: "var(--apex-violet)" },
        { label: "Best ELO",      value: agents.length ? Math.max(...agents.map(a => a.elo)) : 0,                color: "var(--apex-gold)" },
        { label: "Total Wins",    value: agents.reduce((s, a) => s + a.wins, 0),                                 color: "var(--apex-green)" },
        { label: "Avg Level",     value: agents.length ? Math.round(agents.reduce((s, a) => s + a.level, 0) / agents.length) : 0, color: "var(--apex-cyan)" },
    ];

    function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
        return (
            <button
                onClick={onClick}
                style={{
                    padding: "6px 16px",
                    borderRadius: 99,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    fontWeight: active ? 700 : 500,
                    background: active ? "var(--apex-violet)" : "transparent",
                    color: active ? "#fff" : "var(--text-muted)",
                    boxShadow: active ? "0 0 14px rgba(123,92,250,0.4)" : "none",
                    transition: "all 0.18s ease",
                    whiteSpace: "nowrap" as const,
                }}
            >{children}</button>
        );
    }

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 28px 80px" }}>

            {/* ── Header ── */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
                <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--apex-cyan)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 1, background: "var(--apex-cyan)" }} />
                        Agent Roster
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "-0.04em", color: "var(--text-primary)", marginBottom: 6 }}>My Agents</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Build, train, and deploy your AI champions.</p>
                </div>
                <Link href="/builder" style={{ textDecoration: "none" }}>
                    <button style={{
                        padding: "12px 26px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        background: "linear-gradient(135deg, var(--apex-violet), #5A3AE8)",
                        color: "#fff",
                        boxShadow: "0 6px 24px rgba(123,92,250,0.4)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}>
                        <span style={{ fontSize: "1.1rem" }}>⚡</span> Create New Agent
                    </button>
                </Link>
            </motion.div>

            {/* ── Stat cards ── */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 36 }}
            >
                {statCards.map(({ label, value, color }) => (
                    <div key={label} style={{
                        padding: "22px 20px",
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        textAlign: "center",
                    }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "2rem", color, textShadow: `0 0 20px ${color}40` }}>{value}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{label}</div>
                    </div>
                ))}
            </motion.div>

            {/* ── Controls ── */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 20 }}>
                {/* Sort */}
                <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 99, padding: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
                    {SORT_OPTIONS.map(s => (
                        <Pill key={s.id} active={sortBy === s.id} onClick={() => setSortBy(s.id)}>{s.label}</Pill>
                    ))}
                </div>
                {/* Filter */}
                <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 99, padding: 4, border: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
                    {PERSONALITY_FILTERS.map(f => (
                        <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
                            {f === "all" ? "All Archetypes" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </Pill>
                    ))}
                </div>
            </div>

            {/* ── Agent grid ── */}
            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 280, borderRadius: 16, background: "rgba(255,255,255,0.03)", animation: "skeleton-shimmer 1.5s ease infinite" }} />
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 24px", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "3.5rem", marginBottom: 16, opacity: 0.35 }}>🤖</div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>No agents found</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
                        {filter !== "all" ? `No ${filter} agents in your roster.` : "You haven't built any agents yet."}
                    </p>
                    {filter === "all" && (
                        <Link href="/builder" style={{ textDecoration: "none" }}>
                            <button style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg, var(--apex-violet), #5A3AE8)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
                                Open Builder
                            </button>
                        </Link>
                    )}
                </div>
            ) : (
                <motion.div
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                >
                    {sorted.map(agent => {
                        const pColor = PERSONALITY_CONFIG[agent.personality]?.color || "var(--apex-violet)";
                        return (
                            <motion.div
                                key={agent.agent_id}
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                style={{ display: "flex", flexDirection: "column" }}
                            >
                                <div style={{ flex: 1 }}>
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
                                        accentColor={pColor}
                                    />
                                </div>
                                {/* Action buttons */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                                    <Link href={`/arenas?agent=${agent.agent_id}`} style={{ textDecoration: "none" }}>
                                        <button style={{
                                            width: "100%", padding: "11px 0",
                                            borderRadius: 10, border: `1px solid ${pColor}40`,
                                            background: `${pColor}12`, color: pColor,
                                            cursor: "pointer", fontWeight: 600, fontSize: "0.82rem",
                                            transition: "all 0.2s",
                                        }}>🚀 Deploy</button>
                                    </Link>
                                    <Link href={`/builder?edit=${agent.agent_id}`} style={{ textDecoration: "none" }}>
                                        <button style={{
                                            width: "100%", padding: "11px 0",
                                            borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                                            background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)",
                                            cursor: "pointer", fontWeight: 600, fontSize: "0.82rem",
                                            transition: "all 0.2s",
                                        }}>✏️ Edit</button>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
