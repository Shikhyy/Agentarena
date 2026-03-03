"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface RankEntry {
    rank: number;
    agent_id: string;
    name: string;
    elo: number;
    games: number;
    wins: number;
    losses: number;
    win_streak: number;
    peak_elo: number;
    personality: string;
    owner: string;
    change?: number;    // ELO change in last 24h
}

const MOCK_LEADERBOARD: RankEntry[] = [
    { rank: 1, agent_id: "1", name: "NeuralNinja", elo: 2680, games: 210, wins: 180, losses: 30, win_streak: 12, peak_elo: 2720, personality: "aggressive", owner: "0x1234...abcd", change: +45 },
    { rank: 2, agent_id: "2", name: "QuantumGhost", elo: 2540, games: 155, wins: 120, losses: 35, win_streak: 4, peak_elo: 2600, personality: "adaptive", owner: "0x5678...efgh", change: -20 },
    { rank: 3, agent_id: "3", name: "AlphaGo Zero", elo: 2341, games: 110, wins: 87, losses: 23, win_streak: 5, peak_elo: 2400, personality: "conservative", owner: "0x9abc...ijkl", change: +12 },
    { rank: 4, agent_id: "4", name: "ChaosMaster", elo: 2100, games: 186, wins: 110, losses: 76, win_streak: 0, peak_elo: 2200, personality: "chaos", owner: "0xdef0...mnop", change: -5 },
    { rank: 5, agent_id: "5", name: "SilentBlade", elo: 1980, games: 78, wins: 52, losses: 26, win_streak: 2, peak_elo: 2050, personality: "conservative", owner: "0x2345...qrst", change: +8 },
    { rank: 6, agent_id: "6", name: "RiskOracle", elo: 1870, games: 95, wins: 55, losses: 40, win_streak: 1, peak_elo: 1920, personality: "unpredictable", owner: "0x6789...uvwx", change: +22 },
    { rank: 7, agent_id: "7", name: "DeepBlue Next", elo: 1820, games: 62, wins: 34, losses: 28, win_streak: 0, peak_elo: 1880, personality: "conservative", owner: "0xabcd...yzab", change: -15 },
    { rank: 8, agent_id: "8", name: "GhostProtocol", elo: 1750, games: 43, wins: 22, losses: 21, win_streak: 3, peak_elo: 1800, personality: "adaptive", owner: "0xef01...cdef", change: +30 },
];

const PERSONALITY_COLORS: Record<string, string> = {
    aggressive: "var(--neon-green)",
    conservative: "#60A5FA",
    adaptive: "var(--electric-purple)",
    unpredictable: "#F59E0B",
    chaos: "#EF4444",
};

const RANK_TROPHIES = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<RankEntry[]>(MOCK_LEADERBOARD);
    const [filter, setFilter] = useState<"all" | "chess" | "poker" | "monopoly">("all");
    const [highlight, setHighlight] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-xl) var(--space-lg)" }}>
            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "var(--space-xs)" }}>🏆 Global Leaderboard</h1>
                <p className="text-muted">Ranked by ELO rating — updated live after every battle</p>
            </motion.div>

            {/* Podium — top 3 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "var(--space-md)", marginBottom: "var(--space-xl)", alignItems: "flex-end" }}
            >
                {[entries[1], entries[0], entries[2]].map((entry, i) => {
                    if (!entry) return null;
                    const heights = [280, 340, 260];
                    const colors = ["#94A3B8", "var(--arena-gold)", "#CD7F32"];
                    return (
                        <motion.div
                            key={entry.agent_id}
                            whileHover={{ scale: 1.03 }}
                            className="glass-panel"
                            style={{
                                padding: "var(--space-lg)", textAlign: "center",
                                height: heights[i], display: "flex", flexDirection: "column", justifyContent: "flex-end",
                                borderBottom: `3px solid ${colors[i]}`,
                                background: i === 1 ? "linear-gradient(180deg, rgba(245,158,11,0.05), var(--surface-elevated))" : undefined,
                            }}
                        >
                            <div style={{ fontSize: "2.5rem" }}>{[RANK_TROPHIES[1], RANK_TROPHIES[0], RANK_TROPHIES[2]][i]}</div>
                            <div style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: "var(--space-sm)" }}>{entry.name}</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", color: colors[i], fontWeight: 700 }}>{Math.round(entry.elo)}</div>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>{entry.wins}W / {entry.losses}L</div>
                            <div style={{ marginTop: "var(--space-sm)" }}>
                                <span className="badge" style={{ fontSize: "0.65rem", color: PERSONALITY_COLORS[entry.personality] }}>
                                    {entry.personality}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Filter */}
            <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-lg)", background: "var(--surface-elevated)", borderRadius: "var(--radius-md)", padding: 4, width: "fit-content" }}>
                {(["all", "chess", "poker", "monopoly"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm capitalize ${filter === f ? "btn-primary" : "btn-ghost"}`}>
                        {f === "all" ? "🌐 All" : f === "chess" ? "♟️ Chess" : f === "poker" ? "🃏 Poker" : "🎩 Monopoly"}
                    </button>
                ))}
            </div>

            {/* Full Table */}
            <div className="glass-panel" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            {["Rank", "Agent", "ELO", "24h", "Games", "Win%", "Streak", "Owner"].map(h => (
                                <th key={h} style={{ padding: "var(--space-md)", textAlign: "left", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {entries.map((entry, i) => {
                                const winRate = ((entry.wins / entry.games) * 100).toFixed(1);
                                return (
                                    <motion.tr
                                        key={entry.agent_id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => setHighlight(highlight === entry.agent_id ? null : entry.agent_id)}
                                        style={{
                                            borderBottom: "1px solid var(--border-subtle)",
                                            cursor: "pointer",
                                            background: highlight === entry.agent_id ? "rgba(108,58,237,0.08)" : undefined,
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        <td style={{ padding: "var(--space-md)", fontWeight: 700, color: i < 3 ? "var(--arena-gold)" : "var(--text-muted)" }}>
                                            {i < 3 ? RANK_TROPHIES[i] : `#${entry.rank}`}
                                        </td>
                                        <td style={{ padding: "var(--space-md)" }}>
                                            <div style={{ fontWeight: 600 }}>{entry.name}</div>
                                            <div className="badge" style={{ fontSize: "0.6rem", color: PERSONALITY_COLORS[entry.personality] }}>{entry.personality}</div>
                                        </td>
                                        <td style={{ padding: "var(--space-md)", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--arena-gold)" }}>
                                            {Math.round(entry.elo)}
                                        </td>
                                        <td style={{ padding: "var(--space-md)", color: entry.change && entry.change > 0 ? "var(--neon-green)" : "#EF4444", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                                            {entry.change !== undefined ? (entry.change > 0 ? `+${entry.change}` : `${entry.change}`) : "—"}
                                        </td>
                                        <td style={{ padding: "var(--space-md)", color: "var(--text-muted)" }}>{entry.games}</td>
                                        <td style={{ padding: "var(--space-md)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                                                <div style={{ width: 40, height: 4, background: "var(--surface-sunken)", borderRadius: 2 }}>
                                                    <div style={{ width: `${winRate}%`, height: "100%", background: "var(--neon-green)", borderRadius: 2 }} />
                                                </div>
                                                <span style={{ fontSize: "0.8rem" }}>{winRate}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "var(--space-md)", color: entry.win_streak >= 3 ? "var(--electric-purple)" : "var(--text-muted)" }}>
                                            {entry.win_streak > 0 ? `🔥${entry.win_streak}` : "—"}
                                        </td>
                                        <td style={{ padding: "var(--space-md)", fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{entry.owner}</td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
