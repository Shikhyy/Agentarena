"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWallet } from "@/lib/wallet";
import { apiGet, wsUrl } from "@/lib/api";
import GeminiLiveChat from "@/components/GeminiLiveChat";

const ChessBoard3D = dynamic(() => import("@/components/arena/ChessBoard3D"), {
    ssr: false,
    loading: () => <div style={loaderStyle}><div style={spinnerStyle} /><span style={loaderTextStyle}>INITIALIZING ENGINE</span></div>,
});
const PokerTable3D = dynamic(() => import("@/components/arena/PokerTable3D"), {
    ssr: false,
    loading: () => <div style={loaderStyle}><div style={spinnerStyle} /><span style={loaderTextStyle}>INITIALIZING ENGINE</span></div>,
});
const MonopolyZone = dynamic(() => import("@/components/world/MonopolyZone").then(m => ({ default: m.MonopolyZone })), { ssr: false });
const TriviaZone = dynamic(() => import("@/components/world/TriviaZone"), { ssr: false });
import { CommentaryRibbon } from "@/components/arena/CommentaryRibbon";

const GAME_META: Record<string, { color: string; label: string; emoji: string; gradient: string }> = {
    chess: { color: "#7B5CFA", label: "Chess", emoji: "♟", gradient: "linear-gradient(135deg, #7B5CFA, #5A3AE8)" },
    poker: { color: "#00D4FF", label: "Poker", emoji: "🃏", gradient: "linear-gradient(135deg, #00D4FF, #0099CC)" },
    monopoly: { color: "#F5C842", label: "Monopoly", emoji: "🏦", gradient: "linear-gradient(135deg, #F5C842, #E0A800)" },
    trivia: { color: "#00E887", label: "Trivia", emoji: "⚡", gradient: "linear-gradient(135deg, #00E887, #00BB66)" },
};

