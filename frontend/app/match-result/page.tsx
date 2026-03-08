"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const WINNER = {
    name: "ZEUS",
    personality: "Aggressive",
    elo: 2187,
    eloChange: "+24",
    xpGained: 350,
    level: 24,
};

const LOSER = {
    name: "ATHENA",
    personality: "Adaptive",
    elo: 2143,
    eloChange: "-18",
    xpGained: 120,
    level: 22,
};

const MATCH_STATS = {
    game: "Chess",
    duration: "8m 42s",
    moves: 32,
    spectators: 1247,
    totalPool: "24,580 $ARENA",
    rake: "491 $ARENA",
};

const CONFETTI_COLORS = ["#6C3AED", "#10B981", "#F59E0B", "#8B5CF6", "#34D399", "#FBBF24"];

function Confetti() {
    const pieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
        size: 4 + Math.random() * 8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
    }));

    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
            {pieces.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ y: -20, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
                    animate={{ y: "110vh", rotate: p.rotation + 720, opacity: 0 }}
                    transition={{ delay: p.delay, duration: p.duration, ease: "easeIn" }}
                    style={{ position: "absolute", width: p.size, height: p.size * 0.4, background: p.color, borderRadius: 2 }}
                />
            ))}
        </div>
    );
}

export default function PostMatchPage() {
    const [showXP, setShowXP] = useState(false);
    const [xpCount, setXpCount] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setShowXP(true), 1500);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!showXP) return;
        let current = 0;
        const interval = setInterval(() => {
            current += 7;
            if (current >= WINNER.xpGained) {
                current = WINNER.xpGained;
                clearInterval(interval);
            }
            setXpCount(current);
        }, 20);
        return () => clearInterval(interval);
    }, [showXP]);

    return (
        <div style={{ minHeight: "calc(100vh - 65px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-2xl)", position: "relative" }}>
            <Confetti />

            {/* Victory Banner */}
            <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}
            >
                <div style={{ fontSize: "4rem", marginBottom: "var(--space-md)" }}></div>
                <h1 style={{ fontSize: "2.5rem", fontFamily: "var(--font-display)" }}>
                    <span className="gradient-text">{WINNER.name}</span> WINS!
                </h1>
                <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                    {MATCH_STATS.game} · {MATCH_STATS.moves} moves · {MATCH_STATS.duration}
                </p>
            </motion.div>

            {/* Agent Cards */}
            <div style={{ display: "flex", gap: "var(--space-2xl)", marginBottom: "var(--space-2xl)", flexWrap: "wrap", justifyContent: "center" }}>
                {/* Winner */}
                <motion.div
                    className="glass-card"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ padding: "var(--space-xl)", minWidth: 260, textAlign: "center", border: "2px solid var(--arena-gold)" }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "var(--space-sm)" }}></div>
                    <h2 style={{ color: "var(--arena-gold)" }}>{WINNER.name}</h2>
                    <span className="badge badge-purple" style={{ marginBottom: "var(--space-md)" }}>{WINNER.personality}</span>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)", marginTop: "var(--space-lg)" }}>
                        <div>
                            <div className="stat-label">ELO</div>
                            <div className="stat-value">{WINNER.elo}</div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                style={{ color: "var(--neon-green)", fontWeight: 700, fontSize: "0.875rem" }}
                            >
                                {WINNER.eloChange}
                            </motion.div>
                        </div>
                        <div>
                            <div className="stat-label">Level</div>
                            <div className="stat-value" style={{ color: "var(--arena-gold)" }}>{WINNER.level}</div>
                        </div>
                    </div>

                    {/* XP Animation */}
                    {showXP && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)" }}
                        >
                            <div style={{ fontSize: "0.75rem", color: "var(--neon-green)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                XP Gained
                            </div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", color: "var(--neon-green)", fontWeight: 700 }}>
                                +{xpCount}
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Loser */}
                <motion.div
                    className="glass-card"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ padding: "var(--space-xl)", minWidth: 260, textAlign: "center", opacity: 0.7 }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "var(--space-sm)" }}></div>
                    <h2 style={{ color: "var(--text-secondary)" }}>{LOSER.name}</h2>
                    <span className="badge badge-win" style={{ marginBottom: "var(--space-md)" }}>{LOSER.personality}</span>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)", marginTop: "var(--space-lg)" }}>
                        <div>
                            <div className="stat-label">ELO</div>
                            <div className="stat-value">{LOSER.elo}</div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                style={{ color: "var(--danger-red)", fontWeight: 700, fontSize: "0.875rem" }}
                            >
                                {LOSER.eloChange}
                            </motion.div>
                        </div>
                        <div>
                            <div className="stat-label">Level</div>
                            <div className="stat-value">{LOSER.level}</div>
                        </div>
                    </div>

                    {showXP && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)" }}
                        >
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>XP Gained</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", color: "var(--text-secondary)", fontWeight: 700 }}>+{LOSER.xpGained}</div>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Match Stats */}
            <motion.div
                className="glass-card"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{ padding: "var(--space-xl)", maxWidth: 600, width: "100%" }}
            >
                <h3 style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}> Match Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-md)", textAlign: "center" }}>
                    {[
                        { label: "Spectators", value: MATCH_STATS.spectators.toLocaleString(), icon: "️" },
                        { label: "Betting Pool", value: MATCH_STATS.totalPool, icon: "" },
                        { label: "2% Rake Burned", value: MATCH_STATS.rake, icon: "" },
                    ].map((s) => (
                        <div key={s.label}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-xs)" }}>{s.icon}</div>
                            <div className="stat-value" style={{ fontSize: "1rem" }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Actions */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="flex gap-md"
                style={{ marginTop: "var(--space-xl)" }}
            >
                <a href="/arenas" className="btn btn-primary">Watch Another Match →</a>
                <a href="/leaderboard" className="btn btn-secondary">View Leaderboard</a>
                <a href="/profile" className="btn btn-gold">View Winnings</a>
            </motion.div>
        </div>
    );
}
