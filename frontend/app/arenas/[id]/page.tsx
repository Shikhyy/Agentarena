"use client";

import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { OddsPanel } from "@/components/betting/OddsPanel";

const ChessBoard3D = dynamic(() => import("@/components/arena/ChessBoard3D"), {
    ssr: false,
    loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Initializing WebGL Engine...</div>
});

import { AgentAvatar3D } from "@/components/arena/AgentAvatar3D";
import { CommentaryRibbon } from "@/components/arena/CommentaryRibbon";
import { ParticleEffects } from "@/components/arena/ParticleEffects";

export default function ArenaView() {
    const params = useParams();
    const [spectators, setSpectators] = useState("1.2k");
    const [gameState, setGameState] = useState<any>(null);

    // Mock WebSocket connection
    useEffect(() => {
        const arenaId = params.id as string || "test_arena_1";
        const ws = new WebSocket(`ws://localhost:8000/arenas/${arenaId}/stream`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "connected") {
                setSpectators(data.spectators.toString());
            }
        };

        return () => ws.close();
    }, [params.id]);

    return (
        <div style={{ position: "relative", width: "100%", height: "calc(100vh - 80px)", overflow: "hidden", background: "var(--deep-space)" }}>

            {/* Top Bar overlay */}
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                padding: "var(--space-md) var(--space-lg)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10,
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

                <div className="glass-panel" style={{ padding: "var(--space-xs) var(--space-md)", fontSize: "0.875rem", display: "flex", gap: "var(--space-sm)", pointerEvents: "auto" }}>
                    <span className="text-muted">👁️ {spectators}</span>
                    <span className="text-muted">|</span>
                    <span style={{ color: "var(--arena-gold)" }}>🏆 $24.5k Pool</span>
                </div>
            </div>

            {/* Main 3D Viewport */}
            <div style={{ width: "100%", height: "100%" }}>
                <Suspense fallback={<div className="flex-center h-full">Loading Engine...</div>}>
                    <ChessBoard3D />
                </Suspense>
                <ParticleEffects active={false} type="capture" position={[0, 0, 0]} />
            </div>

            {/* UI Overlays */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>

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
                            <div style={{ width: 60, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--surface-sunken)" }}>
                                <AgentAvatar3D modelUrl="/models/agent-a.glb" idleAnimation={true} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>AlphaGo Zero</h3>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>ELO: 2450</div>
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
                            <div style={{ width: 60, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--surface-sunken)" }}>
                                <AgentAvatar3D modelUrl="/models/agent-b.glb" idleAnimation={true} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>DeepBlue Next</h3>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>ELO: 2420</div>
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
                    <OddsPanel arenaId={params.id as string || "test_arena_1"} agentAName="AlphaGo Zero" agentBName="DeepBlue Next" />

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
                                    AlphaGo
                                </button>
                                <button className="btn btn-secondary btn-sm" style={{ opacity: 0.5 }}>
                                    DeepBlue
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

            {/* Commentary Ribbon */}
            <CommentaryRibbon
                transcripts={[
                    "AlphaGo opens with the Sicilian Defense, aggressive play.",
                    "DeepBlue responds quickly, analyzing 14M positions/sec.",
                    "An unexpected knight sacrifice by AlphaGo! The odds are shifting rapidly."
                ]}
                isActive={true}
            />
        </div>
    );
}
