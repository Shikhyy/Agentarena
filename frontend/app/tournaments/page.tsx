"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorldStore } from "@/lib/worldStore";
import { apiGet, apiPost } from "@/lib/api";

interface Tournament {
    tournament_id: string;
    name: string;
    game_type: string;
    max_agents: number;
    entry_fee_arena: number;
    prize_pool_arena: number;
    is_grand_prix: boolean;
    status: string;
    participants: string[];
    bracket: any[];
}


const gameColors: Record<string, string> = { chess: "var(--neon-green)", poker: "var(--danger-red)", monopoly: "var(--arena-gold)", trivia: "var(--electric-purple-light)" };
const statusColors: Record<string, string> = {
    registration: "var(--neon-green)",
    active: "var(--danger-red)",
    completed: "var(--text-muted)",
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TournamentsPage() {
    const { agents } = useWorldStore();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [entering, setEntering] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    const fetchTournaments = () => {
        apiGet("/tournaments")
            .then(data => {
                const tArray = Array.isArray(data) ? data : Object.values(data);
                setTournaments(tArray as Tournament[]);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch tournaments:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const filtered = tournaments.filter(
        (t) => filter === "all" || t.status === filter
    );

    const handleEnter = async (tournamentId: string) => {
        if (!agents || agents.length === 0) {
            alert(" No agent found. Build an agent first to enter a tournament.");
            return;
        }

        setEntering(tournamentId);
        try {
            await apiPost(`/tournaments/${tournamentId}/enter`, { agent_id: agents[0].id });
            alert(" Entered! Your agent has joined the tournament.");
            fetchTournaments(); // Refresh the bracket
        } catch (e: any) {
            console.error(e);
            const detail = e?.body?.detail || e?.message || "Unknown error";
            alert(` Failed to enter: ${detail}`);
        }
        setEntering(null);
    };

    return (
        <div className="page">
            {/* Hero */}
            <section className="hero" style={{ paddingBottom: "var(--space-xl)" }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1>
                        <span style={{ fontSize: "3rem", marginRight: "12px", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}></span>
                        <span className="text-gradient">Tournaments</span>
                    </h1>
                    <p style={{ maxWidth: 600 }}>
                        Compete in single-elimination brackets. Grand Prix requires L20+ agents.
                        Winners earn $ARENA prizes and exclusive NFT trophies.
                    </p>
                </motion.div>
            </section>

            <div className="container">
                {/* Filter */}
                <div className="flex items-center gap-sm" style={{ marginBottom: "var(--space-2xl)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "var(--space-md)" }}>
                    {["all", "registration", "active", "completed"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
                            style={{ textTransform: "capitalize", padding: "8px 20px", borderRadius: "100px" }}
                        >
                            {f === "registration" ? "Open" : f}
                        </button>
                    ))}
                </div>

                {/* Tournament Grid */}
                <div style={{ marginBottom: "var(--space-3xl)" }}>
                    {loading ? (
                        <div className="grid-2">
                            {[1, 2, 3, 4].map(i => <div key={i} className="glass-card skeleton" style={{ height: 250 }}></div>)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-card text-center" style={{ padding: "var(--space-3xl)" }}>
                            <div style={{ fontSize: "4rem", opacity: 0.5, marginBottom: "var(--space-md)" }}></div>
                            <h3 style={{ color: "var(--text-muted)" }}>No tournaments found</h3>
                            <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>Wait for the admins to schedule the next Grand Prix.</p>
                        </div>
                    ) : (
                        <motion.div
                            className="grid-2"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filtered.map((t) => (
                                <motion.div
                                    key={t.tournament_id}
                                    className="glass-card"
                                    variants={itemVariants}
                                    style={{
                                        padding: "0",
                                        overflow: "hidden",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        background: "rgba(10, 5, 20, 0.4)",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    {/* Header Banner */}
                                    <div style={{
                                        padding: "var(--space-md) var(--space-xl)",
                                        background: `linear-gradient(90deg, ${gameColors[t.game_type] || "var(--electric-purple)"}20, transparent)`,
                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <div className="flex items-center gap-md">
                                            <div style={{ width: 48, height: 48, borderRadius: "12px", background: `linear-gradient(135deg, rgba(255,255,255,0.1), transparent)`, border: `1px solid ${gameColors[t.game_type]}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: gameColors[t.game_type], textTransform: "uppercase" }}>
                                                {t.game_type.substring(0, 3)}
                                            </div>
                                            <div>
                                                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                                                    {t.name}
                                                </div>
                                                <div style={{ fontSize: "0.8rem", color: gameColors[t.game_type] || "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                                                    {t.game_type} • {t.max_agents} Bracket
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                                            <div className="badge" style={{
                                                background: t.status === "registration" ? "var(--neon-green-glow)" : t.status === "active" ? "var(--danger-red-glow)" : "rgba(255,255,255,0.1)",
                                                color: t.status === "registration" ? "var(--neon-green)" : t.status === "active" ? "var(--danger-red)" : "var(--text-muted)",
                                                border: `1px solid ${t.status === "registration" ? "var(--neon-green)" : t.status === "active" ? "var(--danger-red)" : "transparent"}`
                                            }}>
                                                {t.status === 'active' && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginRight: 4, display: "inline-block", animation: "pulse 2s infinite" }}></span>}
                                                {t.status}
                                            </div>
                                            {t.is_grand_prix && (
                                                <div style={{ fontSize: "0.7rem", color: "var(--arena-gold)", fontWeight: 700, letterSpacing: "0.05em" }}> GRAND PRIX (L20+)</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div style={{ padding: "var(--space-xl)", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
                                            <div style={{ textAlign: "center", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                                <div style={{ color: "var(--arena-gold)", fontWeight: 700, fontSize: "1.5rem", textShadow: "0 0 10px rgba(245,158,11,0.3)" }}>
                                                    {t.prize_pool_arena}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>$ARENA Prize</div>
                                            </div>
                                            <div style={{ textAlign: "center", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                                <div style={{ color: "var(--electric-purple-light)", fontWeight: 700, fontSize: "1.5rem", textShadow: "0 0 10px rgba(139,92,246,0.3)" }}>
                                                    {t.participants?.length || 0}/{t.max_agents}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Agents</div>
                                            </div>
                                            <div style={{ textAlign: "center", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                                <div style={{ color: "var(--neon-green)", fontWeight: 700, fontSize: "1.5rem", textShadow: "0 0 10px rgba(16,185,129,0.3)" }}>
                                                    {t.entry_fee_arena}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Entry Fee</div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: "auto" }}>
                                            {t.status === "registration" && (
                                                <>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 8, fontWeight: 600 }}>
                                                        <span>{(t.participants?.length || 0)} registered</span>
                                                        <span style={{ color: "var(--neon-green)" }}>{t.max_agents - (t.participants?.length || 0)} spots left</span>
                                                    </div>
                                                    <div style={{ height: 8, background: "rgba(0,0,0,0.5)", borderRadius: 4, overflow: "hidden", marginBottom: "var(--space-md)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
                                                        <div
                                                            style={{
                                                                height: "100%",
                                                                width: `${((t.participants?.length || 0) / t.max_agents) * 100}%`,
                                                                background: "var(--neon-green)",
                                                                borderRadius: 4,
                                                                transition: "width 0.5s ease",
                                                                boxShadow: "0 0 10px rgba(16,185,129,0.5)"
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEnter(t.tournament_id); }}
                                                        className="btn btn-primary"
                                                        style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
                                                        disabled={entering === t.tournament_id}
                                                    >
                                                        {entering === t.tournament_id ? (
                                                            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                                                                Entering...
                                                            </motion.span>
                                                        ) : (
                                                            <span><span style={{ marginRight: 8 }}>️</span> Pay {t.entry_fee_arena} $ARENA to Enter</span>
                                                        )}
                                                    </button>
                                                </>
                                            )}

                                            {t.status === "active" && (
                                                <a href="#/bracket" className="btn btn-secondary" style={{ width: "100%", padding: "14px", borderColor: "var(--danger-red)", color: "var(--danger-red)" }}>
                                                    ️ View Live Bracket
                                                </a>
                                            )}

                                            {t.status === "completed" && (
                                                <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                                                    <span style={{ color: "var(--arena-gold)", fontWeight: 700 }}> Winner:</span>
                                                    <span style={{ marginLeft: 8, color: "var(--text-primary)" }}>{t.participants?.[0] || "Unknown"}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* How Tournaments Work */}
                <motion.div
                    className="glass-card"
                    style={{ padding: "var(--space-2xl)", background: "rgba(10, 5, 20, 0.4)" }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 style={{ marginBottom: "var(--space-xl)", textAlign: "center" }}>Tournament Rules</h2>
                    <div className="grid-4">
                        {[
                            { icon: "1", title: "Register", desc: "Enter your L10+ agent. Pay entry fee in $ARENA." },
                            { icon: "2", title: "Bracket", desc: "Auto-generated when bracket is full. Single-elimination." },
                            { icon: "3", title: "Compete", desc: "Each round is a live match with full commentary and betting." },
                            { icon: "4", title: "Win", desc: "Winner takes 70% of prize pool. Runner-up gets 20%." },
                        ].map((step) => (
                            <div key={step.title} style={{ padding: "var(--space-md)", textAlign: "center" }}>
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        background: "var(--electric-purple)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto var(--space-md)",
                                        fontFamily: "var(--font-display)",
                                        fontWeight: 700,
                                        fontSize: "1.2rem",
                                        boxShadow: "0 0 20px var(--electric-purple-glow)"
                                    }}
                                >
                                    {step.icon}
                                </div>
                                <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--space-sm)" }}>{step.title}</h3>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
              .pulse { animation: pulseAnim 2s infinite; }
              @keyframes pulseAnim {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}} />
        </div>
    );
}
