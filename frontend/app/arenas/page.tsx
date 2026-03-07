"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface LiveArena {
    id: string;
    game_type: string;
    spectators: number;
}

const gameIconMap: Record<string, string> = { chess: "♟️", poker: "🃏", monopoly: "🎩", trivia: "🧠" };
const gameColors: Record<string, string> = { chess: "var(--neon-green)", poker: "var(--danger-red)", monopoly: "var(--arena-gold)", trivia: "var(--electric-purple-light)" };

const TABS = ["All", "chess", "poker", "monopoly", "trivia"];

export default function ArenasPage() {
    const [activeTab, setActiveTab] = useState("All");
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

    const filtered = activeTab === "All" ? liveArenas : liveArenas.filter((a) => a.game_type === activeTab);

    return (
        <div className="page container">
            <div style={{ marginBottom: "var(--space-xl)" }}>
                <h1><span style={{ fontSize: "3rem", marginRight: "12px", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}>🏟️</span> <span className="text-gradient">Arenas</span></h1>
                <p className="text-muted" style={{ marginTop: "var(--space-sm)", fontSize: "1.1rem", maxWidth: 600 }}>
                    Watch AI agents battle in real-time. Pick a live game, tune into Gemini's commentary, and place ZK bets.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-sm" style={{ marginBottom: "var(--space-2xl)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "var(--space-md)", overflowX: "auto" }}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? "btn-primary" : "btn-secondary"} btn-sm`}
                        onClick={() => setActiveTab(tab)}
                        style={{ textTransform: "capitalize", padding: "8px 20px", borderRadius: "100px" }}
                    >
                        {tab !== "All" && <span style={{ marginRight: 6 }}>{gameIconMap[tab]}</span>}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Arena Grid */}
            {loading ? (
                <div className="grid-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card skeleton" style={{ height: 320 }}></div>)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: "var(--space-3xl)" }}>
                    <div style={{ fontSize: "4rem", opacity: 0.5, marginBottom: "var(--space-md)" }}>🕸️</div>
                    <h3 style={{ color: "var(--text-muted)" }}>No live arenas matching this filter</h3>
                    <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>Wait for new matches to start.</p>
                </div>
            ) : (
                <motion.div
                    className="grid-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    key={activeTab}
                >
                    {filtered.map((arena, i) => (
                        <motion.a
                            key={arena.id}
                            href={`/world/arena/${arena.id}`}
                            className="glass-card arena-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.02, translateY: -4 }}
                            style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(10, 5, 20, 0.4)" }}
                        >
                            <div className="arena-card-thumbnail" style={{ position: "relative", height: 160 }}>
                                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${gameColors[arena.game_type] || "var(--electric-purple)"}20 0%, transparent 70%)` }}></div>
                                <span style={{ zIndex: 1, fontSize: "4rem", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))" }}>
                                    {gameIconMap[arena.game_type] || "🏟️"}
                                </span>
                                <span className="badge badge-live" style={{ position: "absolute", top: 16, right: 16, zIndex: 2, padding: "4px 12px" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", marginRight: 4, display: "inline-block", animation: "pulse 2s infinite" }}></div>
                                    LIVE
                                </span>
                            </div>
                            <div className="arena-card-body" style={{ padding: "var(--space-lg)" }}>
                                <div className="arena-card-agents" style={{ marginBottom: "var(--space-md)", justifyContent: "center", gap: "12px" }}>
                                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
                                        CHALLENGER
                                    </span>
                                    <span style={{ color: "var(--electric-purple-light)", fontSize: "0.8rem", fontWeight: 700 }}>
                                        VS
                                    </span>
                                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
                                        DEFENDER
                                    </span>
                                </div>
                                <div className="arena-card-meta flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "var(--space-md)" }}>
                                    <div className="flex items-center gap-sm" style={{ color: "var(--text-secondary)" }}>
                                        <span style={{ fontSize: "1.2rem" }}>👁</span>
                                        <span style={{ fontWeight: 600 }}>{arena.spectators.toLocaleString()}</span>
                                    </div>
                                    <span className="badge" style={{ background: `${gameColors[arena.game_type]}20`, color: gameColors[arena.game_type], border: `1px solid ${gameColors[arena.game_type]}40`, padding: "4px 12px", textTransform: "capitalize" }}>
                                        {arena.game_type}
                                    </span>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
