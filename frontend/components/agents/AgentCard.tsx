"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface AgentCardProps {
    agentId: string;
    name: string;
    level: number;
    elo: number;
    wins: number;
    losses: number;
    winStreak: number;
    xp: number;
    xpToNext: number;
    skills?: string[];
    personality?: string;
    accentColor?: string;
    onClick?: () => void;
}

const PERSONALITY_EMOJI: Record<string, string> = {
    aggressive: "🔥",
    conservative: "🛡️",
    unpredictable: "🎲",
    adaptive: "🧠",
    chaos: "💀",
};

export function AgentCard({
    agentId, name, level, elo, wins, losses, winStreak,
    xp, xpToNext, skills = [], personality = "adaptive",
    accentColor = "var(--neon-green)", onClick,
}: AgentCardProps) {
    const [hovered, setHovered] = useState(false);
    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";

    return (
        <motion.div
            className="glass-panel"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={onClick}
            style={{
                padding: "var(--space-lg)",
                cursor: onClick ? "pointer" : "default",
                borderLeft: `3px solid ${accentColor}`,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Glow on hover */}
            {hovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: "absolute", inset: 0,
                        background: `radial-gradient(circle at 50% 0, ${accentColor}20, transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                    {/* Avatar placeholder */}
                    <div style={{
                        width: 48, height: 48, borderRadius: "var(--radius-md)",
                        background: `linear-gradient(135deg, ${accentColor}, var(--electric-purple))`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem", fontWeight: "bold", color: "white",
                    }}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {PERSONALITY_EMOJI[personality] || "🤖"} {personality}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div className="badge" style={{ background: `${accentColor}33`, color: accentColor, marginBottom: 4, display: "block" }}>
                        Lvl {level}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700, color: "var(--arena-gold)" }}>
                        {Math.round(elo)} ELO
                    </div>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div style={{ marginBottom: "var(--space-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4 }}>
                    <span>XP Progress</span>
                    <span>{xp} / {xp + xpToNext}</span>
                </div>
                <div style={{ height: 4, background: "var(--surface-sunken)", borderRadius: 2, overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpToNext > 0 ? (xp / (xp + xpToNext)) * 100 : 100}%` }}
                        transition={{ delay: 0.2 }}
                        style={{ height: "100%", background: accentColor, borderRadius: 2 }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
                {[
                    { label: "Wins", value: wins.toString(), color: "var(--neon-green)" },
                    { label: "Win %", value: `${winRate}%`, color: "var(--arena-gold)" },
                    { label: "Streak", value: `🔥${winStreak}`, color: winStreak >= 3 ? "var(--electric-purple)" : "var(--text-muted)" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: "center", background: "var(--surface-sunken)", padding: "var(--space-xs)", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {skills.map(skill => (
                        <span key={skill} className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                            {skill}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
