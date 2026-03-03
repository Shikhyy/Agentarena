"use client";

import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const ChessBoard3D = dynamic(() => import("@/components/arena/ChessBoard3D"), {
    ssr: false,
    loading: () => (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--deep-space)" }}>
            <div className="skeleton" style={{ width: 200, height: 200, borderRadius: "var(--radius-lg)" }} />
        </div>
    ),
});

const COMMENTARY_LOG = [
    { time: "12:04", text: "Agent ZEUS opens with the King's Indian Defense — a bold, aggressive choice!", type: "move" },
    { time: "12:04", text: "ATHENA responds with the Bayonet Attack. She's not backing down.", type: "move" },
    { time: "12:05", text: "ZEUS pushes the f-pawn! This is the beginning of a kingside storm!", type: "drama" },
    { time: "12:05", text: "Wait — ATHENA sacrifices the knight on d5! This is MASSIVE!", type: "critical" },
    { time: "12:06", text: "ZEUS is thinking... the clock is ticking... what will it be?", type: "tension" },
];

const AGENT_A = {
    name: "ZEUS",
    personality: "Aggressive",
    level: 24,
    elo: 2187,
    wins: 142,
    losses: 38,
    winRate: "79%",
};

const AGENT_B = {
    name: "ATHENA",
    personality: "Adaptive",
    level: 22,
    elo: 2143,
    wins: 128,
    losses: 44,
    winRate: "74%",
};

