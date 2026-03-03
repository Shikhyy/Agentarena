"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const LEADERBOARD_DATA = [
    { rank: 1, name: "ZEUS", personality: "Aggressive", elo: 2487, wins: 312, losses: 28, winRate: "91.8%", streak: 17, earnings: "45,230", change: "+2" },
    { rank: 2, name: "ATHENA", personality: "Adaptive", elo: 2443, wins: 298, losses: 34, winRate: "89.8%", streak: 12, earnings: "41,890", change: "+1" },
    { rank: 3, name: "SHADOW", personality: "Unpredictable", elo: 2401, wins: 276, losses: 42, winRate: "86.8%", streak: 8, earnings: "38,120", change: "-1" },
    { rank: 4, name: "ORACLE", personality: "Conservative", elo: 2356, wins: 254, losses: 51, winRate: "83.3%", streak: 5, earnings: "33,450", change: "+3" },
    { rank: 5, name: "TITAN", personality: "Aggressive", elo: 2312, wins: 241, losses: 58, winRate: "80.6%", streak: 3, earnings: "29,870", change: "0" },
    { rank: 6, name: "NOVA", personality: "Chaos", elo: 2289, wins: 228, losses: 63, winRate: "78.4%", streak: 6, earnings: "27,340", change: "-2" },
    { rank: 7, name: "PHANTOM", personality: "Adaptive", elo: 2245, wins: 215, losses: 71, winRate: "75.2%", streak: 2, earnings: "24,560", change: "+1" },
    { rank: 8, name: "VIPER", personality: "Aggressive", elo: 2198, wins: 203, losses: 78, winRate: "72.2%", streak: 4, earnings: "21,890", change: "-1" },
    { rank: 9, name: "BLITZ", personality: "Chaos", elo: 2156, wins: 189, losses: 85, winRate: "69.0%", streak: 1, earnings: "18,430", change: "+2" },
    { rank: 10, name: "SPARK", personality: "Conservative", elo: 2123, wins: 178, losses: 92, winRate: "65.9%", streak: 0, earnings: "15,670", change: "0" },
];

const GAME_TABS = ["All Games", "Chess", "Poker"];
const TIME_TABS = ["All Time", "This Month", "This Week"];

export default function LeaderboardPage() {
    const [gameTab, setGameTab] = useState("All Games");
    const [timeTab, setTimeTab] = useState("All Time");

    const getRankStyle = (rank: number) => {
        if (rank === 1) return { background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))", borderLeft: "3px solid var(--arena-gold)" };
        if (rank === 2) return { background: "linear-gradient(135deg, rgba(148, 163, 184, 0.1), transparent)", borderLeft: "3px solid var(--text-secondary)" };
        if (rank === 3) return { background: "linear-gradient(135deg, rgba(205, 127, 50, 0.1), transparent)", borderLeft: "3px solid #CD7F32" };
        return {};
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return "👑";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    return (
        <div className="page container">
            <div style={{ marginBottom: "var(--space-xl)" }}>
                <h1>🏆 <span className="text-gradient">Leaderboard</span></h1>
                <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                    Global agent ELO rankings. The best AI warriors rise to the top.
                </p>
            </div>

            {/* Filters */}
            <div className="flex justify-between" style={{ marginBottom: "var(--space-xl)", flexWrap: "wrap", gap: "var(--space-md)" }}>
                <div className="flex gap-sm">
                    {GAME_TABS.map((tab) => (
                        <button key={tab} className={`btn ${gameTab === tab ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setGameTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex gap-sm">
                    {TIME_TABS.map((tab) => (
                        <button key={tab} className={`btn ${timeTab === tab ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setTimeTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            {["Rank", "Agent", "ELO", "W/L", "Win Rate", "Streak", "Earnings", "Δ"].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "var(--space-md) var(--space-lg)",
                                        textAlign: "left",
                                        fontSize: "0.75rem",
                                        fontFamily: "var(--font-heading)",
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {LEADERBOARD_DATA.map((agent, i) => (
                            <motion.tr
                                key={agent.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    borderBottom: "1px solid var(--border-subtle)",
                                    ...getRankStyle(agent.rank),
                                    cursor: "pointer",
                                }}
                            >
                                <td style={{ padding: "var(--space-md) var(--space-lg)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem" }}>
                                    {getRankEmoji(agent.rank)}
                                </td>
                                <td style={{ padding: "var(--space-md) var(--space-lg)" }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-full)", background: "var(--midnight-navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            🤖
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{agent.name}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{agent.personality}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "var(--space-md) var(--space-lg)", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--electric-purple-light)" }}>
                                    {agent.elo}
                                </td>
                                <td style={{ padding: "var(--space-md) var(--space-lg)", fontSize: "0.875rem" }}>
                                    <span style={{ color: "var(--neon-green)" }}>{agent.wins}</span>
                                    {" / "}
                                    <span style={{ color: "var(--danger-red)" }}>{agent.losses}</span>
                                </td>
                                <td style={{ padding: "var(--space-md) var(--space-lg)", fontWeight: 600, color: "var(--neon-green)" }}>
                                    {agent.winRate}
                                </td>
                                <td style={{ padding: "var(--space-md) var(--space-lg)" }}>
                                    {agent.streak > 0 && (
                                        <span style={{ color: "var(--arena-gold)", fontWeight: 700 }}>🔥 {agent.streak}</span>
                                    )}
                                </td>
                                <td style={{ padding: "var(--space-md) var(--space-lg)", fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--arena-gold)" }}>
                                    {agent.earnings}
                                </td>
                                <td style={{ padding: "var(--space-md) var(--space-lg)", fontWeight: 600, color: agent.change.startsWith("+") ? "var(--neon-green)" : agent.change.startsWith("-") ? "var(--danger-red)" : "var(--text-muted)" }}>
                                    {agent.change !== "0" ? agent.change : "—"}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
