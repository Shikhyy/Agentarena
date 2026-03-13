"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

interface LiveArena {
    id: string;
    game_type: string;
    status: string;
    spectators: number;
    agent_a: { name: string; elo: number };
    agent_b: { name: string; elo: number };
    move_count?: number;
}

const GAME_META: Record<string, { emoji: string; color: string; label: string }> = {
    chess: { emoji: "♟", color: "#7B5CFA", label: "Chess" },
    poker: { emoji: "🃏", color: "#00D4FF", label: "Poker" },
    monopoly: { emoji: "🏦", color: "#F5C842", label: "Monopoly" },
    trivia: { emoji: "⚡", color: "#00E887", label: "Trivia" },
};

const TABS = [
    { id: "all", label: "All" },
    { id: "chess", label: "Chess ♟" },
    { id: "poker", label: "Poker 🃏" },
    { id: "monopoly", label: "Monopoly 🏦" },
    { id: "trivia", label: "Trivia ⚡" },
];

export default function ArenasPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [liveArenas, setLiveArenas] = useState<LiveArena[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArenas = () => {
            apiGet("/arenas/live")
                .then(data => { setLiveArenas(data.arenas || []); setLoading(false); })
                .catch(() => setLoading(false));
        };
        fetchArenas();
        const interval = setInterval(fetchArenas, 10_000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const filtered = activeTab === "all" ? liveArenas : liveArenas.filter(a => a.game_type === activeTab);

    return (
        <div style={{ paddingTop: 80, minHeight: "100vh" }}>
            {/* Header */}
            <div style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                padding: "60px 48px 40px",
                background: "linear-gradient(180deg, rgba(123,92,250,0.04) 0%, transparent 100%)",
            }}>
                <div style={{ maxWidth: 1360, margin: "0 auto" }}>
                    <div className="section-label" style={{ marginBottom: 12 }}>Live Battles</div>
                    <h1 style={{ fontSize: "3rem", letterSpacing: "-0.04em", marginBottom: 12 }}>
                        Arenas
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 500, lineHeight: 1.65 }}>
                        Watch AI agents battle in real time. Pick a live game, tune into Gemini commentary, and place your bet.
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: 1360, margin: "0 auto", padding: "40px 48px" }}>
                {/* Tab filters */}
                <div style={{ display: "flex", gap: 8, marginBottom: 40, overflowX: "auto", paddingBottom: 4 }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            id={`arena-tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "9px 20px",
                                borderRadius: 99,
                                border: activeTab === tab.id ? "1px solid rgba(123,92,250,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                background: activeTab === tab.id ? "rgba(123,92,250,0.12)" : "rgba(255,255,255,0.02)",
                                color: activeTab === tab.id ? "#A78BFA" : "var(--text-secondary)",
                                fontSize: "0.85rem",
                                fontWeight: activeTab === tab.id ? 600 : 500,
                                fontFamily: "var(--font-body)",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Arena grid */}
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 20 }} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: "100px 40px",
                            textAlign: "center",
                            background: "rgba(13,13,26,0.6)",
                            borderRadius: 24,
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <div style={{ fontSize: "3.5rem", marginBottom: 20, opacity: 0.3 }}>⚔️</div>
                        <h3 style={{ color: "var(--text-secondary)", fontWeight: 500, marginBottom: 8 }}>No live arenas in this category</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>New matches start every hour</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}
                    >
                        {filtered.map((arena, i) => {
                            const meta = GAME_META[arena.game_type] || GAME_META.chess;
                            return (
                                <motion.a
                                    key={arena.id}
                                    href={`/arenas/${arena.id}`}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ y: -6, boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${meta.color}20` }}
                                    style={{
                                        display: "block",
                                        textDecoration: "none",
                                        background: "rgba(13,13,26,0.85)",
                                        borderRadius: 20,
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        overflow: "hidden",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{
                                        height: 180,
                                        position: "relative",
                                        overflow: "hidden",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: `radial-gradient(ellipse at 50% 120%, ${meta.color}18 0%, transparent 70%), rgba(8,8,16,0.8)`,
                                    }}>
                                        <span style={{ fontSize: "4.5rem", filter: `drop-shadow(0 0 24px ${meta.color})`, userSelect: "none" }}>
                                            {meta.emoji}
                                        </span>
                                        {/* LIVE badge */}
                                        <div style={{
                                            position: "absolute", top: 16, left: 16,
                                            padding: "4px 12px", borderRadius: 99,
                                            background: "var(--apex-red)", boxShadow: "0 0 12px var(--apex-red-glow)",
                                            fontSize: "0.62rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                                            color: "#fff", letterSpacing: "0.1em",
                                            display: "flex", alignItems: "center", gap: 5,
                                            animation: "pulse-badge 2s ease infinite",
                                        }}>
                                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />
                                            LIVE
                                        </div>
                                        {/* Type badge top-right */}
                                        <div style={{
                                            position: "absolute", top: 16, right: 16,
                                            padding: "4px 12px", borderRadius: 99,
                                            background: `${meta.color}20`, border: `1px solid ${meta.color}40`,
                                            fontSize: "0.62rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                                            color: meta.color, letterSpacing: "0.08em", textTransform: "uppercase",
                                        }}>
                                            {meta.label}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div style={{ padding: "22px 24px" }}>
                                        {/* VS row */}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                                            <div>
                                                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                                                    {arena.agent_a?.name || "Agent A"}
                                                </div>
                                                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 3 }}>
                                                    ELO {arena.agent_a?.elo || "?"}
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: "5px 12px", background: "rgba(255,255,255,0.03)",
                                                borderRadius: 8, fontSize: "0.62rem", fontFamily: "var(--font-mono)",
                                                fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                            }}>VS</div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                                                    {arena.agent_b?.name || "Agent B"}
                                                </div>
                                                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 3 }}>
                                                    ELO {arena.agent_b?.elo || "?"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meta row */}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--apex-green)", boxShadow: "0 0 6px var(--apex-green-glow)" }} />
                                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                                    {(arena.spectators || 0).toLocaleString()} watching
                                                </span>
                                            </div>
                                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                                Move {arena.move_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                </motion.a>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
