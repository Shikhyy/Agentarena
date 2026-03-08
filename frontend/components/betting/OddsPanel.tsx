"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { CONTRACTS, getZKBettingPoolRead } from "@/lib/contracts";

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

function impliedProbToAmerican(prob: number): number {
    if (prob <= 0 || prob >= 1) return 0;
    if (prob > 0.5) {
        return Math.round((prob / (1 - prob)) * -100);
    } else {
        return Math.round(((1 - prob) / prob) * 100);
    }
}

function calculateKelly(prob: number, oddsFloat: number): number {
    // Basic Kelly criterion: f* = p - q/b
    // where b is the net fractional odds received on a win
    const q = 1 - prob;
    const b = oddsFloat <= 0 ? 0 : oddsFloat;
    let f = b > 0 ? prob - (q / b) : 0;
    // Cap at 10% to be responsible, Floor at 0.5%
    return Math.max(0.005, Math.min(0.1, f * 0.25)); // Quarter Kelly for safety
}

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
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to derive full odds state from raw implied probabilities
    const updateOddsFromProb = (probA: number) => {
        const pA = Math.max(0.01, Math.min(0.99, probA));
        const pB = 1 - pA;
        const amA = impliedProbToAmerican(pA);
        const amB = impliedProbToAmerican(pB);

        const decimalA = amA > 0 ? (amA / 100) : (100 / Math.abs(amA));
        const decimalB = amB > 0 ? (amB / 100) : (100 / Math.abs(amB));

        setOdds({
            agent_a: { probability: pA, american_odds: amA, suggested_kelly_fraction: calculateKelly(pA, decimalA) },
            agent_b: { probability: pB, american_odds: amB, suggested_kelly_fraction: calculateKelly(pB, decimalB) },
        });
    };

    useEffect(() => {
        let mounted = true;

        const fetchOnChainOdds = async () => {
            const pool = getZKBettingPoolRead();
            if (!pool) return false;

            try {
                const gameIdNum = parseInt(arenaId.replace(/\D/g, "")) || 0;
                // getGameOdds returns (totalA, totalB, impliedProbA [scaled to 1e4])
                const [totalA, totalB, probA_BPS] = await pool.getGameOdds(gameIdNum);

                // If there's volume, use the on-chain BPS probability
                if (totalA > BigInt(0) || totalB > BigInt(0)) {
                    const parsedProbA = Number(probA_BPS) / 10000;
                    if (mounted) {
                        updateOddsFromProb(parsedProbA);
                        setIsConnected(true); // Treat contract read success as "connected"
                    }
                    return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        };

        const setupLiveUpdates = async () => {
            // Priority 1: Smart Contracts (poll every 5s)
            if (CONTRACTS.ZK_BETTING_POOL) {
                const success = await fetchOnChainOdds();
                if (success) {
                    intervalRef.current = setInterval(fetchOnChainOdds, 5000);
                    return; // skip websocket if on-chain works
                }
            }

            // Priority 2: Backend REST & WebSocket (if contracts not deployed/empty)
            try {
                const res = await fetch("http://localhost:8000/arenas/live");
                if (res.ok) {
                    const data = await res.json();
                    const arena = data.arenas?.find((a: any) => a.id === arenaId);
                    if (arena?.live_odds && mounted) setOdds(arena.live_odds);
                }
            } catch { }

            try {
                const ws = new WebSocket(`ws://localhost:8000/arenas/${arenaId}/stream`);
                wsRef.current = ws;

                ws.onopen = () => { if (mounted) setIsConnected(true); };
                ws.onmessage = (event: any) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.live_odds && mounted) setOdds(msg.live_odds);
                    } catch { }
                };
                ws.onclose = () => { if (mounted) setIsConnected(false); };
            } catch { }
        };

        setupLiveUpdates();

        return () => {
            mounted = false;
            if (wsRef.current) wsRef.current.close();
            if (intervalRef.current) clearInterval(intervalRef.current);
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
