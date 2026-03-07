"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWorldStore, WORLD_ZONES, type WorldZone } from "@/lib/worldStore";
import Link from "next/link";

/* ── Minimap ─────────────────────────────────────────────── */
function Minimap() {
    const currentZone = useWorldStore((s) => s.currentZone);
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const minimapExpanded = useWorldStore((s) => s.minimapExpanded);
    const teleportToZone = useWorldStore((s) => s.teleportToZone);

    const mapSize = minimapExpanded ? 240 : 140;

    return (
        <div style={{
            width: mapSize, height: mapSize,
            background: "rgba(10,5,20,0.6)", backdropFilter: "blur(10px)",
            borderRadius: "50%", border: "1px solid rgba(139, 92, 246, 0.3)",
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)", position: "relative",
            overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease"
        }}>
            <svg viewBox="-100 -100 200 200" width="100%" height="100%">
                <defs>
                    <radialGradient id="radar" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>

                {/* Radar background */}
                <circle cx="0" cy="0" r="100" fill="url(#radar)" />

                {/* Grid */}
                <circle cx="0" cy="0" r="90" fill="none" stroke="var(--electric-purple)" strokeWidth="0.5" opacity="0.4" />
                <circle cx="0" cy="0" r="60" fill="none" stroke="var(--electric-purple)" strokeWidth="0.5" opacity="0.3" />
                <circle cx="0" cy="0" r="30" fill="none" stroke="var(--electric-purple)" strokeWidth="0.5" opacity="0.2" />

                {/* Radar sweep */}
                <g stroke="none" fill="rgba(16, 185, 129, 0.1)">
                    <path d="M0,0 L0,-100 A100,100 0 0,1 100,0 Z">
                        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite" />
                    </path>
                </g>

                {/* Zone markers */}
                {WORLD_ZONES.slice(0, 7).map((zone) => {
                    const x = zone.position[0] * 0.8;
                    const y = zone.position[2] * 0.8;
                    const isActive = zone.id === currentZone;
                    const hasMatch = liveMatches.some((m) => m.zone === zone.id);

                    return (
                        <g key={zone.id} onClick={(e) => { e.stopPropagation(); teleportToZone(zone.id); }} style={{ cursor: "pointer" }}>
                            <circle
                                cx={x} cy={y}
                                r={isActive ? 8 : 5}
                                fill={isActive ? zone.color : "rgba(30,27,75,0.8)"}
                                stroke={zone.color}
                                strokeWidth={isActive ? 2 : 1}
                                style={{ filter: isActive ? `drop-shadow(0 0 5px ${zone.color})` : "none" }}
                            />
                            {hasMatch && (
                                <circle cx={x} cy={y} r={12} fill="none" stroke="var(--danger-red)" strokeWidth="1.5" opacity="0.6">
                                    <animate attributeName="r" from="8" to="16" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            )}
                            <text
                                x={x} y={y + 16}
                                textAnchor="middle"
                                fill="var(--text-secondary)"
                                fontSize="7"
                                fontFamily="var(--font-mono)"
                                fontWeight="bold"
                            >
                                {zone.icon}
                            </text>
                        </g>
                    );
                })}

                {/* Player position */}
                {(() => {
                    const currentZoneConfig = WORLD_ZONES.find((z) => z.id === currentZone);
                    const px = (currentZoneConfig?.position[0] ?? 0) * 0.8;
                    const py = (currentZoneConfig?.position[2] ?? 0) * 0.8;
                    return (
                        <g>
                            <circle cx={px} cy={py} r="4" fill="var(--arena-gold)" filter="drop-shadow(0 0 4px var(--arena-gold))">
                                <animate attributeName="r" from="3" to="5" dur="1s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={px} cy={py} r="10" fill="none" stroke="var(--arena-gold)" strokeWidth="1" opacity="0.5">
                                <animate attributeName="r" from="5" to="15" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                        </g>
                    );
                })()}
            </svg>
        </div>
    );
}

