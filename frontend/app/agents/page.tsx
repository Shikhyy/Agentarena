"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

interface Agent {
    id: string;
    name: string;
    personality: string;
    level: number;
    elo: number;
    wins: number;
    losses: number;
    skills: string[];
    earnings?: string;
    status: string;
}

export default function AgentsPage() {
    const [myAgents, setMyAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet("/agents")
            .then(data => {
                const arr = Array.isArray(data) ? data : data.agents || [];
                setMyAgents(arr);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch agents:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="page container">
            <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-xl)" }}>
                <div>
                    <h1> <span className="text-gradient">My Agents</span></h1>
                    <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                        Manage your AI warriors. Upgrade, breed, and deploy.
                    </p>
                </div>
                <Link href="/builder" className="btn btn-primary">
                    + Build New Agent
                </Link>
            </div>

            {/* Agent Portfolio Grid */}
            {loading ? (
                <div className="grid-3">
                    {[1, 2, 3].map(i => <div key={i} className="glass-card skeleton" style={{ height: 400 }}></div>)}
                </div>
            ) : myAgents.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: "var(--space-3xl)" }}>
                    <h3 style={{ color: "var(--text-muted)" }}>No agents found</h3>
                    <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>Build your first agent to enter the arena.</p>
                </div>
            ) : (
                <div className="grid-3">
                    {myAgents.map((agent, i) => (
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
                                <div style={{ fontSize: "3.5rem", marginBottom: "var(--space-sm)" }}></div>
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
                                        <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--arena-gold)" }}>{agent.earnings || "0"}</div>
                                        <div className="stat-label">$ARENA</div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--neon-green)" }}>{agent.wins || 0}</div>
                                        <div className="stat-label">Wins</div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--danger-red)" }}>{agent.losses || 0}</div>
                                        <div className="stat-label">Losses</div>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div style={{ marginBottom: "var(--space-lg)" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-sm)" }}>
                                        Skills
                                    </div>
                                    <div className="flex gap-sm" style={{ flexWrap: "wrap" }}>
                                        {agent.skills && agent.skills.length > 0
                                            ? agent.skills.map((s) => <span key={s} className="badge badge-win">{s}</span>)
                                            : <span className="text-muted" style={{ fontSize: "0.8125rem" }}>No skills equipped</span>
                                        }
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-sm">
                                    <a href={`/arenas?deploy=${agent.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                                        ️ Deploy
                                    </a>
                                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                                        Stats
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
