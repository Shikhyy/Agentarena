"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface GameEvent {
    type: string;
    round: number;
    description: string;
    elo_after?: number;
    xp_after?: number;
}

interface AgentStats {
    agent_id: string;
    name: string;
    level: number;
    elo: number;
    peak_elo: number;
    xp: number;
    xp_to_next: number;
    win_streak: number;
    wins: number;
    losses: number;
    draws: number;
    games_played: number;
    personality: string;
    skills: string[];
    generation: number;
    battle_history: {
        game_id: string;
        opponent: string;
        outcome: "win" | "loss" | "draw";
        elo_change: number;
        xp_gained: number;
        game_type: string;
        date: string;
    }[];
    elo_history: { date: string; elo: number }[];
}

export default function AgentStatsPage() {
    const params = useParams();
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"overview" | "history" | "elo_curve">("overview");

    useEffect(() => {
        fetch(`${BACKEND_URL}/agents/${params.id}`)
            .then(res => res.json())
            .then(data => {
                // Synthesize missing arrays for safety since backend might not populate all defaults if newly synthesized mock agent
                const safeStats = {
                    ...data,
                    battle_history: data.battle_history || [],
                    elo_history: data.elo_history || [{ date: new Date().toISOString().split("T")[0], elo: data.elo || 1500 }],
                    skills: data.skills || []
                };
                setStats(safeStats);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch agent stats:", err);
                setLoading(false);
            });
    }, [params.id]);

    if (!stats) return <div className="page" style={{ padding: "var(--space-3xl) 0", textAlign: "center", color: "var(--text-muted)" }}>{loading ? "Loading stats..." : "Agent Not Found"}</div>;

    const winRate = stats.games_played > 0 ? ((stats.wins / stats.games_played) * 100).toFixed(1) : "0.0";
    const xpPct = Math.round((stats.xp / (stats.xp + stats.xp_to_next)) * 100) || 0;

    // Mini ELO sparkline using SVG
    const maxElo = Math.max(...stats.elo_history.map((e: any) => e.elo));
    const minElo = Math.min(...stats.elo_history.map((e: any) => e.elo));
    const sparkPoints = stats.elo_history.map((e: any, i: number) => {
        const x = stats.elo_history.length > 1 ? (i / (stats.elo_history.length - 1)) * 500 : 250;
        const mappedY = maxElo === minElo ? 45 : ((e.elo - minElo) / (maxElo - minElo)) * 70;
        const y = 80 - mappedY;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "var(--space-xl) var(--space-lg)" }}>
            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)", marginBottom: "var(--space-xl)" }}>
                <div style={{
                    width: 80, height: 80, borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, var(--neon-green), var(--electric-purple))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2.5rem", fontWeight: 800,
                }}>
                    {stats.name.charAt(0)}
                </div>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: 4 }}>{stats.name}</h1>
                    <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
                        <span className="badge badge-purple">Level {stats.level}</span>
                        <span className="badge" style={{ color: "var(--arena-gold)" }}>🏆 {stats.elo} ELO</span>
                        <span className="badge">{stats.personality}</span>
                        {stats.generation > 0 && <span className="badge badge-win">Gen {stats.generation}</span>}
                    </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ color: "var(--neon-green)", fontWeight: 700, fontSize: "1.1rem" }}>🔥 {stats.win_streak} streak</div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>Peak: {stats.peak_elo} ELO</div>
                </div>
            </motion.div>

            {/* XP Bar */}
            <div className="glass-panel" style={{ padding: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-xs)", fontSize: "0.85rem" }}>
                    <span>Level {stats.level} Progress</span>
                    <span style={{ color: "var(--arena-gold)" }}>{stats.xp} / {stats.xp + stats.xp_to_next} XP ({xpPct}%)</span>
                </div>
                <div style={{ height: 8, background: "var(--surface-sunken)", borderRadius: 4, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                        style={{ height: "100%", background: "linear-gradient(90deg, var(--electric-purple), var(--arena-gold))", borderRadius: 4 }} />
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
                {[
                    { label: "Win Rate", value: `${winRate}%`, color: "var(--neon-green)", icon: "🏆" },
                    { label: "Wins", value: stats.wins, color: "var(--neon-green)", icon: "⚔️" },
                    { label: "Losses", value: stats.losses, color: "#EF4444", icon: "💀" },
                    { label: "Games", value: stats.games_played, color: "var(--text-primary)", icon: "🎮" },
                ].map(({ label, value, color, icon }) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }} className="glass-panel" style={{ padding: "var(--space-lg)", textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{icon}</div>
                        <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-mono)", color }}>{value}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-lg)", background: "var(--surface-elevated)", borderRadius: "var(--radius-md)", padding: 4, width: "fit-content" }}>
                {(["overview", "history", "elo_curve"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-ghost"}`} style={{ textTransform: "capitalize" }}>
                        {t === "elo_curve" ? "ELO Curve" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
                    {/* Skills */}
                    <div className="glass-panel" style={{ padding: "var(--space-lg)" }}>
                        <h3 style={{ marginBottom: "var(--space-md)" }}>⚡ Equipped Skills</h3>
                        {stats.skills.map(skill => (
                            <div key={skill} style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", padding: "var(--space-sm)", background: "var(--surface-sunken)", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-sm)" }}>
                                <span>⚡</span>
                                <span style={{ fontWeight: 600 }}>{skill}</span>
                            </div>
                        ))}
                    </div>
                    {/* Win/Loss chart */}
                    <div className="glass-panel" style={{ padding: "var(--space-lg)" }}>
                        <h3 style={{ marginBottom: "var(--space-md)" }}>📊 Record Breakdown</h3>
                        {[{ label: "Wins", value: stats.wins, color: "var(--neon-green)" }, { label: "Losses", value: stats.losses, color: "#EF4444" }, { label: "Draws", value: stats.draws, color: "#F59E0B" }].map(({ label, value, color }) => (
                            <div key={label} style={{ marginBottom: "var(--space-sm)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 4 }}>
                                    <span className="text-muted">{label}</span>
                                    <span style={{ color }}>{value}</span>
                                </div>
                                <div style={{ height: 6, background: "var(--surface-sunken)", borderRadius: 3 }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(value / stats.games_played) * 100}%` }} transition={{ delay: 0.3 }}
                                        style={{ height: "100%", background: color, borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "history" && (
                <div className="glass-panel" style={{ overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                {["Date", "Opponent", "Game", "Outcome", "ELO Δ", "XP"].map(h => (
                                    <th key={h} style={{ padding: "var(--space-md)", textAlign: "left", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.battle_history.map((battle, i) => (
                                <motion.tr key={battle.game_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                    <td style={{ padding: "var(--space-md)", fontSize: "0.8rem", color: "var(--text-muted)" }}>{battle.date}</td>
                                    <td style={{ padding: "var(--space-md)", fontWeight: 600 }}>{battle.opponent}</td>
                                    <td style={{ padding: "var(--space-md)" }}><span className="badge" style={{ fontSize: "0.7rem" }}>{battle.game_type}</span></td>
                                    <td style={{ padding: "var(--space-md)" }}>
                                        <span style={{ color: battle.outcome === "win" ? "var(--neon-green)" : battle.outcome === "draw" ? "#F59E0B" : "#EF4444", fontWeight: 700, textTransform: "uppercase", fontSize: "0.8rem" }}>
                                            {battle.outcome}
                                        </span>
                                    </td>
                                    <td style={{ padding: "var(--space-md)", fontFamily: "var(--font-mono)", color: battle.elo_change > 0 ? "var(--neon-green)" : "#EF4444" }}>
                                        {battle.elo_change > 0 ? `+${battle.elo_change}` : battle.elo_change}
                                    </td>
                                    <td style={{ padding: "var(--space-md)", color: "var(--arena-gold)", fontFamily: "var(--font-mono)" }}>+{battle.xp_gained}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === "elo_curve" && (
                <div className="glass-panel" style={{ padding: "var(--space-xl)" }}>
                    <h3 style={{ marginBottom: "var(--space-lg)" }}>📈 ELO Over Time</h3>
                    <svg viewBox="0 0 500 100" style={{ width: "100%", height: 160 }}>
                        <defs>
                            <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--electric-purple)" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="var(--electric-purple)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <polygon points={`0,80 ${sparkPoints} 500,80`} fill="url(#eloGradient)" />
                        <polyline points={sparkPoints} fill="none" stroke="var(--electric-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {stats.elo_history.map((e, i) => {
                            const x = (i / (stats.elo_history.length - 1)) * 500;
                            const y = 80 - ((e.elo - minElo) / (maxElo - minElo + 1)) * 70;
                            return <circle key={i} cx={x} cy={y} r={4} fill="var(--arena-gold)" />;
                        })}
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "var(--space-sm)" }}>
                        {stats.elo_history.map(e => <span key={e.date}>{e.date.slice(5)}</span>)}
                    </div>
                </div>
            )}
        </div>
    );
}
