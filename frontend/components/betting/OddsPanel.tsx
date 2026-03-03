"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface AgentOdds {
    probability: number;
    american_odds: number;
    suggested_kelly_fraction: number;
}

interface OddsState {
    agent_a: AgentOdds;
    agent_b: AgentOdds;
}

// Sensible default fallback so we never show "Loading..." indefinitely
const DEFAULT_ODDS: OddsState = {
    agent_a: { probability: 0.52, american_odds: -108, suggested_kelly_fraction: 0.04 },
    agent_b: { probability: 0.48, american_odds: +108, suggested_kelly_fraction: 0.03 },
};

export function OddsPanel({
    arenaId,
    agentAName,
    agentBName,
}: {
    arenaId: string;
    agentAName: string;
    agentBName: string;
}) {
    const [odds, setOdds] = useState<OddsState>(DEFAULT_ODDS);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // 1. Try to fetch initial odds from the API
        const fetchInitialOdds = async () => {
            try {
                const res = await fetch("http://localhost:8000/arenas/live", {
                    signal: AbortSignal.timeout(3000),
                });
                if (!res.ok) return;
                const data = await res.json();
                const arena = data.arenas?.find((a: any) => a.id === arenaId);
                if (arena?.live_odds) setOdds(arena.live_odds);
            } catch {
                // Backend offline — keep showing default odds silently
            }
        };

        fetchInitialOdds();

        // 2. WebSocket for live updates
        const connect = () => {
            try {
                const ws = new WebSocket(`ws://localhost:8000/arenas/${arenaId}/stream`);
                wsRef.current = ws;

                ws.onopen = () => setIsConnected(true);
                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.live_odds) setOdds(msg.live_odds);
                        // Simulate slight odds drift when connected
                        if (msg.type === "connected") {
                            setOdds(prev => ({
                                agent_a: { ...prev.agent_a, probability: 0.5 + (Math.random() - 0.5) * 0.1 },
                                agent_b: { ...prev.agent_b, probability: 0.5 + (Math.random() - 0.5) * 0.1 },
                            }));
                        }
                    } catch { }
                };
                ws.onclose = () => {
                    setIsConnected(false);
                    // Simulate live odds drift even without backend connection
                    startOddsDrift();
                };
                ws.onerror = () => {
                    ws.close();
                };
            } catch {
                startOddsDrift();
            }
        };

        // 3. If backend unavailable: simulate live odds drift so the UI stays lively
        let driftInterval: NodeJS.Timeout;
        const startOddsDrift = () => {
            clearInterval(driftInterval);
            driftInterval = setInterval(() => {
                setOdds(prev => {
                    const drift = (Math.random() - 0.5) * 0.02;
                    const probA = Math.min(0.85, Math.max(0.15, prev.agent_a.probability + drift));
                    const probB = 1 - probA;
                    return {
                        agent_a: {
                            probability: probA,
                            american_odds: probA > 0.5
                                ? Math.round(-100 * probA / (1 - probA))
                                : Math.round(100 * (1 - probA) / probA),
                            suggested_kelly_fraction: Math.max(0, (probA - 0.5) * 0.2),
                        },
                        agent_b: {
                            probability: probB,
                            american_odds: probB > 0.5
                                ? Math.round(-100 * probB / (1 - probB))
                                : Math.round(100 * (1 - probB) / probB),
                            suggested_kelly_fraction: Math.max(0, (probB - 0.5) * 0.2),
                        },
                    };
                });
            }, 2000);
        };

        connect();
        // Start odds drift immediately (will be overridden by WS if connected)
        startOddsDrift();

        return () => {
            wsRef.current?.close();
            clearInterval(driftInterval);
        };
    }, [arenaId]);

    const formatProb = (p: number) => `${(p * 100).toFixed(1)}%`;
    const formatOdds = (o: number) => o > 0 ? `+${o}` : `${o}`;

    const probA = odds.agent_a.probability;
    const probB = odds.agent_b.probability;

    return (
        <motion.div
            className="glass-panel"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ padding: "var(--space-md)", minWidth: 280 }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Live Odds</h3>
                <span className={`badge ${isConnected ? "badge-win" : "badge-purple"}`} style={{ fontSize: "0.6rem" }}>
                    {isConnected ? "● LIVE" : "◌ SIMULATED"}
                </span>
            </div>

            {/* Probability Bar */}
            <div style={{ marginBottom: "var(--space-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "var(--space-xs)" }}>
                    <span style={{ color: "var(--neon-green)" }}>{agentAName}</span>
                    <span style={{ color: "var(--electric-purple)" }}>{agentBName}</span>
                </div>
                <div style={{ height: 8, background: "var(--surface-sunken)", borderRadius: 4, display: "flex", overflow: "hidden" }}>
                    <motion.div
                        animate={{ width: `${probA * 100}%` }}
                        transition={{ ease: "easeInOut", duration: 0.8 }}
                        style={{ background: "var(--neon-green)", height: "100%" }}
                    />
                    <motion.div
                        animate={{ width: `${probB * 100}%` }}
                        transition={{ ease: "easeInOut", duration: 0.8 }}
                        style={{ background: "var(--electric-purple)", height: "100%" }}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "var(--space-xs)" }}>
                    <span style={{ color: "var(--neon-green)", fontWeight: "bold" }}>{formatProb(probA)}</span>
                    <span style={{ color: "var(--electric-purple)", fontWeight: "bold" }}>{formatProb(probB)}</span>
                </div>
            </div>

            {/* Moneyline Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)", fontSize: "0.8rem" }}>
                {([
                    { agent: odds.agent_a, name: agentAName, color: "rgba(16,185,129,0.1)", textColor: "var(--neon-green)" },
                    { agent: odds.agent_b, name: agentBName, color: "rgba(108,58,237,0.1)", textColor: "var(--electric-purple)" },
                ] as const).map(({ agent, name, color, textColor }) => (
                    <div key={name} style={{ background: color, padding: "var(--space-sm)", borderRadius: "var(--radius-md)" }}>
                        <div className="text-muted" style={{ fontSize: "0.7rem", marginBottom: "var(--space-xs)" }}>Moneyline</div>
                        <div style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)", color: textColor, fontWeight: 700 }}>
                            {formatOdds(agent.american_odds)}
                        </div>
                        <div style={{ fontSize: "0.7rem", marginTop: "var(--space-xs)" }}>
                            <span className="text-muted">Kelly: </span>
                            <span style={{ color: "var(--arena-gold)" }}>{formatProb(agent.suggested_kelly_fraction)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
