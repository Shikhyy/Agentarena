"use client";

import { motion } from "framer-motion";

const MY_AGENTS = [
    {
        id: "a1",
        name: "ZEUS",
        personality: "Aggressive",
        level: 24,
        elo: 2187,
        wins: 142,
        losses: 38,
        skills: ["Poker Face", "Grandmaster Openings"],
        earnings: "12,450",
        status: "Idle",
    },
    {
        id: "a2",
        name: "PHANTOM",
        personality: "Chaos",
        level: 18,
        elo: 1923,
        wins: 97,
        losses: 62,
        skills: ["Bluff Detector"],
        earnings: "7,230",
        status: "In Battle",
    },
    {
        id: "a3",
        name: "NOVA",
        personality: "Adaptive",
        level: 12,
        elo: 1654,
        wins: 54,
        losses: 41,
        skills: [],
        earnings: "3,180",
        status: "Idle",
    },
];

export default function AgentsPage() {
    return (
        <div className="page container">
            <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-xl)" }}>
                <div>
                    <h1>🤖 <span className="text-gradient">My Agents</span></h1>
                    <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                        Manage your AI warriors. Upgrade, breed, and deploy.
                    </p>
                </div>
                <a href="/builder" className="btn btn-primary">
                    + Build New Agent
                </a>
            </div>

            {/* Agent Portfolio Grid */}
            <div className="grid-3">
                {MY_AGENTS.map((agent, i) => (
                    <motion.div
                        key={agent.id}
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ padding: 0, overflow: "hidden" }}
                    >
                        {/* Agent Header */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, var(--midnight-navy), var(--deep-space))",
                                padding: "var(--space-xl)",
                                textAlign: "center",
                                position: "relative",
                            }}
                        >
                            {agent.status === "In Battle" && (
                                <span className="badge badge-live" style={{ position: "absolute", top: 12, right: 12 }}>
                                    ● LIVE
                                </span>
                            )}
                            <div style={{ fontSize: "3.5rem", marginBottom: "var(--space-sm)" }}>🤖</div>
                            <h3>{agent.name}</h3>
                            <div className="flex justify-center gap-sm" style={{ marginTop: "var(--space-sm)" }}>
                                <span className="badge badge-purple">{agent.personality}</span>
                                <span className="badge badge-gold">Lv.{agent.level}</span>
                            </div>
                        </div>

                        {/* Agent Stats */}
                        <div style={{ padding: "var(--space-lg)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--electric-purple-light)" }}>{agent.elo}</div>
                                    <div className="stat-label">ELO</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--arena-gold)" }}>{agent.earnings}</div>
                                    <div className="stat-label">$ARENA</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--neon-green)" }}>{agent.wins}</div>
                                    <div className="stat-label">Wins</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--danger-red)" }}>{agent.losses}</div>
                                    <div className="stat-label">Losses</div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div style={{ marginBottom: "var(--space-lg)" }}>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-sm)" }}>
                                    Skills
                                </div>
                                <div className="flex gap-sm" style={{ flexWrap: "wrap" }}>
                                    {agent.skills.length > 0
                                        ? agent.skills.map((s) => <span key={s} className="badge badge-win">{s}</span>)
                                        : <span className="text-muted" style={{ fontSize: "0.8125rem" }}>No skills equipped</span>
                                    }
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-sm">
                                <a href={`/arenas?deploy=${agent.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                                    ⚔️ Deploy
                                </a>
                                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                                    📊 Stats
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