// ── Shared styles ──────────────────────────────────
const loaderStyle: React.CSSProperties = {
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16,
    color: "rgba(255,255,255,0.35)", background: "#030308",
};
const spinnerStyle: React.CSSProperties = {
    width: 40, height: 40,
    border: "2px solid rgba(123,92,250,0.2)", borderTopColor: "#7B5CFA",
    borderRadius: "50%", animation: "rotate 1s linear infinite",
};
const loaderTextStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.15em",
};
const glassCard: React.CSSProperties = {
    background: "rgba(10,10,20,0.75)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

export default function ArenaView() {
    const params = useParams();
    const arenaId = (params.id as string) || "test_arena_1";
    const wallet = useWallet();
    const [spectators, setSpectators] = useState("0");
    const [gameState, setGameState] = useState<any>(null);
    const [arenaInfo, setArenaInfo] = useState<any>(null);
    const [gameType, setGameType] = useState<"chess" | "poker" | "monopoly" | "trivia">("chess");
    const [commentaryStream, setCommentaryStream] = useState<string[]>([]);
    const [elapsed, setElapsed] = useState(0);
    const [betAgent, setBetAgent] = useState<"a" | "b" | null>(null);
    const [betAmount, setBetAmount] = useState(10);
    const [showBetConfirm, setShowBetConfirm] = useState(false);
    const [probA, setProbA] = useState(0.52);

    const syncOdds = (payload: any) => {
        const nextProbA = payload?.agentAProb
            ?? payload?.prob_a
            ?? payload?.agent_a?.probability
            ?? payload?.live_odds?.agent_a?.probability;

        if (typeof nextProbA === "number") {
            setProbA(nextProbA);
        }
    };

    // Fetch arena metadata
    useEffect(() => {
        apiGet("/arenas/live")
            .then((data: any) => {
                const arena = (data.arenas || []).find((a: any) => a.id === arenaId);
                if (arena) {
                    setArenaInfo(arena);
                    const gt = arena.game_type as typeof gameType;
                    if (["chess", "poker", "monopoly", "trivia"].includes(gt)) setGameType(gt);
                } else {
                    if (arenaId.includes("poker")) setGameType("poker");
                    else if (arenaId.includes("monopoly")) setGameType("monopoly");
                    else if (arenaId.includes("trivia")) setGameType("trivia");
                }
            })
            .catch(() => {
                if (arenaId.includes("poker")) setGameType("poker");
                else if (arenaId.includes("monopoly")) setGameType("monopoly");
                else if (arenaId.includes("trivia")) setGameType("trivia");
            });
    }, [arenaId]);

    // Timer
    useEffect(() => {
        const t = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // WebSocket
    useEffect(() => {
        let ws: WebSocket | null = null;
        try {
            ws = new WebSocket(wsUrl(`/arenas/${arenaId}/stream`));
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "connected") {
                        setSpectators(data.spectators?.toString() || "0");
                        syncOdds(data);
                        if (data.game_info) {
                            setGameState(data.game_info);
                            setArenaInfo((prev: any) => prev || data.game_info);
                        }
                    } else if (data.type === "game_state_update" || data.type === "engine_eval") {
                        if (data.spectators) setSpectators(data.spectators.toString());
                        if (data.state || data.moveCount != null || data.turnNumber != null) {
                            setGameState((prev: any) => ({
                                ...prev,
                                ...(data.state || {}),
                                move_count: data.moveCount ?? prev?.move_count,
                                turn_number: data.turnNumber ?? prev?.turn_number,
                                game_type: data.game_type ?? prev?.game_type,
                            }));
                        }
                        syncOdds(data);
                    } else if (data.type === "odds_update") {
                        syncOdds(data);
                    } else if (data.type === "commentary_event" && data.text) {
                        setCommentaryStream(prev => {
                            const next = [...prev, data.text];
                            return next.length > 8 ? next.slice(-8) : next;
                        });
                    }
                } catch { }
            };
            ws.onerror = () => ws?.close();
        } catch { }
        return () => { try { ws?.close(); } catch { } };
    }, [arenaId]);

    const meta = GAME_META[gameType] || GAME_META.chess;
    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    const probB = 1 - probA;
    const agentA = arenaInfo?.agent_a?.name || gameState?.agent_a?.name || "Agent A";
    const agentB = arenaInfo?.agent_b?.name || gameState?.agent_b?.name || "Agent B";
    const eloA = arenaInfo?.agent_a?.elo || gameState?.agent_a?.elo || "—";
    const eloB = arenaInfo?.agent_b?.elo || gameState?.agent_b?.elo || "—";
    const arenaBalance = parseFloat(wallet.arenaBalance || "0");

    const handleBet = async () => {
        if (!wallet.isConnected) { wallet.connect(); return; }
        setShowBetConfirm(true);
        // In production, this would call the betting smart contract
        setTimeout(() => setShowBetConfirm(false), 3000);
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh", background: "#030308", overflow: "hidden" }}>

            {/* ─── Full-screen 3D Canvas ───────────────────── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                <Suspense fallback={<div style={loaderStyle}><div style={spinnerStyle} /><span style={loaderTextStyle}>LOADING ENGINE</span></div>}>
                    {gameType === "chess" && <ChessBoard3D agentWhite={agentA} agentBlack={agentB} activeColor={gameState?.turn || "white"} fen={gameState?.fen} />}
                    {gameType === "poker" && <PokerTable3D players={gameState?.players} pot={gameState?.pot} communityCards={gameState?.community_cards} />}
                    {gameType === "trivia" && <TriviaZone gameState={gameState} />}
                    {gameType === "monopoly" && <MonopolyZone gameState={gameState} />}
                </Suspense>
            </div>

            {/* ─── UI Overlay Layer ────────────────────────── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>

                {/* ═══ TOP BAR ═══ */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    padding: "14px 20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "linear-gradient(to bottom, rgba(3,3,8,0.92), transparent)",
                    pointerEvents: "none",
                }}>
                    {/* Left: Back + Match title */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "auto" }}>
                        <Link href="/arenas" style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "0.85rem", textDecoration: "none",
                            transition: "background 0.2s",
                        }}>←</Link>
                        <div>
                            <div style={{
                                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem",
                                color: "#fff", display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <span style={{ filter: `drop-shadow(0 0 8px ${meta.color})` }}>{meta.emoji}</span>
                                {agentA} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>vs</span> {agentB}
                            </div>
                            <div style={{
                                fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                                color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2,
                            }}>
                                {meta.label.toUpperCase()} · {fmt(elapsed)} · MOVE {gameState?.move_count || 0}
                            </div>
                        </div>
                    </div>

                    {/* Right: Status chips */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
                        {/* LIVE badge */}
                        <div style={{
                            padding: "4px 12px", borderRadius: 99,
                            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: "0.6rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                            color: "#EF4444", letterSpacing: "0.12em",
                        }}>
                            <div style={{
                                width: 5, height: 5, borderRadius: "50%",
                                background: "#EF4444", boxShadow: "0 0 8px #EF4444",
                                animation: "pulse-badge 2s ease infinite",
                            }} />
                            LIVE
                        </div>
                        {/* Spectators */}
                        <div style={{
                            padding: "4px 12px", borderRadius: 99,
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                            fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)",
                            display: "flex", alignItems: "center", gap: 5,
                        }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
                            {parseInt(spectators).toLocaleString()} watching
                        </div>
                        {/* $ARENA balance */}
                        {wallet.isConnected && (
                            <div style={{
                                padding: "4px 12px", borderRadius: 99,
                                background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.2)",
                                fontSize: "0.7rem", color: "#F5C842", fontFamily: "var(--font-mono)",
                                fontWeight: 600,
                            }}>
                                💰 {arenaBalance.toFixed(0)} $ARENA
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ LEFT SIDEBAR — Agent Cards ═══ */}
                <div style={{
                    position: "absolute", top: 76, left: 16,
                    display: "flex", flexDirection: "column", gap: 8,
                    pointerEvents: "auto",
                }}>
                    {/* Agent A */}
                    <motion.div
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ ...glassCard, width: 220, padding: "14px 16px" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                background: meta.gradient,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.85rem", fontWeight: 700, color: "#fff",
                                boxShadow: `0 0 20px ${meta.color}40`,
                            }}>
                                {agentA.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem",
                                    color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>{agentA}</div>
                                <div style={{
                                    display: "flex", gap: 8, marginTop: 3,
                                    fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                                }}>
                                    <span style={{ color: meta.color }}>ELO {eloA}</span>
                                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {arenaInfo?.agent_a?.personality || "adaptive"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Win probability bar */}
                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "rgba(255,255,255,0.4)" }}>WIN PROB</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: meta.color, fontWeight: 700 }}>
                                    {(probA * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                <motion.div
                                    animate={{ width: `${probA * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    style={{ height: "100%", background: meta.color, borderRadius: 4 }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <div style={{
                        textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em",
                        padding: "2px 0",
                    }}>VS</div>

                    {/* Agent B */}
                    <motion.div
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ ...glassCard, width: 220, padding: "14px 16px" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                background: "linear-gradient(135deg, #00D4FF, #0099CC)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.85rem", fontWeight: 700, color: "#fff",
                                boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                            }}>
                                {agentB.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem",
                                    color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>{agentB}</div>
                                <div style={{
                                    display: "flex", gap: 8, marginTop: 3,
                                    fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                                }}>
                                    <span style={{ color: "#00D4FF" }}>ELO {eloB}</span>
                                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {arenaInfo?.agent_b?.personality || "adaptive"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "rgba(255,255,255,0.4)" }}>WIN PROB</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#00D4FF", fontWeight: 700 }}>
                                    {(probB * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                <motion.div
                                    animate={{ width: `${probB * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    style={{ height: "100%", background: "#00D4FF", borderRadius: 4 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ═══ RIGHT SIDEBAR — Watch & Earn Panel ═══ */}
                <motion.div
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        ...glassCard,
                        position: "absolute", top: 76, right: 16,
                        width: 260, pointerEvents: "auto",
                        padding: 0, overflow: "hidden",
                    }}
                >
                    {/* Panel Header */}
                    <div style={{
                        padding: "12px 16px",
                        background: "rgba(255,255,255,0.02)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>
                            Watch & Earn
                        </span>
                        <span style={{
                            padding: "2px 8px", borderRadius: 99, fontSize: "0.55rem", fontWeight: 700,
                            background: "rgba(123,92,250,0.12)", border: "1px solid rgba(123,92,250,0.25)",
                            color: "#A78BFA", fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
                        }}>$ARENA</span>
                    </div>

                    {/* Live Odds Bar */}
                    <div style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: meta.color }}>{agentA}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#00D4FF" }}>{agentB}</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 4, display: "flex", overflow: "hidden", gap: 1 }}>
                            <motion.div
                                animate={{ width: `${probA * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                style={{ height: "100%", background: meta.color, borderRadius: "4px 0 0 4px" }}
                            />
                            <motion.div
                                animate={{ width: `${probB * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                style={{ height: "100%", background: "#00D4FF", borderRadius: "0 4px 4px 0" }}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: meta.color, fontWeight: 700 }}>
                                {(probA * 100).toFixed(1)}%
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#00D4FF", fontWeight: 700 }}>
                                {(probB * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Moneyline Grid */}
                    <div style={{ padding: "0 16px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {[
                            { prob: probA, color: meta.color, name: "A" },
                            { prob: probB, color: "#00D4FF", name: "B" },
                        ].map(({ prob, color, name }) => {
                            const american = prob > 0.5 ? Math.round((prob / (1 - prob)) * -100) : Math.round(((1 - prob) / prob) * 100);
                            return (
                                <div key={name} style={{
                                    background: `${color}08`, borderRadius: 10,
                                    padding: "8px 10px", border: `1px solid ${color}15`,
                                }}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>MONEYLINE</div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color, fontWeight: 700 }}>
                                        {american > 0 ? `+${american}` : american}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 16px" }} />

                    {/* Bet Controls */}
                    <div style={{ padding: "14px 16px" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.08em" }}>
                            PLACE BET
                        </div>
                        {/* Agent Select */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                            <button
                                onClick={() => setBetAgent("a")}
                                style={{
                                    padding: "8px 6px", borderRadius: 10, cursor: "pointer",
                                    fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-body)",
                                    textAlign: "center", transition: "all 0.2s",
                                    background: betAgent === "a" ? `${meta.color}20` : "rgba(255,255,255,0.03)",
                                    border: betAgent === "a" ? `1px solid ${meta.color}50` : "1px solid rgba(255,255,255,0.06)",
                                    color: betAgent === "a" ? meta.color : "rgba(255,255,255,0.5)",
                                }}
                            >{agentA}</button>
                            <button
                                onClick={() => setBetAgent("b")}
                                style={{
                                    padding: "8px 6px", borderRadius: 10, cursor: "pointer",
                                    fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-body)",
                                    textAlign: "center", transition: "all 0.2s",
                                    background: betAgent === "b" ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
                                    border: betAgent === "b" ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                                    color: betAgent === "b" ? "#00D4FF" : "rgba(255,255,255,0.5)",
                                }}
                            >{agentB}</button>
                        </div>

                        {/* Amount Slider */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.35)" }}>Amount</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#F5C842", fontWeight: 600 }}>
                                    {betAmount} $ARENA
                                </span>
                            </div>
                            <input
                                type="range" min={1} max={Math.max(100, arenaBalance)} step={1}
                                value={betAmount}
                                onChange={(e) => setBetAmount(parseInt(e.target.value))}
                                style={{ width: "100%", accentColor: "#F5C842", height: 4 }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                                {[10, 25, 50, 100].map(v => (
                                    <button key={v} onClick={() => setBetAmount(v)} style={{
                                        padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                                        fontSize: "0.58rem", fontFamily: "var(--font-mono)",
                                        background: betAmount === v ? "rgba(245,200,66,0.12)" : "rgba(255,255,255,0.03)",
                                        border: betAmount === v ? "1px solid rgba(245,200,66,0.3)" : "1px solid rgba(255,255,255,0.04)",
                                        color: betAmount === v ? "#F5C842" : "rgba(255,255,255,0.4)",
                                    }}>{v}</button>
                                ))}
                            </div>
                        </div>

                        {/* Payout preview */}
                        {betAgent && (
                            <div style={{
                                padding: "8px 10px", borderRadius: 8, marginBottom: 12,
                                background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>
                                        POTENTIAL PAYOUT
                                    </span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#22C55E", fontWeight: 700 }}>
                                        {(betAmount / (betAgent === "a" ? probA : probB)).toFixed(1)} $ARENA
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* CTA Button */}
                        <button
                            onClick={handleBet}
                            disabled={!betAgent}
                            style={{
                                width: "100%", padding: "10px", borderRadius: 10, cursor: betAgent ? "pointer" : "not-allowed",
                                background: betAgent
                                    ? "linear-gradient(135deg, #7B5CFA, #5A3AE8)"
                                    : "rgba(255,255,255,0.04)",
                                border: "none", color: betAgent ? "#fff" : "rgba(255,255,255,0.25)",
                                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.8rem",
                                boxShadow: betAgent ? "0 4px 20px rgba(123,92,250,0.3)" : "none",
                                transition: "all 0.2s",
                                opacity: betAgent ? 1 : 0.5,
                            }}
                        >
                            {wallet.isConnected
                                ? (betAgent ? `Bet ${betAmount} $ARENA on ${betAgent === "a" ? agentA : agentB}` : "Select an agent")
                                : "Connect Wallet to Bet"
                            }
                        </button>

                        {/* ZK badge */}
                        <div style={{
                            textAlign: "center", marginTop: 8,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        }}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 4px #22C55E" }} />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
                                ZK-verified • Polygon
                            </span>
                        </div>

                        {/* Bet confirmation toast */}
                        <AnimatePresence>
                            {showBetConfirm && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{
                                        marginTop: 10, padding: "8px 12px", borderRadius: 8,
                                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                                        textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                                        color: "#22C55E",
                                    }}
                                >
                                    ✓ Bet placed — {betAmount} $ARENA on {betAgent === "a" ? agentA : agentB}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ═══ BOTTOM CENTER — Match Stats Row ═══ */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    style={{
                        position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)",
                        display: "flex", gap: 6, pointerEvents: "auto",
                    }}
                >
                    {[
                        { label: "MOVES", value: gameState?.move_count || "0" },
                        { label: "DURATION", value: fmt(elapsed) },
                        { label: "POOL", value: `${(betAmount * 2.4).toFixed(0)} $ARENA` },
                    ].map(({ label, value }) => (
                        <div key={label} style={{
                            ...glassCard, padding: "5px 12px", borderRadius: 8,
                        }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.45rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{label}</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#fff", fontWeight: 600, marginTop: 1 }}>{value}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ─── Gemini Live Voice (floating) ────────────── */}
            <GeminiLiveChat arenaId={arenaId} gameContext={gameState || {}} />

            {/* ─── Commentary Ribbon (bottom bar) ─────────── */}
            <CommentaryRibbon
                transcripts={commentaryStream.length > 0 ? commentaryStream : ["Gemini narrator is ready..."]}
                isActive={true}
            />
        </div>
    );
}
