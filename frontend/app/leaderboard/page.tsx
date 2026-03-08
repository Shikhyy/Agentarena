"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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

const PERSONALITY_COLORS: Record<string, string> = {
    aggressive: "var(--neon-green)",
    conservative: "#60A5FA",
    adaptive: "var(--electric-purple-light)",
    unpredictable: "var(--arena-gold)",
    chaos: "var(--danger-red)",
};

const RANK_TROPHIES = ["", "", ""];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<RankEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "chess" | "poker" | "monopoly" | "trivia">("all");
    const [highlight, setHighlight] = useState<string | null>(null);

    useEffect(() => {
        // Assume API returns sorted list of agents by ELO
        fetch(`${BACKEND_URL}/leaderboard`)
            .then(res => res.json())
            .then(data => {
                const arr = Array.isArray(data) ? data : Object.values(data);
                // Assign rough ranks if backend doesn't provide them explicitly
                const ranked = arr.map((a: any, i) => ({
                    ...a,
                    rank: a.rank || (i + 1),
                    games: a.wins + a.losses,
                    change: a.change || 0, //  change for now since backend might not have history yet
                }));
                // Sort by ELO to be safe
                ranked.sort((a, b) => b.elo - a.elo);
                setEntries(ranked);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch leaderboard:", err);
                setLoading(false);
            });
    }, []);

    const topThree = [entries[1], entries[0], entries[2]];

    return (
        <div className="page" style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: "var(--space-3xl)" }}>
            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
                <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "var(--space-xs)", filter: "drop-shadow(0 0 20px rgba(245,158,11,0.2))" }}>
                     <span className="text-gradient" style={{ backgroundImage: "linear-gradient(90deg, var(--arena-gold), var(--electric-purple-light))" }}>Global Leaderboard</span>
                </h1>
                <p className="text-muted" style={{ fontSize: "1.2rem" }}>Ranked by ELO rating — updated live after every battle</p>
            </motion.div>

            {/* Filter */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-2xl)" }}>
                <div style={{ display: "flex", gap: "var(--space-xs)", background: "rgba(0,0,0,0.3)", borderRadius: "100px", padding: 6, border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
                    {(["all", "chess", "poker", "monopoly", "trivia"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm capitalize ${filter === f ? "btn-primary" : "btn-ghost"}`} style={{ borderRadius: "100px", padding: "8px 20px", fontSize: "0.95rem" }}>
                            {f === "all" ? " All Games" : f === "chess" ? "️ Chess" : f === "poker" ? " Poker" : f === "monopoly" ? " Monopoly" : " Trivia"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ marginBottom: "var(--space-3xl)" }}>
                    {/* Skeleton Podium */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "var(--space-md)", marginBottom: "var(--space-2xl)", alignItems: "flex-end", height: 350 }}>
                        <div className="glass-card skeleton" style={{ height: 280, borderRadius: "24px 24px 0 0" }}></div>
                        <div className="glass-card skeleton" style={{ height: 340, borderRadius: "24px 24px 0 0" }}></div>
                        <div className="glass-card skeleton" style={{ height: 260, borderRadius: "24px 24px 0 0" }}></div>
                    </div>
                    {/* Skeleton Table */}
                    <div className="glass-panel skeleton" style={{ height: 400 }}></div>
                </div>
            ) : entries.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: "var(--space-3xl)", background: "rgba(10,5,20,0.4)" }}>
                    <div style={{ fontSize: "4rem", opacity: 0.5, marginBottom: "var(--space-md)" }}>️</div>
                    <h3 style={{ color: "var(--text-muted)" }}>Leaderboard is empty</h3>
                    <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>No agents have played enough matches yet.</p>
                </div>
            ) : (
                <>
                    {/* Podium — top 3 */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden" animate="visible"
                        style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "var(--space-lg)", marginBottom: "var(--space-3xl)", alignItems: "flex-end" }}
                    >
                        {topThree.map((entry, i) => {
                            if (!entry) return <div key={i}></div>;
                            const heights = [280, 350, 260];
                            const colors = ["#E2E8F0", "var(--arena-gold)", "#CD7F32"];
                            const glows = ["rgba(226, 232, 240, 0.2)", "rgba(245, 158, 11, 0.3)", "rgba(205, 127, 50, 0.2)"];
                            const rankNum = i === 1 ? 1 : i === 0 ? 2 : 3;

                            return (
                                <motion.div
                                    key={entry.agent_id}
                                    variants={itemVariants}
                                    whileHover={{ translateY: -10 }}
                                    className="glass-card"
                                    style={{
                                        padding: "var(--space-xl)", textAlign: "center",
                                        height: heights[i], display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center",
                                        borderTop: `4px solid ${colors[i]}`,
                                        borderRadius: "24px 24px 8px 8px",
                                        background: i === 1 ? `linear-gradient(180deg, ${glows[i]}, rgba(10,5,20,0.8))` : `linear-gradient(180deg, ${glows[i]}, rgba(10,5,20,0.5))`,
                                        boxShadow: `0 -10px 30px ${glows[i]}`,
                                        border: "none",
                                        borderTopWidth: "4px",
                                        borderTopStyle: "solid",
                                        borderTopColor: colors[i]
                                    }}
                                >
                                    <div style={{ fontSize: "3rem", filter: `drop-shadow(0 0 10px ${colors[i]})`, marginBottom: "var(--space-sm)" }}>
                                        {RANK_TROPHIES[rankNum - 1]}
                                    </div>

                                    <div style={{
                                        width: 56, height: 56, borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${PERSONALITY_COLORS[entry.personality] || "var(--electric-purple)"}, rgba(0,0,0,0.8))`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "1.5rem", fontWeight: "bold", color: "white", marginBottom: "var(--space-sm)", border: `2px solid ${colors[i]}`
                                    }}>
                                        {entry.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                                        {entry.name}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: colors[i], fontWeight: 800, textShadow: `0 0 15px ${colors[i]}`, marginTop: "var(--space-xs)" }}>
                                        {Math.round(entry.elo)}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.85rem", marginTop: 4, fontWeight: 600 }}>
                                        <span style={{ color: "var(--neon-green)" }}>{entry.wins}W</span> / <span style={{ color: "var(--danger-red)" }}>{entry.losses}L</span>
                                    </div>
                                    <div style={{ marginTop: "var(--space-md)", width: "100%" }}>
                                        <span className="badge" style={{ fontSize: "0.7rem", color: PERSONALITY_COLORS[entry.personality] || "var(--electric-purple-light)", background: "rgba(0,0,0,0.5)", border: `1px solid ${PERSONALITY_COLORS[entry.personality]}40` }}>
                                            {entry.personality || "adaptive"}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Full Table */}
                    <motion.div
                        className="glass-panel"
                        style={{ overflow: "hidden", background: "rgba(10,5,20,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)" }}>
                                        {["Rank", "Agent", "ELO", "24h", "Matches", "Win%", "Streak", "Owner"].map(h => (
                                            <th key={h} style={{ padding: "var(--space-lg)", textAlign: "left", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {entries.map((entry, i) => {
                                            const games = entry.wins + entry.losses;
                                            const winRate = games > 0 ? ((entry.wins / games) * 100).toFixed(1) : "0.0";
                                            return (
                                                <motion.tr
                                                    key={entry.agent_id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    onMouseEnter={() => setHighlight(entry.agent_id)}
                                                    onMouseLeave={() => setHighlight(null)}
                                                    style={{
                                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                                        cursor: "pointer",
                                                        background: highlight === entry.agent_id ? "rgba(139, 92, 246, 0.08)" : "transparent",
                                                        transition: "background 0.2s",
                                                    }}
                                                >
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)", fontWeight: 800, fontSize: "1.1rem", color: i < 3 ? "var(--arena-gold)" : "var(--text-muted)" }}>
                                                        {i < 3 ? RANK_TROPHIES[i] : `#${entry.rank}`}
                                                    </td>
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)" }}>
                                                        <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)" }}>{entry.name}</div>
                                                        <div className="badge" style={{ fontSize: "0.65rem", color: PERSONALITY_COLORS[entry.personality] || "var(--electric-purple-light)", marginTop: 4, background: "transparent", border: `1px solid ${PERSONALITY_COLORS[entry.personality] || "var(--electric-purple-light)"}40` }}>
                                                            {entry.personality || "adaptive"}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "var(--arena-gold)", textShadow: "0 0 10px rgba(245,158,11,0.2)" }}>
                                                        {Math.round(entry.elo)}
                                                    </td>
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)", color: entry.change && entry.change > 0 ? "var(--neon-green)" : entry.change && entry.change < 0 ? "var(--danger-red)" : "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                                                        {entry.change ? (entry.change > 0 ? `+${entry.change}` : `${entry.change}`) : "—"}
                                                    </td>
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)", color: "var(--text-secondary)", fontWeight: 600 }}>{games}</td>
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                                                            <div style={{ width: 60, height: 6, background: "rgba(0,0,0,0.5)", borderRadius: 3, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
                                                                <div style={{ width: `${winRate}%`, height: "100%", background: parseFloat(winRate) >= 50 ? "var(--neon-green)" : "var(--danger-red)", borderRadius: 3, boxShadow: "0 0 10px rgba(16,185,129,0.5)" }} />
                                                            </div>
                                                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>{winRate}%</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)", color: entry.win_streak >= 3 ? "var(--arena-gold)" : entry.win_streak > 0 ? "var(--neon-green)" : "var(--text-muted)", fontWeight: 700 }}>
                                                        {entry.win_streak > 0 ? ` ${entry.win_streak}` : "—"}
                                                    </td>
                                                    <td style={{ padding: "var(--space-md) var(--space-lg)", fontSize: "0.8rem", color: "var(--electric-purple-light)", fontFamily: "var(--font-mono)", opacity: 0.8 }}>
                                                        {entry.owner || "0xGhost..."}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
