"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { COLORS, SHADOWS } from "@/lib/theme";

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

const PERSONALITY_COLORS: Record<string, string> = {
    aggressive: COLORS.red,
    conservative: COLORS.tealLight,
    unpredictable: COLORS.amber,
    adaptive: COLORS.sageLight,
    chaos: COLORS.redBright,
    chaotic: COLORS.amber,
};

export function AgentCard({
    agentId, name, level, elo, wins, losses, winStreak,
    xp, xpToNext, skills = [], personality = "adaptive",
    accentColor, onClick,
}: AgentCardProps) {
    const [hovered, setHovered] = useState(false);
    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";
    const accent = accentColor || PERSONALITY_COLORS[personality] || COLORS.gold;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={onClick}
            style={{
                background: `rgba(22, 19, 16, 0.7)`,
                backdropFilter: "blur(12px)",
                border: `1px solid ${COLORS.border}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 4,
                padding: 20,
                cursor: onClick ? "pointer" : "default",
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
                        background: `radial-gradient(circle at 50% 0, ${accent}20, transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Avatar */}
                    <div style={{
                        width: 48, height: 48, borderRadius: 10,
                        background: `linear-gradient(135deg, ${accent}, ${COLORS.tealLight})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem", fontWeight: "bold", color: COLORS.ink,
                        boxShadow: `0 0 12px ${accent}40`,
                    }}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: COLORS.textPrimary }}>{name}</div>
                        <div style={{ fontSize: "0.75rem", color: COLORS.textMuted }}>
                            {personality}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{
                        background: `${accent}20`,
                        color: accent,
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        display: "inline-block",
                        marginBottom: 4,
                        border: `1px solid ${accent}40`,
                    }}>
                        Lvl {level}
                    </div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: "1.1rem", fontWeight: 700, color: COLORS.gold, textShadow: `0 0 6px ${COLORS.gold}40` }}>
                        {Math.round(elo)} ELO
                    </div>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: COLORS.textMuted, marginBottom: 4, fontFamily: "var(--font-data)" }}>
                    <span>XP Progress</span>
                    <span>{xp} / {xp + xpToNext}</span>
                </div>
                <div style={{ height: 4, background: COLORS.raised, borderRadius: 2, overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpToNext > 0 ? (xp / (xp + xpToNext)) * 100 : 100}%` }}
                        transition={{ delay: 0.2 }}
                        style={{ height: "100%", background: accent, borderRadius: 2, boxShadow: `0 0 6px ${accent}` }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
                {[
                    { label: "Wins", value: wins.toString(), color: COLORS.tealLight },
                    { label: "Win %", value: `${winRate}%`, color: COLORS.gold },
                    { label: "Streak", value: `${winStreak}`, color: winStreak >= 3 ? COLORS.amber : COLORS.stone },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: "center", background: COLORS.raised, padding: "6px 4px", borderRadius: 4 }}>
                        <div style={{ fontSize: "0.65rem", color: COLORS.textMuted, marginBottom: 2 }}>{label}</div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {skills.map(skill => (
                        <span key={skill} style={{
                            fontSize: "0.65rem",
                            background: `${COLORS.tealLight}20`,
                            color: COLORS.tealLight,
                            padding: "2px 8px",
                            borderRadius: 2,
                            border: `1px solid ${COLORS.tealLight}30`,
                            fontFamily: "var(--font-data)",
                        }}>
                            {skill}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
