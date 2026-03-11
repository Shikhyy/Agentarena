"use client";

import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { OddsPanel } from "@/components/betting/OddsPanel";
import GeminiLiveChat from "@/components/GeminiLiveChat";
import LiveCommentaryFeed from "@/components/LiveCommentaryFeed";


const ChessBoard3D = dynamic(() => import("@/components/arena/ChessBoard3D"), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Initializing WebGL Engine...</div>
});

const PokerTable3D = dynamic(() => import("@/components/arena/PokerTable3D"), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Initializing WebGL Engine...</div>
});

const MonopolyZone = dynamic(() => import("@/components/world/MonopolyZone").then((m) => ({ default: m.MonopolyZone })), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Initializing WebGL Engine...</div>
});

const TriviaZone = dynamic(() => import("@/components/world/TriviaZone"), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Initializing WebGL Engine...</div>
});

import { CommentaryRibbon } from "@/components/arena/CommentaryRibbon";

export default function ArenaView() {
    const params = useParams();
    const [spectators, setSpectators] = useState("0");
    const [gameState, setGameState] = useState<any>(null);
    const [gameType, setGameType] = useState<"chess" | "poker" | "monopoly" | "trivia">("chess");
    const [commentaryStream, setCommentaryStream] = useState<string[]>([]);

    // Determine game type from arena id
    useEffect(() => {
        const id = params.id as string;
        if (id?.includes("poker")) setGameType("poker");
        else if (id?.includes("monopoly")) setGameType("monopoly");
        else if (id?.includes("trivia")) setGameType("trivia");
        else setGameType("chess");
    }, [params.id]);

    // WebSocket connection (safe — degrades gracefully when backend is offline)
    useEffect(() => {
        const arenaId = params.id as string || "test_arena_1";
        let ws: WebSocket | null = null;

        try {
            ws = new WebSocket(`ws://localhost:8000/arenas/${arenaId}/stream`);

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "connected") {
                        setSpectators(data.spectators?.toString() || "0");
                        if (data.game_info) {
                            setGameState(data.game_info);
                        }
                    } else if (data.type === "game_state_update") {
                        if (data.spectators) {
                            setSpectators(data.spectators.toString());
                        }
                        if (data.state) {
                            setGameState((prev: any) => ({ ...prev, ...data.state }));
                        }
                    } else if (data.type === "commentary_event" && data.text) {
                        setCommentaryStream((prev) => {
                            const newStream = [...prev, data.text];
                            // Keep max 5 lines of commentary
                            if (newStream.length > 5) return newStream.slice(newStream.length - 5);
                            return newStream;
                        });
                    }
                } catch { /* ignore malformed messages */ }
            };

            ws.onerror = () => {
                // Backend offline — use  data silently
                ws?.close();
            };
        } catch {
            // WebSocket not available
        }

        return () => {
            try { ws?.close(); } catch { /* already closed */ }
        };
    }, [params.id]);

    return (
        <div style={{ position: "relative", width: "100%", height: "calc(100vh - 80px)", background: "var(--deep-space)", overflow: "hidden" }}>

            {/* ─── 3D Canvas (fills the entire container) ─── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                <Suspense fallback={
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                        Loading WebGL...
                    </div>
                }>
                    {gameType === "chess" && (
                        <ChessBoard3D
                            agentWhite={gameState?.agent_a?.name || "White"}
                            agentBlack={gameState?.agent_b?.name || "Black"}
                            activeColor={gameState?.turn || "white"}
                            fen={gameState?.fen}
                        />
                    )}
                    {gameType === "poker" && (
                        <PokerTable3D
                            players={gameState?.players}
                            pot={gameState?.pot}
                            communityCards={gameState?.community_cards}
                        />
                    )}
                    {gameType === "trivia" && (
                        <TriviaZone gameState={gameState} />
                    )}
                    {gameType === "monopoly" && (
                        <MonopolyZone gameState={gameState} />
                    )}
                </Suspense>
            </div>

            {/* ─── All UI overlays on top (zIndex 10+) ─── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>

                {/* Top Bar */}
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    padding: "var(--space-md) var(--space-lg)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "linear-gradient(to bottom, rgba(15, 10, 26, 0.9), transparent)",
                    pointerEvents: "none"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                        <div className="badge badge-win flex gap-sm">
                            <span className="blob"></span> LIVE
                        </div>
                        <h1 style={{ fontSize: "1.25rem", margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                            Arena #{params.id}
                        </h1>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                        <a href="/world" className="btn btn-secondary btn-sm" style={{ pointerEvents: "auto", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                            Enter 3D World
                        </a>
                        <div className="glass-panel" style={{ padding: "var(--space-xs) var(--space-md)", fontSize: "0.875rem", display: "flex", gap: "var(--space-sm)", pointerEvents: "auto" }}>
                            <span className="text-muted">️ {spectators}</span>
                            <span className="text-muted">|</span>
                            <span style={{ color: "var(--arena-gold)" }}> $24.5k Pool</span>
                        </div>
                    </div>
                </div>

                {/* Left Sidebar: Agents */}
                <div style={{
                    position: "absolute",
                    top: "var(--space-md)",
                    left: "var(--space-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-md)",
                    zIndex: 10
                }}>
                    {/* Agent A */}
                    <motion.div
                        className="glass-panel"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{ padding: "var(--space-md)", width: 260, pointerEvents: "auto", borderLeft: "3px solid var(--neon-green)" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                            <div style={{ width: 60, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", background: "linear-gradient(135deg, var(--neon-green), var(--electric-purple))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>

                            </div>
                            <div>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>{gameState?.agent_a?.name || "Agent A"}</h3>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>ELO: {gameState?.agent_a?.elo || 1500}</div>
                            </div>
                        </div>
                    </motion.div>

                    <div style={{ textAlign: "center", fontWeight: "bold", color: "var(--text-muted)", fontStyle: "italic" }}>VS</div>

                    {/* Agent B */}
                    <motion.div
                        className="glass-panel"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ padding: "var(--space-md)", width: 260, pointerEvents: "auto", borderLeft: "3px solid var(--electric-purple)" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                            <div style={{ width: 60, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", background: "linear-gradient(135deg, var(--electric-purple), var(--flame-orange))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>

                            </div>
                            <div>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>{gameState?.agent_b?.name || "Agent B"}</h3>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>ELO: {gameState?.agent_b?.elo || 1500}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Sidebar: Odds & Betting */}
                <div style={{
                    position: "absolute",
                    top: "var(--space-md)",
                    right: "var(--space-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-md)",
                    zIndex: 10
                }}>
                    <OddsPanel arenaId={params.id as string || "test_arena_1"} agentAName={gameState?.agent_a?.name || "Agent A"} agentBName={gameState?.agent_b?.name || "Agent B"} />

                    <motion.div
                        className="glass-panel"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ padding: "var(--space-md)", minWidth: 280, pointerEvents: "auto" }}
                    >
                        <h3 style={{ fontSize: "1rem", marginBottom: "var(--space-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            Place Bet
                            <span className="badge badge-purple" style={{ fontSize: "0.6rem" }}>ZK Private</span>
                        </h3>

                        <div style={{ marginBottom: "var(--space-md)" }}>
                            <div className="text-muted" style={{ fontSize: "0.75rem", marginBottom: "var(--space-xs)" }}>Select Winner</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
                                <button className="btn btn-secondary btn-sm" style={{ border: "1px solid var(--neon-green)" }}>
                                    {gameState?.agent_a?.name || "Agent A"}
                                </button>
                                <button className="btn btn-secondary btn-sm" style={{ opacity: 0.5 }}>
                                    {gameState?.agent_b?.name || "Agent B"}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: "var(--space-lg)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "var(--space-xs)" }}>
                                <span className="text-muted">Amount</span>
                                <span style={{ color: "var(--arena-gold)" }}>0.00 $ARENA</span>
                            </div>
                            <input type="range" className="slider" style={{ width: "100%", accentColor: "var(--arena-gold)" }} />
                        </div>

                        <button className="btn btn-primary" style={{ width: "100%" }}>
                            Confirm ZK Bet
                        </button>
                        <div className="text-muted" style={{ fontSize: "0.65rem", textAlign: "center", marginTop: "var(--space-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            <span style={{ display: "inline-block", width: 8, height: 8, background: "var(--neon-green)", borderRadius: "50%" }}></span>
                            Noir Commitment verifying locally
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Gemini Live Commentary Feed — bottom-left overlay panel */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    position: "absolute",
                    bottom: "var(--space-3xl)",
                    left: "var(--space-md)",
                    width: 360,
                    zIndex: 20,
                    pointerEvents: "auto",
                }}
            >
                <LiveCommentaryFeed arenaId={params.id as string || "test_arena_1"} />
            </motion.div>

            {/* Gemini Live Voice — floating mic button */}
            <GeminiLiveChat
                arenaId={params.id as string || "test_arena_1"}
                gameContext={gameState || {}}
            />

            {/* Commentary Ribbon (legacy fallback) */}
            <CommentaryRibbon
                transcripts={commentaryStream.length > 0 ? commentaryStream : ["Gemini Live narrator is ready..."]}
                isActive={true}
            />
        </div>
    );
}
