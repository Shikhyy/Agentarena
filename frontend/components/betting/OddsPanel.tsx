"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface AgentOdds {
    probability: number;
    american_odds: number;
    suggested_kelly_fraction: number;
}

interface OddsState {
    agent_a: AgentOdds;
    agent_b: AgentOdds;
}

export function OddsPanel({ arenaId, agentAName, agentBName }: { arenaId: string, agentAName: string, agentBName: string }) {
    const [odds, setOdds] = useState<OddsState | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Simple polling fallback or placeholder for WS connection
        // The real WS connection is usually handled in the parent LiveArena view
        // But for isolation, we'll fetch the initial state here.
        const fetchInitialOdds = async () => {
            try {
                const res = await fetch("http://localhost:8000/arenas/live");
                const data = await res.json();
                const arena = data.arenas.find((a: any) => a.id === arenaId);
                if (arena && arena.live_odds) {
                    setOdds(arena.live_odds);
                }
            } catch (e) {
                console.error("Failed to fetch initial odds", e);
            }
        };

        fetchInitialOdds();

        // Setup WS for receiving odds_update from main.py broadcast
        // Note: Using standard browser WebSocket since backend emits raw JSON
        const ws = new WebSocket(`ws://localhost:8000/arenas/${arenaId}/stream`);

        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "odds_update" || msg.type === "connected") {
                if (msg.live_odds) setOdds(msg.live_odds);
            }
        };
        ws.onclose = () => setIsConnected(false);

        return () => ws.close();
    }, [arenaId]);

    const formatProb = (p: number) => `${(p * 100).toFixed(1)}%`;
    const formatOdds = (o: number) => o > 0 ? `+${o}` : `${o}`;

    if (!odds) return <div className="glass-panel text-muted" style={{ padding: "var(--space-md)" }}>Loading live odds...</div>;

    const probA = odds.agent_a.probability;
    const probB = odds.agent_b.probability;

    return (
        <div className="glass-panel" style={{ padding: "var(--space-md)", minWidth: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Live Odds</h3>
                <span className={`badge ${isConnected ? "badge-win" : ""}`} style={{ fontSize: "0.6rem" }}>
                    {isConnected ? "LIVE" : "OFFLINE"}
                </span>
            </div>

            {/* Probability Bars */}
            <div style={{ marginBottom: "var(--space-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "var(--space-xs)" }}>
                    <span style={{ color: "var(--neon-green)" }}>{agentAName}</span>
                    <span style={{ color: "var(--electric-purple)" }}>{agentBName}</span>
                </div>

                <div style={{ height: 8, background: "var(--surface-sunken)", borderRadius: 4, display: "flex", overflow: "hidden" }}>
                    <motion.div
                        animate={{ width: `${probA * 100}%` }}
                        transition={{ ease: "easeInOut", duration: 0.5 }}
                        style={{ background: "var(--neon-green)" }}
                    />
                    <motion.div
                        animate={{ width: `${probB * 100}%` }}
                        transition={{ ease: "easeInOut", duration: 0.5 }}
                        style={{ background: "var(--electric-purple)" }}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "var(--space-xs)" }}>
                    <span style={{ color: "var(--neon-green)", fontWeight: "bold" }}>{formatProb(probA)}</span>
                    <span style={{ color: "var(--electric-purple)", fontWeight: "bold" }}>{formatProb(probB)}</span>
                </div>
            </div>

            {/* Data Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)", fontSize: "0.8rem" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "var(--space-sm)", borderRadius: "var(--radius-md)" }}>
                    <div className="text-muted" style={{ fontSize: "0.7rem", marginBottom: "var(--space-xs)" }}>Moneyline</div>
                    <div style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {formatOdds(odds.agent_a.american_odds)}
                    </div>
                    <div style={{ fontSize: "0.7rem", marginTop: "var(--space-xs)" }}>
                        <span className="text-muted">Kelly:</span> <span style={{ color: "var(--arena-gold)" }}>{formatProb(odds.agent_a.suggested_kelly_fraction)}</span>
                    </div>
                </div>

                <div style={{ background: "rgba(108, 58, 237, 0.1)", padding: "var(--space-sm)", borderRadius: "var(--radius-md)" }}>
                    <div className="text-muted" style={{ fontSize: "0.7rem", marginBottom: "var(--space-xs)" }}>Moneyline</div>
                    <div style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {formatOdds(odds.agent_b.american_odds)}
                    </div>
                    <div style={{ fontSize: "0.7rem", marginTop: "var(--space-xs)" }}>
                        <span className="text-muted">Kelly:</span> <span style={{ color: "var(--arena-gold)" }}>{formatProb(odds.agent_b.suggested_kelly_fraction)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