export default function ArenaViewPage() {
    const [commentaryIndex, setCommentaryIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCommentaryIndex((prev) => Math.min(prev + 1, COMMENTARY_LOG.length - 1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: "flex", height: "calc(100vh - 65px)" }}>
            {/* Main Arena Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* 3D Game Board */}
                <div
                    style={{
                        flex: 1,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Three.js Canvas */}
                    <div style={{ position: "absolute", inset: 0 }}>
                        <Suspense fallback={<div style={{ width: "100%", height: "100%", background: "var(--deep-space)" }} />}>
                            <ChessBoard3D agentWhite={AGENT_A.name} agentBlack={AGENT_B.name} activeColor="white" />
                        </Suspense>
                    </div>

                    {/* Agent Overlay Cards */}
                    <div style={{
                        position: "absolute",
                        bottom: "var(--space-lg)",
                        left: "var(--space-lg)",
                        right: "var(--space-lg)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        pointerEvents: "none",
                        zIndex: 2,
                    }}>
                        {/* Agent A */}
                        <motion.div
                            className="glass-card"
                            style={{ padding: "var(--space-md)", minWidth: 180, textAlign: "center", pointerEvents: "auto" }}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h4 style={{ color: "var(--electric-purple-light)" }}>{AGENT_A.name}</h4>
                            <span className="badge badge-purple" style={{ margin: "var(--space-xs) 0" }}>{AGENT_A.personality}</span>
                            <div className="flex justify-between" style={{ fontSize: "0.8125rem", marginTop: "var(--space-sm)" }}>
                                <span>ELO <strong>{AGENT_A.elo}</strong></span>
                                <span style={{ color: "var(--neon-green)" }}>{AGENT_A.wins}W</span>
                                <span style={{ color: "var(--danger-red)" }}>{AGENT_A.losses}L</span>
                            </div>
                        </motion.div>

                        {/* VS Badge */}
                        <motion.div
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                color: "var(--arena-gold)",
                                textShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
                                pointerEvents: "auto",
                                padding: "var(--space-sm) var(--space-md)",
                            }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            ⚔️ VS
                        </motion.div>

                        {/* Agent B */}
                        <motion.div
                            className="glass-card"
                            style={{ padding: "var(--space-md)", minWidth: 180, textAlign: "center", pointerEvents: "auto" }}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h4 style={{ color: "var(--neon-green)" }}>{AGENT_B.name}</h4>
                            <span className="badge badge-win" style={{ margin: "var(--space-xs) 0" }}>{AGENT_B.personality}</span>
                            <div className="flex justify-between" style={{ fontSize: "0.8125rem", marginTop: "var(--space-sm)" }}>
                                <span>ELO <strong>{AGENT_B.elo}</strong></span>
                                <span style={{ color: "var(--neon-green)" }}>{AGENT_B.wins}W</span>
                                <span style={{ color: "var(--danger-red)" }}>{AGENT_B.losses}L</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Commentary Ribbon */}
                <div
                    style={{
                        background: "var(--surface-overlay)",
                        borderTop: "1px solid var(--border-subtle)",
                        padding: "var(--space-md) var(--space-xl)",
                        minHeight: 80,
                    }}
                >
                    <div className="flex items-center gap-md">
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: "var(--radius-full)",
                                background: "linear-gradient(135deg, var(--electric-purple), var(--arena-gold))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.25rem",
                                flexShrink: 0,
                            }}
                        >
                            🎙️
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                                Gemini Live Commentary
                            </div>
                            <motion.div
                                key={commentaryIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.9375rem",
                                    color: COMMENTARY_LOG[commentaryIndex]?.type === "critical"
                                        ? "var(--arena-gold)"
                                        : COMMENTARY_LOG[commentaryIndex]?.type === "drama"
                                            ? "var(--electric-purple-light)"
                                            : "var(--text-primary)",
                                }}
                            >
                                {COMMENTARY_LOG[commentaryIndex]?.text}
                            </motion.div>
                        </div>
                        {/* Waveform visual */}
                        <div className="flex items-center gap-xs" style={{ gap: 2 }}>
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    style={{
                                        width: 3,
                                        borderRadius: 2,
                                        background: "var(--electric-purple)",
                                    }}
                                    animate={{ height: [8, 20 + Math.random() * 16, 8] }}
                                    transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar — Live Odds */}
            <aside
                style={{
                    width: 300,
                    background: "var(--surface-overlay)",
                    borderLeft: "1px solid var(--border-subtle)",
                    padding: "var(--space-lg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-lg)",
                    overflowY: "auto",
                }}
            >
                <h3>📊 Live Odds</h3>

                {/* Odds Bar */}
                <div>
                    <div className="flex justify-between" style={{ marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
                        <span style={{ color: "var(--electric-purple-light)" }}>{AGENT_A.name} 52%</span>
                        <span style={{ color: "var(--neon-green)" }}>{AGENT_B.name} 48%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--midnight-navy)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <motion.div
                            style={{ height: "100%", borderRadius: "var(--radius-full)", background: "linear-gradient(90deg, var(--electric-purple), var(--neon-green))" }}
                            initial={{ width: "50%" }}
                            animate={{ width: "52%" }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>

                {/* Bet Stats */}
                <div className="glass-card" style={{ padding: "var(--space-md)" }}>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "var(--space-sm)" }}>Betting Pool</div>
                    <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--arena-gold)" }}>24,580 $ARENA</div>
                    <div className="flex justify-between" style={{ marginTop: "var(--space-md)", fontSize: "0.8125rem" }}>
                        <span className="text-muted">Active Bettors</span>
                        <span>347</span>
                    </div>
                </div>

                {/* Quick Bet */}
                <div>
                    <h4 style={{ marginBottom: "var(--space-md)" }}>🎰 Quick Bet</h4>
                    <div className="flex gap-sm" style={{ marginBottom: "var(--space-md)", flexWrap: "wrap" }}>
                        {[1, 5, 10, 50].map((amount) => (
                            <button key={amount} className="btn btn-secondary btn-sm">
                                {amount} $ARENA
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-gold w-full">Place Bet → {AGENT_A.name}</button>
                    <div style={{ textAlign: "center", margin: "var(--space-sm) 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>or</div>
                    <button className="btn btn-secondary w-full">Place Bet → {AGENT_B.name}</button>
                </div>

                {/* Match Info */}
                <div>
                    <h4 style={{ marginBottom: "var(--space-md)" }}>📋 Match Info</h4>
                    <div className="flex-col gap-sm" style={{ display: "flex", fontSize: "0.8125rem" }}>
                        <div className="flex justify-between"><span className="text-muted">Game</span><span>Chess</span></div>
                        <div className="flex justify-between"><span className="text-muted">Move</span><span>#14</span></div>
                        <div className="flex justify-between"><span className="text-muted">Duration</span><span>6m 42s</span></div>
                        <div className="flex justify-between"><span className="text-muted">Spectators</span><span>1,247</span></div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
