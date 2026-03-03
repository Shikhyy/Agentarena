"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWorldStore, WORLD_ZONES, type WorldZone } from "@/lib/worldStore";

/* ── Minimap ─────────────────────────────────────────────── */
function Minimap() {
    const currentZone = useWorldStore((s) => s.currentZone);
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const minimapExpanded = useWorldStore((s) => s.minimapExpanded);
    const teleportToZone = useWorldStore((s) => s.teleportToZone);

    const mapSize = minimapExpanded ? 200 : 120;

    return (
        <div className="world-minimap" style={{ width: mapSize, height: mapSize }}>
            <svg viewBox="-100 -100 200 200" width="100%" height="100%">
                {/* Grid */}
                <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(108,58,237,0.2)" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(108,58,237,0.15)" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(108,58,237,0.1)" strokeWidth="0.5" />

                {/* Zone markers */}
                {WORLD_ZONES.slice(0, 7).map((zone) => {
                    const x = zone.position[0] * 0.8;
                    const y = zone.position[2] * 0.8;
                    const isActive = zone.id === currentZone;
                    const hasMatch = liveMatches.some((m) => m.zone === zone.id);

                    return (
                        <g
                            key={zone.id}
                            onClick={() => teleportToZone(zone.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <circle
                                cx={x}
                                cy={y}
                                r={isActive ? 8 : 5}
                                fill={isActive ? zone.color : "rgba(30,27,75,0.8)"}
                                stroke={zone.color}
                                strokeWidth={isActive ? 2 : 1}
                            />
                            {hasMatch && (
                                <circle cx={x} cy={y} r={12} fill="none" stroke="#EF4444" strokeWidth="1" opacity="0.6">
                                    <animate attributeName="r" from="8" to="14" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            )}
                            <text
                                x={x}
                                y={y + 14}
                                textAnchor="middle"
                                fill="rgba(248,250,252,0.6)"
                                fontSize="6"
                                fontFamily="var(--font-mono)"
                            >
                                {zone.icon}
                            </text>
                        </g>
                    );
                })}

                {/* Player position — tracks current zone */}
                {(() => {
                    const currentZoneConfig = WORLD_ZONES.find((z) => z.id === currentZone);
                    const px = (currentZoneConfig?.position[0] ?? 0) * 0.8;
                    const py = (currentZoneConfig?.position[2] ?? 0) * 0.8;
                    return (
                        <circle cx={px} cy={py} r="3" fill="#F59E0B">
                            <animate attributeName="r" from="2" to="4" dur="1s" repeatCount="indefinite" />
                        </circle>
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
        { zone: "arena-monopoly", icon: "🏠", label: "Monopoly" },
        { zone: "workshop", icon: "🔧", label: "Workshop" },
        { zone: "marketplace", icon: "🛒", label: "Market" },
        { zone: "hall-of-fame", icon: "🏆", label: "Hall" },
    ];

    return (
        <div className="world-nav-bar">
            {shortcuts.map((s) => (
                <button
                    key={s.zone}
                    className={`world-nav-btn ${currentZone === s.zone ? "active" : ""}`}
                    onClick={() => teleportToZone(s.zone)}
                    title={s.label}
                >
                    <span className="world-nav-icon">{s.icon}</span>
                    <span className="world-nav-label">{s.label}</span>
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
            className="world-agent-card"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <div className="world-agent-card-avatar" style={{ borderColor: myAgent.auraColor }}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
            </div>
            <div className="world-agent-card-info">
                <div className="world-agent-card-name">{myAgent.name}</div>
                <div className="world-agent-card-stats">
                    Lv.{myAgent.level} · ELO {myAgent.elo}
                </div>
                <div className={`world-agent-card-status ${myAgent.status}`}>
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
        <div className="world-match-ticker">
            {liveMatches.filter((m) => m.status === "live").map((match) => (
                <motion.div
                    key={match.id}
                    className="world-match-ticker-item"
                    onClick={() => teleportToZone(match.zone)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="world-match-ticker-badge">LIVE</div>
                    <div className="world-match-ticker-game">
                        {match.gameType === "chess" ? "♟️" : match.gameType === "poker" ? "🃏" : "🏠"}
                    </div>
                    <div className="world-match-ticker-agents">
                        {match.agentA.name} vs {match.agentB.name}
                    </div>
                    <div className="world-match-ticker-spectators">
                        👁 {match.spectators.toLocaleString()}
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
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const zone = WORLD_ZONES.find((z) => z.id === currentZone);

    if (!hudVisible) return null;

    return (
        <div className="world-hud">
            {/* Exit / back to 2D site */}
            <div className="world-hud-exit">
                <a href="/" className="world-exit-btn" title="Exit 3D World">
                    ← Exit World
                </a>
            </div>

            {/* Top Left: Balance + Stats + Minimap */}
            <div className="world-hud-top-left">
                <motion.div
                    className="world-hud-balance"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <span className="world-hud-balance-icon">💰</span>
                    <span className="world-hud-balance-amount">{arenaBalance.toLocaleString()} $ARENA</span>
                </motion.div>

                <div className="world-hud-stats-row">
                    <div className="world-hud-stat">
                        <span className="world-hud-stat-value">{liveMatches.filter((m) => m.status === "live").length}</span>
                        <span className="world-hud-stat-label">Live</span>
                    </div>
                    <div className="world-hud-stat">
                        <span className="world-hud-stat-value">{spectatorCount.toLocaleString()}</span>
                        <span className="world-hud-stat-label">Online</span>
                    </div>
                </div>

                <Minimap />
            </div>

            {/* Top Center: Zone name */}
            <div className="world-hud-top-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentZone}
                        className="world-hud-zone-name"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        style={{ borderColor: zone?.color || "#6C3AED" }}
                    >
                        <span>{zone?.icon}</span> {zone?.label}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Top Right: Match ticker */}
            <div className="world-hud-top-right">
                <MatchTicker />
            </div>

            {/* Bottom Center: Navigation bar */}
            <div className="world-hud-bottom-center">
                <NavBar />
            </div>

            {/* Bottom Right: Active agent */}
            <div className="world-hud-bottom-right">
                <ActiveAgentCard />
            </div>

            {/* Bottom Left: Controls hint */}
            <div className="world-hud-bottom-left">
                <div className="world-hud-controls">
                    <span>🖱️ Orbit</span> · <span>Scroll Zoom</span> · <span>Click Interact</span>
                </div>
            </div>
        </div>
    );
}