/* ── Navigation shortcut bar ──────────────────────────────── */
function NavBar() {
    const teleportToZone = useWorldStore((s) => s.teleportToZone);
    const currentZone = useWorldStore((s) => s.currentZone);

    const shortcuts: { zone: WorldZone; icon: string; label: string }[] = [
        { zone: "central-nexus", icon: "🏛️", label: "Nexus" },
        { zone: "arena-chess", icon: "♟️", label: "Chess" },
        { zone: "arena-poker", icon: "🃏", label: "Poker" },
        { zone: "arena-monopoly", icon: "🎩", label: "Monopoly" },
        { zone: "workshop", icon: "🔧", label: "Workshop" },
        { zone: "marketplace", icon: "🛒", label: "Market" },
    ];

    return (
        <div style={{ display: "flex", gap: "var(--space-sm)", background: "rgba(10,5,20,0.7)", padding: "8px", borderRadius: "100px", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            {shortcuts.map((s) => (
                <button
                    key={s.zone}
                    onClick={() => teleportToZone(s.zone)}
                    title={s.label}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 16px", borderRadius: "100px",
                        background: currentZone === s.zone ? "rgba(139, 92, 246, 0.2)" : "transparent",
                        border: currentZone === s.zone ? "1px solid var(--electric-purple)" : "1px solid transparent",
                        color: currentZone === s.zone ? "white" : "var(--text-muted)",
                        transition: "all 0.2s", cursor: "pointer",
                        fontWeight: currentZone === s.zone ? 700 : 500
                    }}
                    onMouseEnter={(e) => { if (currentZone !== s.zone) e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { if (currentZone !== s.zone) e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                    <span style={{ fontSize: "1.2rem", filter: currentZone === s.zone ? "drop-shadow(0 0 5px rgba(255,255,255,0.5))" : "none" }}>{s.icon}</span>
                    <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                </button>
            ))}
        </div>
    );
}

/* ── Active agent card ───────────────────────────────────── */
function ActiveAgentCard() {
    const agents = useWorldStore((s) => s.agents);
    const myAgentId = useWorldStore((s) => s.myAgentId);
    const myAgent = agents.find((a) => a.id === myAgentId);

    if (!myAgent) return null;

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            style={{
                background: "linear-gradient(135deg, rgba(10,5,20,0.8), rgba(20,10,40,0.9))",
                backdropFilter: "blur(20px)", border: `1px solid ${myAgent.auraColor || "var(--electric-purple)"}`,
                borderRadius: "var(--radius-lg)", padding: "var(--space-md)",
                display: "flex", alignItems: "center", gap: "var(--space-md)",
                boxShadow: `0 0 20px ${myAgent.auraColor || "var(--electric-purple)"}40`,
                width: 280
            }}
        >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `2px solid ${myAgent.auraColor || "var(--electric-purple)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: `inset 0 0 10px ${myAgent.auraColor || "var(--electric-purple)"}80` }}>
                ⚡
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "white" }}>{myAgent.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 2 }}>
                    <span>Lv.{myAgent.level}</span>
                    <span style={{ color: "var(--arena-gold)" }}>ELO {myAgent.elo}</span>
                </div>
                <div className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--neon-green)", border: "1px solid var(--neon-green)", marginTop: 6, fontSize: "0.6rem" }}>
                    {myAgent.status.toUpperCase()}
                </div>
            </div>
        </motion.div>
    );
}

/* ── Live match ticker ───────────────────────────────────── */
function MatchTicker() {
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const teleportToZone = useWorldStore((s) => s.teleportToZone);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", width: 320 }}>
            {liveMatches.filter((m) => m.status === "live").map((match) => (
                <motion.div
                    key={match.id}
                    onClick={() => teleportToZone(match.zone)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, x: -5, background: "rgba(139, 92, 246, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        background: "rgba(10,5,20,0.7)", backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.05)", borderLeft: "3px solid var(--danger-red)",
                        borderRadius: "var(--radius-md)", padding: "12px",
                        cursor: "pointer", transition: "all 0.2s"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div className="badge badge-live" style={{ fontSize: "0.6rem" }}>LIVE</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>👁 {match.spectators.toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: "1.5rem" }}>{match.gameType === "chess" ? "♟️" : match.gameType === "poker" ? "🃏" : "🎩"}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" }}>
                            {match.agentA.name} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 400 }}>vs</span> {match.agentB.name}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ── Full HUD ────────────────────────────────────────────── */
export function WorldHUD() {
    const hudVisible = useWorldStore((s) => s.hudVisible);
    const arenaBalance = useWorldStore((s) => s.arenaBalance);
    const spectatorCount = useWorldStore((s) => s.spectatorCount);
    const currentZone = useWorldStore((s) => s.currentZone);
    const zone = WORLD_ZONES.find((z) => z.id === currentZone);

    if (!hudVisible) return null;

    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, fontFamily: "var(--font-body)" }}>

            {/* Header / Global Nav */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "var(--space-md) var(--space-xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent)", pointerEvents: "none" }}>

                {/* Top Left: Exit & Minimap */}
                <div style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                        <Link href="/" className="btn btn-ghost" style={{ background: "rgba(10,5,20,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "100px", fontSize: "0.85rem", padding: "8px 16px" }}>
                            ← Exit 3D World
                        </Link>

                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(10,5,20,0.6)", backdropFilter: "blur(10px)", border: "1px solid var(--arena-gold)", borderRadius: "100px", padding: "6px 16px", boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)" }}>
                            <span style={{ fontSize: "1.1rem" }}>💰</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--arena-gold)", fontSize: "0.95rem" }}>{arenaBalance.toLocaleString()} $ARENA</span>
                        </motion.div>
                    </div>

                    <Minimap />
                </div>

                {/* Top Center: Zone name */}
                <div style={{ pointerEvents: "auto" }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentZone}
                            initial={{ y: -20, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -20, opacity: 0, scale: 0.9 }}
                            style={{
                                background: "rgba(10,5,20,0.7)", backdropFilter: "blur(20px)",
                                border: `1px solid ${zone?.color || "var(--electric-purple)"}`,
                                borderRadius: "100px", padding: "8px 24px",
                                display: "flex", alignItems: "center", gap: 8,
                                boxShadow: `0 5px 20px ${zone?.color || "var(--electric-purple)"}40`
                            }}
                        >
                            <span style={{ fontSize: "1.4rem", filter: `drop-shadow(0 0 5px ${zone?.color})` }}>{zone?.icon}</span>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{zone?.label}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Top Right: Match ticker & Global Stats */}
                <div style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", gap: "var(--space-md)", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                        <div style={{ background: "rgba(10,5,20,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: "6px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "var(--neon-green)" }}>{spectatorCount.toLocaleString()}</span>
                            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Global Online</span>
                        </div>
                    </div>
                    <MatchTicker />
                </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "var(--space-xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", background: "linear-gradient(0deg, rgba(0,0,0,0.8), transparent)", pointerEvents: "none" }}>

                {/* Bottom Left: Controls hint */}
                <div style={{ pointerEvents: "auto" }}>
                    <div style={{ display: "flex", gap: "var(--space-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(5px)", padding: "8px 16px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span><strong style={{ color: "white" }}>L-Click</strong> Orbit</span> •
                        <span><strong style={{ color: "white" }}>Scroll</strong> Zoom</span> •
                        <span><strong style={{ color: "white" }}>R-Click</strong> Interact</span>
                    </div>
                </div>

                {/* Bottom Center: Navigation bar */}
                <div style={{ pointerEvents: "auto", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                    <NavBar />
                </div>

                {/* Bottom Right: Active agent */}
                <div style={{ pointerEvents: "auto" }}>
                    <ActiveAgentCard />
                </div>
            </div>

        </div>
    );
}
