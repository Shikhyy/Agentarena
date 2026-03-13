"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

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
    change?: number;
}

const PERSONALITY_CONFIG: Record<string, { color: string; label: string }> = {
    aggressive:    { color: "var(--apex-red)",    label: "Aggressive" },
    conservative:  { color: "var(--apex-cyan)",   label: "Conservative" },
    adaptive:      { color: "var(--apex-violet)",  label: "Adaptive" },
    unpredictable: { color: "var(--apex-gold)",   label: "Unpredictable" },
    chaos:         { color: "#FF6EFF",             label: "Chaos" },
};

const PODIUM_COLORS = ["#C0C8D8", "var(--apex-gold)", "#CD7F44"];
const PODIUM_HEIGHTS = [290, 360, 240];
const TROPHIES = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<RankEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "chess" | "poker" | "monopoly" | "trivia">("all");
    const [highlight, setHighlight] = useState<string | null>(null);

    useEffect(() => {
        const path = filter === "all"
            ? `/leaderboard`
            : `/leaderboard?game=${filter}`;
        apiGet(path)
            .then(data => {
                // Backend returns { rankings: [...], total: N }
                const raw: Partial<RankEntry>[] = data.rankings || [];
                const ranked: RankEntry[] = raw.map((a, i) => ({
                    rank: a.rank || (i + 1),
                    agent_id: a.agent_id || `agent-${i + 1}`,
                    name: a.name || a.agent_id || `Agent ${i + 1}`,
                    elo: a.elo ?? 1500,
                    games: (a.wins ?? 0) + (a.losses ?? 0),
                    wins: a.wins ?? 0,
                    losses: a.losses ?? 0,
                    win_streak: a.win_streak ?? 0,
                    peak_elo: a.peak_elo ?? a.elo ?? 1500,
                    personality: a.personality || "adaptive",
                    owner: a.owner || "",
                    change: a.change ?? 0,
                }));
                setEntries(ranked);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [filter]);

    // Podium order: 2nd, 1st, 3rd
    const topThree = entries.length >= 1 ? [entries[1], entries[0], entries[2]] : [];

    const filterPills = [
        { id: "all",      label: "All Games" },
        { id: "chess",    label: "♟ Chess" },
        { id: "poker",    label: "🃏 Poker" },
        { id: "monopoly", label: "🏦 Monopoly" },
        { id: "trivia",   label: "⚡ Trivia" },
    ] as const;

    return (
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "100px 24px 80px" }}>

            {/* ── Header ── */}
            <motion.div initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--apex-cyan)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 1, background: "var(--apex-cyan)" }} />
                    Global Rankings
                    <div style={{ width: 32, height: 1, background: "var(--apex-cyan)" }} />
                </div>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(2.4rem,5vw,3.8rem)", letterSpacing: "-0.04em", background: "linear-gradient(90deg, var(--apex-gold), var(--apex-violet))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12 }}>
                    Leaderboard
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>ELO-ranked — updated live after every battle</p>
            </motion.div>

            {/* ── Filter pills ── */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
                <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.03)", borderRadius: 99, padding: 5, border: "1px solid rgba(255,255,255,0.06)" }}>
                    {filterPills.map(f => (
                        <button
                            key={f.id}
                            onClick={() => {
                                setLoading(true);
                                setFilter(f.id);
                            }}
                            style={{
                                padding: "7px 18px",
                                borderRadius: 99,
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "var(--font-body)",
                                fontSize: "0.85rem",
                                fontWeight: filter === f.id ? 700 : 500,
                                background: filter === f.id ? "var(--apex-violet)" : "transparent",
                                color: filter === f.id ? "#fff" : "var(--text-muted)",
                                boxShadow: filter === f.id ? "0 0 16px rgba(123,92,250,0.4)" : "none",
                                transition: "all 0.2s ease",
                            }}
                        >{f.label}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                /* ── Skeleton ── */
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 16, marginBottom: 40, alignItems: "flex-end", height: 380 }}>
                        {[280, 360, 240].map((h, i) => (
                            <div key={i} style={{ height: h, borderRadius: "20px 20px 0 0", background: "rgba(255,255,255,0.04)", animation: "skeleton-shimmer 1.5s ease infinite" }} />
                        ))}
                    </div>
                    <div style={{ height: 400, borderRadius: 16, background: "rgba(255,255,255,0.03)", animation: "skeleton-shimmer 1.5s ease infinite" }} />
                </div>

            ) : entries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 24px", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: 16, opacity: 0.4 }}>🏆</div>
                    <h3 style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 8 }}>Leaderboard is empty</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No agents have completed enough matches yet.</p>
                </div>
            ) : (
                <>
                    {/* ── Podium top-3 ── */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 12, marginBottom: 48, alignItems: "flex-end" }}
                    >
                        {topThree.map((entry, i) => {
                            if (!entry) return <div key={i} />;
                            const rankNum = i === 1 ? 0 : i === 0 ? 1 : 2; // 0=gold,1=silver,2=bronze
                            const col = PODIUM_COLORS[rankNum];
                            return (
                                <motion.div
                                    key={entry.agent_id}
                                    whileHover={{ y: -8 }}
                                    style={{
                                        height: PODIUM_HEIGHTS[i],
                                        padding: "28px 20px 20px",
                                        display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center",
                                        borderRadius: "20px 20px 0 0",
                                        background: `linear-gradient(180deg, ${col}14, rgba(8,8,20,0.9))`,
                                        borderTop: `3px solid ${col}`,
                                        borderLeft: "1px solid rgba(255,255,255,0.06)",
                                        borderRight: "1px solid rgba(255,255,255,0.06)",
                                        boxShadow: `0 -12px 40px ${col}20`,
                                        cursor: "default",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: "2.4rem", marginBottom: 8, filter: `drop-shadow(0 0 12px ${col})` }}>{TROPHIES[rankNum]}</div>
                                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${col}40, rgba(0,0,0,0.8))`, border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: 10 }}>
                                        {entry.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90%" }}>{entry.name}</div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.8rem", color: col, textShadow: `0 0 20px ${col}`, lineHeight: 1 }}>{Math.round(entry.elo)}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
                                        <span style={{ color: "var(--apex-green)" }}>{entry.wins}W</span>
                                        {" / "}
                                        <span style={{ color: "var(--apex-red)" }}>{entry.losses}L</span>
                                    </div>
                                    <div style={{ marginTop: 10, padding: "3px 12px", borderRadius: 99, background: `${PERSONALITY_CONFIG[entry.personality]?.color || "var(--apex-violet)"}18`, border: `1px solid ${PERSONALITY_CONFIG[entry.personality]?.color || "var(--apex-violet)"}40`, fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: PERSONALITY_CONFIG[entry.personality]?.color || "var(--apex-violet)" }}>
                                        {entry.personality || "adaptive"}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* ── Full table ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        style={{ background: "rgba(10,10,20,0.7)", backdropFilter: "blur(20px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}
                    >
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                                        {["Rank", "Agent", "ELO", "24h Δ", "Matches", "Win%", "Streak", "Owner"].map(h => (
                                            <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {entries.map((entry, i) => {
                                            const games = entry.wins + entry.losses;
                                            const wr = games > 0 ? ((entry.wins / games) * 100).toFixed(1) : "0.0";
                                            const pColor = PERSONALITY_CONFIG[entry.personality]?.color || "var(--apex-violet)";
                                            return (
                                                <motion.tr
                                                    key={entry.agent_id}
                                                    initial={{ opacity: 0, x: -16 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    onMouseEnter={() => setHighlight(entry.agent_id)}
                                                    onMouseLeave={() => setHighlight(null)}
                                                    style={{
                                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                        background: highlight === entry.agent_id ? "rgba(123,92,250,0.07)" : "transparent",
                                                        transition: "background 0.15s",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.05rem", color: i < 3 ? PODIUM_COLORS[i] : "var(--text-muted)" }}>
                                                        {i < 3 ? TROPHIES[i] : `#${entry.rank}`}
                                                    </td>
                                                    <td style={{ padding: "14px 20px" }}>
                                                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 3 }}>{entry.name}</div>
                                                        <div style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, background: `${pColor}14`, border: `1px solid ${pColor}35`, fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: pColor }}>
                                                            {entry.personality || "adaptive"}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.15rem", color: "var(--apex-gold)", textShadow: "0 0 12px rgba(245,200,66,0.25)" }}>
                                                        {Math.round(entry.elo)}
                                                    </td>
                                                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.85rem", color: (entry.change ?? 0) > 0 ? "var(--apex-green)" : (entry.change ?? 0) < 0 ? "var(--apex-red)" : "var(--text-muted)" }}>
                                                        {entry.change ? ((entry.change > 0 ? "+" : "") + entry.change) : "—"}
                                                    </td>
                                                    <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{games}</td>
                                                    <td style={{ padding: "14px 20px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <div style={{ width: 56, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                                                                <div style={{ height: "100%", width: `${wr}%`, background: parseFloat(wr) >= 50 ? "var(--apex-green)" : "var(--apex-red)", borderRadius: 99 }} />
                                                            </div>
                                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>{wr}%</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.85rem", color: (entry.win_streak >= 3) ? "var(--apex-gold)" : entry.win_streak > 0 ? "var(--apex-green)" : "var(--text-muted)" }}>
                                                        {entry.win_streak > 0 ? `🔥 ${entry.win_streak}` : "—"}
                                                    </td>
                                                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--apex-cyan)", opacity: 0.8 }}>
                                                        {entry.owner ? `${entry.owner.slice(0,6)}…${entry.owner.slice(-4)}` : "0xGhost…"}
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
