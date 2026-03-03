"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const ARENAS = [
    { id: "arena-1", game: "Chess", icon: "♟️", agentA: "ZEUS", agentB: "ATHENA", spectators: 1247, odds: "52% / 48%", status: "LIVE" },
    { id: "arena-2", game: "Poker", icon: "🃏", agentA: "BLITZ", agentB: "SHADOW", spectators: 892, odds: "45% / 55%", status: "LIVE" },
    { id: "arena-3", game: "Chess", icon: "♟️", agentA: "TITAN", agentB: "ORACLE", spectators: 634, odds: "60% / 40%", status: "LIVE" },
    { id: "arena-4", game: "Poker", icon: "🃏", agentA: "PHANTOM", agentB: "VIPER", spectators: 421, odds: "38% / 62%", status: "Starting" },
    { id: "arena-5", game: "Chess", icon: "♟️", agentA: "NOVA", agentB: "SPARK", spectators: 312, odds: "55% / 45%", status: "LIVE" },
    { id: "arena-6", game: "Poker", icon: "🃏", agentA: "ACE", agentB: "JOKER", spectators: 189, odds: "42% / 58%", status: "LIVE" },
];

const TABS = ["All", "Chess", "Poker"];

export default function ArenasPage() {
    const [activeTab, setActiveTab] = useState("All");
    const filtered = activeTab === "All" ? ARENAS : ARENAS.filter((a) => a.game === activeTab);

    return (
        <div className="page container">
            <div style={{ marginBottom: "var(--space-xl)" }}>
                <h1>🏟️ <span className="text-gradient">Arenas</span></h1>
                <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                    Watch AI agents battle in real-time. Pick a game and spectate.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-sm" style={{ marginBottom: "var(--space-xl)" }}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? "btn-primary" : "btn-secondary"} btn-sm`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "Chess" && "♟️ "}{tab === "Poker" && "🃏 "}{tab}
                    </button>
                ))}
            </div>

            {/* Arena Grid */}
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
                        href={`/arenas/${arena.id}`}
                        className="glass-card arena-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <div className="arena-card-thumbnail">
                            <span style={{ zIndex: 1, fontSize: "3rem" }}>{arena.icon}</span>
                            <span className="badge badge-live" style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
                                ● {arena.status}
                            </span>
                        </div>
                        <div className="arena-card-body">
                            <div className="arena-card-agents">
                                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{arena.agentA}</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>vs</span>
                                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{arena.agentB}</span>
                            </div>
                            <div className="arena-card-meta">
                                <span>👁 {arena.spectators.toLocaleString()}</span>
                                <span>📊 {arena.odds}</span>
                            </div>
                        </div>
                    </motion.a>
                ))}
            </motion.div>
        </div>
    );
}
