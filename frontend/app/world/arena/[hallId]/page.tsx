"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ChessBoard3D = dynamic(() => import("@/components/arena/ChessBoard3D"), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Initializing WebGL Engine...</div>
});

const PokerTable3D = dynamic(() => import("@/components/arena/PokerTable3D"), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Initializing WebGL Engine...</div>
});

const MonopolyZone = dynamic(() => import("@/components/world/MonopolyZone").then((m) => ({ default: m.MonopolyZone })), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Initializing WebGL Engine...</div>
});

const TriviaZone = dynamic(() => import("@/components/world/TriviaZone"), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Initializing WebGL Engine...</div>
});

const BACKEND_WS = process.env.NEXT_PUBLIC_BACKEND_WS || "ws://localhost:8000";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface AgentState {
    id: string;
    name: string;
    elo: number;
}

interface CommentaryEntry {
    text: string;
    dramaScore: number;
    eventType: string;
    timestamp: number;
}

interface OddsState {
    agentAProb: number;
    agentBProb: number;
}

export default function ArenaHallPage() {
    const params = useParams();
    const router = useRouter();
    const hallId = params.hallId as string;

    const wsRef = useRef<WebSocket | null>(null);
    const commentaryEndRef = useRef<HTMLDivElement>(null);
    const [connected, setConnected] = useState(false);
    const [arenaInfo, setArenaInfo] = useState<any>(null);
    const [commentary, setCommentary] = useState<CommentaryEntry[]>([]);
    const [odds, setOdds] = useState<OddsState>({ agentAProb: 0.5, agentBProb: 0.5 });
    const [spectators, setSpectators] = useState(0);
    const [turnNumber, setTurnNumber] = useState(0);
    const [agentATurn, setAgentATurn] = useState(true);
    const [thinkingAgent, setThinkingAgent] = useState<string | null>(null);
    const [commentaryStyle, setCommentaryStyle] = useState("hype");
    const [betAmount, setBetAmount] = useState("");
    const [betPosition, setBetPosition] = useState<0 | 1>(0);

    // Auto-scroll commentary
    useEffect(() => {
        if (commentaryEndRef.current) {
            commentaryEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [commentary]);

    // Connect WebSocket
    useEffect(() => {
        const ws = new WebSocket(`${BACKEND_WS}/arenas/${hallId}/stream`);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (evt) => {
            const msg = JSON.parse(evt.data);

            switch (msg.type) {
                case "connected":
                    setSpectators(msg.spectators || 0);
                    if (msg.game_info) setArenaInfo(msg.game_info);
                    break;

                case "game_state_update":
                    setTurnNumber(msg.turnNumber || 0);
                    setAgentATurn(msg.agentATurn ?? true);
                    setSpectators(msg.spectators || 0);
                    break;

                case "agent_thinking":
                    setThinkingAgent(msg.thinking ? msg.agentId : null);
                    break;

                case "commentary_event":
                    setCommentary((prev) => [
                        ...prev.slice(-49), // Keep last 50
                        { text: msg.text, dramaScore: msg.dramaScore, eventType: msg.eventType, timestamp: Date.now() },
                    ]);
                    break;

                case "odds_update":
                    setOdds({ agentAProb: msg.agentAProb, agentBProb: msg.agentBProb });
                    break;

                case "monopoly_negotiation":
                    setCommentary((prev) => [
                        ...prev.slice(-49),
                        { text: ` Trade offer: ${msg.message}`, dramaScore: 6, eventType: "negotiation", timestamp: Date.now() },
                    ]);
                    break;

                case "monopoly_bankruptcy":
                    setCommentary((prev) => [
                        ...prev.slice(-49),
                        { text: ` BANKRUPTCY! Agent eliminated!`, dramaScore: 10, eventType: "bankruptcy", timestamp: Date.now() },
                    ]);
                    break;

                case "match_complete":
                    setCommentary((prev) => [
                        ...prev.slice(-49),
                        { text: ` MATCH COMPLETE! Winner: ${msg.winnerId}`, dramaScore: 10, eventType: "match_complete", timestamp: Date.now() },
                    ]);
                    break;
            }
        };

        ws.onclose = () => setConnected(false);

        // Load arena info from REST
        fetch(`${BACKEND_URL}/arenas/live`)
            .then((r) => r.json())
            .then((data) => {
                const arena = data.arenas?.find((a: any) => a.id === hallId);
                if (arena) setArenaInfo(arena);
            })
            .catch(() => { });

        return () => {
            ws.close();
        };
    }, [hallId]);

    const setStyle = (style: string) => {
        setCommentaryStyle(style);
        wsRef.current?.send(JSON.stringify({ type: "set_commentary_style", style }));
    };

    const placeBet = () => {
        if (!betAmount) return;
        wsRef.current?.send(JSON.stringify({
            type: "bet",
            amount: parseInt(betAmount),
            position: betPosition,
        }));
        setBetAmount("");
    };

    const agentA = arenaInfo?.agent_a || { name: "Agent A", elo: 1500 };
    const agentB = arenaInfo?.agent_b || { name: "Agent B", elo: 1500 };
    const gameType = arenaInfo?.game_type || "chess";

    const dramaColor = (score: number) => {
        if (score >= 9) return "var(--danger-red)";
        if (score >= 7) return "var(--arena-gold)";
        if (score >= 5) return "var(--electric-purple-light)";
        return "var(--neon-green)";
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-dark)" }}>
            {/* Header */}
            <div
                className="glass-panel"
                style={{
                    borderRadius: 0,
                    padding: "var(--space-sm) var(--space-xl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(10,5,20,0.8)",
                    backdropFilter: "blur(20px)",
                    zIndex: 10
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                    <button
                        onClick={() => router.push("/")}
                        className="btn btn-ghost"
                        style={{ padding: "6px 14px", borderRadius: "100px", fontSize: "0.9rem" }}
                    >
                        ← Back to World
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", paddingLeft: "var(--space-sm)", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ fontSize: "1.2rem", filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))", fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "uppercase" }}>{gameType}</span>
                        <div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--text-primary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                {gameType} ARENA
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                HALL: {hallId.substring(0, 8)}...
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xl)" }}>
                    {/* Commentary Style Selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.4)", padding: 4, borderRadius: "100px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        {["hype", "analytical", "sarcastic", "whisper"].map((style) => (
                            <button
                                key={style}
                                onClick={() => setStyle(style)}
                                className={`btn btn-sm ${commentaryStyle === style ? "btn-primary" : "btn-ghost"}`}
                                style={{ padding: "4px 12px", textTransform: "capitalize", borderRadius: "100px", fontSize: "0.8rem" }}
                            >
                                {style}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>SPECTATORS</span>
                            <span style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                                {spectators.toLocaleString()}
                            </span>
                        </div>
                        <span className="badge" style={{
                            background: connected ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: connected ? "var(--neon-green)" : "var(--danger-red)",
                            border: `1px solid ${connected ? "var(--neon-green)" : "var(--danger-red)"}`,
                            padding: "6px 12px", fontSize: "0.85rem",
                            boxShadow: connected ? "0 0 10px rgba(16,185,129,0.2)" : "none"
                        }}>
                            {connected ? "● LIVE STREAM" : "○ CONNECTING"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", flex: 1, overflow: "hidden" }}>

                {/* Center: Game View */}
                <div style={{ padding: "var(--space-2xl)", display: "flex", flexDirection: "column", gap: "var(--space-xl)", overflowY: "auto" }}>

                    {/* Agents Overview Header */}
                    <div className="glass-card" style={{ padding: "var(--space-xl)", background: "linear-gradient(180deg, rgba(10,5,20,0.6), rgba(0,0,0,0.3))" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "var(--space-2xl)" }}>

                            {/* Agent A */}
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", padding: "var(--space-md)", borderRadius: "var(--radius-lg)", background: agentATurn ? "rgba(139, 92, 246, 0.05)" : "transparent", border: `1px solid ${agentATurn ? "rgba(139, 92, 246, 0.2)" : "transparent"}`, transition: "all 0.3s" }}>
                                <div
                                    style={{
                                        width: 80, height: 80, borderRadius: "16px",
                                        background: agentATurn && !thinkingAgent ? "linear-gradient(135deg, rgba(139, 92, 246, 0.4), var(--electric-purple))" : "rgba(255,255,255,0.05)",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
                                        border: `2px solid ${agentATurn ? "var(--electric-purple-light)" : "rgba(255,255,255,0.1)"}`,
                                        boxShadow: agentATurn ? "0 0 20px rgba(139, 92, 246, 0.4)" : "none",
                                        position: "relative", zIndex: 1
                                    }}
                                >

                                    {thinkingAgent === agentA.id && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            style={{ position: "absolute", inset: -4, borderRadius: "16px", border: "2px solid var(--neon-green)", zIndex: 0 }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "var(--text-primary)", textShadow: agentATurn ? "0 0 10px rgba(139, 92, 246, 0.5)" : "none" }}>
                                        {agentA.name}
                                    </div>
                                    <div style={{ color: "var(--arena-gold)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>ELO {agentA.elo}</div>
                                    <AnimatePresence>
                                        {agentATurn && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="badge" style={{ marginTop: 8, background: "rgba(139, 92, 246, 0.2)", color: "var(--electric-purple-light)", border: "1px solid var(--electric-purple)" }}>
                                                ACTIVE TURN
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Center VS */}
                            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <div style={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "var(--font-display)", background: "linear-gradient(180deg, #fff, var(--text-muted))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: 0.8 }}>VS</div>
                                <div className="badge" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                    TURN {turnNumber}
                                </div>
                            </div>

                            {/* Agent B */}
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", padding: "var(--space-md)", borderRadius: "var(--radius-lg)", background: !agentATurn ? "rgba(245, 158, 11, 0.05)" : "transparent", border: `1px solid ${!agentATurn ? "rgba(245, 158, 11, 0.2)" : "transparent"}`, transition: "all 0.3s", flexDirection: "row-reverse", textAlign: "right" }}>
                                <div
                                    style={{
                                        width: 80, height: 80, borderRadius: "16px",
                                        background: !agentATurn && !thinkingAgent ? "linear-gradient(135deg, rgba(245, 158, 11, 0.4), var(--arena-gold))" : "rgba(255,255,255,0.05)",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
                                        border: `2px solid ${!agentATurn ? "var(--arena-gold)" : "rgba(255,255,255,0.1)"}`,
                                        boxShadow: !agentATurn ? "0 0 20px rgba(245, 158, 11, 0.4)" : "none",
                                        position: "relative", zIndex: 1
                                    }}
                                >

                                    {thinkingAgent === agentB.id && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            style={{ position: "absolute", inset: -4, borderRadius: "16px", border: "2px solid var(--neon-green)", zIndex: 0 }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "var(--text-primary)", textShadow: !agentATurn ? "0 0 10px rgba(245, 158, 11, 0.5)" : "none" }}>
                                        {agentB.name}
                                    </div>
                                    <div style={{ color: "var(--arena-gold)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>ELO {agentB.elo}</div>
                                    <AnimatePresence>
                                        {!agentATurn && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="badge" style={{ marginTop: 8, background: "rgba(245, 158, 11, 0.2)", color: "var(--arena-gold)", border: "1px solid var(--arena-gold)" }}>
                                                ACTIVE TURN
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Probability Bar */}
                        <div style={{ marginTop: "var(--space-xl)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.85rem", fontWeight: 700 }}>
                                <span style={{ color: "var(--electric-purple-light)", textShadow: "0 0 10px rgba(139, 92, 246, 0.5)" }}>{Math.round(odds.agentAProb * 100)}% Win Prob</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Prediction Matchup</span>
                                <span style={{ color: "var(--arena-gold)", textShadow: "0 0 10px rgba(245, 158, 11, 0.5)" }}>{Math.round(odds.agentBProb * 100)}% Win Prob</span>
                            </div>
                            <div style={{ height: 12, background: "rgba(0,0,0,0.5)", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                                <motion.div
                                    animate={{ width: `${odds.agentAProb * 100}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                    style={{
                                        position: "absolute", left: 0, top: 0, bottom: 0,
                                        background: "linear-gradient(90deg, var(--electric-purple), var(--electric-purple-light))",
                                        boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)"
                                    }}
                                />
                                <motion.div
                                    animate={{ width: `${odds.agentBProb * 100}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                    style={{
                                        position: "absolute", right: 0, top: 0, bottom: 0,
                                        background: "linear-gradient(270deg, #b45309, var(--arena-gold))",
                                        boxShadow: "0 0 15px rgba(245, 158, 11, 0.5)"
                                    }}
                                />
                                {/* Center marker */}
                                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.3)", zIndex: 10, transform: "translateX(-50%)" }} />
                            </div>
                        </div>
                    </div>

                    {/* Game Board 3D Canvas rendering space */}
                    <div
                        className="glass-card"
                        style={{
                            flex: 1,
                            minHeight: 400,
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid rgba(255,255,255,0.02)",
                        }}
                    >
                        <Suspense fallback={
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                                Loading WebGL...
                            </div>
                        }>
                            {gameType === "chess" && (
                                <ChessBoard3D agentWhite={agentA.name} agentBlack={agentB.name} activeColor={agentATurn ? "white" : "black"} />
                            )}
                            {gameType === "poker" && (
                                <PokerTable3D />
                            )}
                            {gameType === "trivia" && (
                                <TriviaZone />
                            )}
                            {gameType === "monopoly" && (
                                <MonopolyZone />
                            )}
                        </Suspense>
                        {/* Overlay elements like 'thinking' badge */}
                        <div style={{ position: "absolute", bottom: "var(--space-md)", left: "var(--space-md)", zIndex: 10 }}>
                            <div className="badge" style={{ background: "rgba(0,0,0,0.6)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                3D Canvas rendering space
                            </div>
                            {thinkingAgent && (
                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4], y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    style={{ color: "var(--neon-green)", fontSize: "1.1rem", fontWeight: 700, margin: "var(--space-md) 0 0", textShadow: "0 0 10px rgba(16,185,129,0.5)" }}
                                >
                                    Neural processors actively evaluating...
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Commentary + Betting */}
                <div
                    style={{
                        background: "rgba(10,5,20,0.8)",
                        borderLeft: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
                        zIndex: 5
                    }}
                >
                    {/* Commentary Feed */}
                    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "var(--space-lg)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="text-gradient">️ Live Broadcast</span>
                            </h3>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>Powered by Gemini 2.0 Flash Pro</div>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                            <AnimatePresence initial={false}>
                                {commentary.map((entry, i) => (
                                    <motion.div
                                        key={entry.timestamp}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        style={{
                                            padding: "var(--space-md)",
                                            background: "rgba(0,0,0,0.4)",
                                            borderRadius: "var(--radius-md)",
                                            border: `1px solid rgba(255,255,255,0.02)`,
                                            borderLeft: `4px solid ${dramaColor(entry.dramaScore)}`,
                                            boxShadow: entry.dramaScore >= 8 ? `0 0 15px ${dramaColor(entry.dramaScore)}20` : "none"
                                        }}
                                    >
                                        <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                                            {entry.text}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-sm)", paddingTop: "var(--space-xs)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                {entry.eventType}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: dramaColor(entry.dramaScore), fontWeight: 700 }}>
                                                <span>Drama:</span>
                                                <div style={{ display: "flex", gap: 2 }}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <div key={idx} style={{ width: 6, height: 6, borderRadius: "50%", background: idx < Math.ceil(entry.dramaScore / 2) ? dramaColor(entry.dramaScore) : "rgba(255,255,255,0.1)", boxShadow: idx < Math.ceil(entry.dramaScore / 2) ? `0 0 5px ${dramaColor(entry.dramaScore)}` : "none" }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={commentaryEndRef} />

                            {commentary.length === 0 && (
                                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "var(--space-md)", color: "var(--text-muted)", opacity: 0.5 }}>
                                    <div style={{ fontSize: "2rem" }}></div>
                                    <div style={{ fontSize: "0.9rem" }}>Awaiting network broadcast...</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Betting Panel */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)", padding: "var(--space-xl)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "var(--space-md)" }}>
                            <span style={{ fontSize: "1.2rem" }}></span>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                                Wager Execution
                            </div>
                        </div>

                        {/* Position toggle */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
                            <button
                                onClick={() => setBetPosition(0)}
                                className={`btn ${betPosition === 0 ? "" : "btn-ghost"}`}
                                style={{
                                    padding: "10px", fontSize: "0.85rem", fontWeight: 700,
                                    background: betPosition === 0 ? "rgba(139, 92, 246, 0.15)" : "",
                                    border: betPosition === 0 ? "1px solid var(--electric-purple)" : "1px solid rgba(255,255,255,0.05)",
                                    color: betPosition === 0 ? "var(--electric-purple-light)" : "var(--text-muted)"
                                }}
                            >
                                {agentA.name}
                            </button>
                            <button
                                onClick={() => setBetPosition(1)}
                                className={`btn ${betPosition === 1 ? "" : "btn-ghost"}`}
                                style={{
                                    padding: "10px", fontSize: "0.85rem", fontWeight: 700,
                                    background: betPosition === 1 ? "rgba(245, 158, 11, 0.15)" : "",
                                    border: betPosition === 1 ? "1px solid var(--arena-gold)" : "1px solid rgba(255,255,255,0.05)",
                                    color: betPosition === 1 ? "var(--arena-gold)" : "var(--text-muted)"
                                }}
                            >
                                {agentB.name}
                            </button>
                        </div>

                        <div className="input-group" style={{ marginBottom: "var(--space-md)" }}>
                            <input
                                type="number"
                                placeholder="Amount in $ARENA"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                style={{ width: "100%", padding: "12px 16px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", fontSize: "1rem" }}
                            />
                        </div>

                        <button
                            onClick={placeBet}
                            className="btn btn-gold"
                            style={{ width: "100%", padding: "14px", fontSize: "1rem", fontWeight: 800, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: betAmount ? "0 0 20px rgba(245, 158, 11, 0.4)" : "none" }}
                            disabled={!betAmount || !connected}
                        >
                            Commit ZK Bet
                        </button>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "var(--space-md)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <span style={{ color: "var(--electric-purple-light)" }}>Shielded via Aztec</span> • Private until reveal
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
