"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const BACKEND_WS = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:8000";

interface CommentaryEntry {
    id: string;
    text: string;
    eventType: string;
    dramaScore: number;
    timestamp: number;
    isStreaming?: boolean;
    source?: "gemini" | "fallback";
}

interface LiveCommentaryFeedProps {
    arenaId: string;
    className?: string;
    /** Optionally fire a game_event message to kick off commentary */
    pendingEvent?: {
        event_type: string;
        agent_name: string;
        game_type: string;
        move_description: string;
        drama_score: number;
        context?: Record<string, unknown>;
    } | null;
}

export default function LiveCommentaryFeed({
    arenaId,
    className = "",
    pendingEvent,
}: LiveCommentaryFeedProps) {
    const [entries, setEntries] = useState<CommentaryEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isGeminiActive, setIsGeminiActive] = useState(false);
    const [currentStyle, setCurrentStyle] = useState("hype");
    const wsRef = useRef<WebSocket | null>(null);
    const streamingIdRef = useRef<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [entries]);

    useEffect(() => {
        const ws = new WebSocket(`${BACKEND_WS}/ws/live-commentary/${arenaId}`);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);

        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                handleMessage(msg);
            } catch (_) { }
        };

        return () => ws.close();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arenaId]);

    const handleMessage = useCallback((msg: Record<string, unknown>) => {
        switch (msg.type) {
            case "commentary_connected":
                setIsGeminiActive(!!(msg as any).gemini_active);
                setCurrentStyle((msg as any).current_style || "hype");
                break;

            case "commentary_token": {
                const streamId = streamingIdRef.current;
                if (!streamId) {
                    // Start new streaming entry
                    const id = `stream-${Date.now()}`;
                    streamingIdRef.current = id;
                    setEntries((prev) => [
                        ...prev,
                        {
                            id,
                            text: msg.token as string,
                            eventType: "streaming",
                            dramaScore: (msg as any).drama_score || 5,
                            timestamp: Date.now(),
                            isStreaming: true,
                        },
                    ]);
                } else {
                    // Append token to existing streaming entry
                    setEntries((prev) =>
                        prev.map((e) =>
                            e.id === streamId ? { ...e, text: e.text + (msg.token as string) } : e
                        )
                    );
                }
                break;
            }

            case "commentary_done":
                // Mark streaming entry as done
                if (streamingIdRef.current) {
                    const doneId = streamingIdRef.current;
                    setEntries((prev) =>
                        prev.map((e) =>
                            e.id === doneId
                                ? {
                                    ...e,
                                    text: msg.full_text as string,
                                    isStreaming: false,
                                    eventType: msg.event_type as string,
                                    dramaScore: (msg as any).drama_score || 5,
                                    source: "gemini",
                                }
                                : e
                        )
                    );
                    streamingIdRef.current = null;
                }
                break;

            case "style_changed":
                setCurrentStyle(msg.style as string);
                break;
        }
    }, []);

    // When parent fires a game event
    useEffect(() => {
        if (!pendingEvent || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(
            JSON.stringify({ type: "game_event", ...pendingEvent })
        );
    }, [pendingEvent]);

    const STYLES = ["hype", "analytical", "sarcastic", "whisper"];

    const setStyle = (style: string) => {
        wsRef.current?.send(JSON.stringify({ type: "set_style", style }));
    };

    const getDramaColor = (score: number) => {
        if (score >= 8) return "#ef4444";
        if (score >= 6) return "#f97316";
        if (score >= 4) return "#eab308";
        return "#64748b";
    };

    return (
        <div
            id={`live-commentary-feed-${arenaId}`}
            className={className}
            style={{
                background: "rgba(10, 6, 22, 0.9)",
                backdropFilter: "blur(16px)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.07)",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(139, 63, 232, 0.06)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: isConnected ? "#22c55e" : "#64748b",
                            boxShadow: isConnected ? "0 0 6px #22c55e" : "none",
                        }}
                    />
                    <span style={{ color: "#e2e8f0", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                        LIVE COMMENTARY
                    </span>
                    {isGeminiActive && (
                        <span
                            style={{
                                fontSize: "0.65rem",
                                color: "#a78bfa",
                                background: "rgba(139, 63, 232, 0.15)",
                                border: "1px solid rgba(139, 63, 232, 0.3)",
                                borderRadius: 20,
                                padding: "2px 8px",
                                letterSpacing: "0.05em",
                            }}
                        >
                            ✦ GEMINI
                        </span>
                    )}
                </div>

                {/* Style selector */}
                <div style={{ display: "flex", gap: 4 }}>
                    {STYLES.map((s) => (
                        <button
                            key={s}
                            id={`commentary-style-${s}`}
                            onClick={() => setStyle(s)}
                            style={{
                                padding: "3px 8px",
                                borderRadius: 6,
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                background: currentStyle === s ? "rgba(139, 63, 232, 0.4)" : "rgba(255,255,255,0.04)",
                                color: currentStyle === s ? "#a78bfa" : "#64748b",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Commentary feed */}
            <div
                style={{
                    maxHeight: 280,
                    overflowY: "auto",
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    scrollbarWidth: "none",
                }}
            >
                <AnimatePresence initial={false}>
                    {entries.length === 0 && (
                        <div style={{ color: "#475569", fontSize: "0.8rem", textAlign: "center", padding: "20px 0" }}>
                            Commentary will appear here live as the match progresses...
                        </div>
                    )}
                    {entries.map((entry) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "flex-start",
                            }}
                        >
                            {/* Drama indicator */}
                            <div
                                style={{
                                    width: 3,
                                    flexShrink: 0,
                                    alignSelf: "stretch",
                                    borderRadius: 2,
                                    background: getDramaColor(entry.dramaScore),
                                    boxShadow: entry.dramaScore >= 7 ? `0 0 8px ${getDramaColor(entry.dramaScore)}` : "none",
                                    minHeight: 20,
                                    marginTop: 3,
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <p
                                    style={{
                                        color: entry.dramaScore >= 7 ? "#f1f5f9" : "#94a3b8",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.65,
                                        margin: 0,
                                        fontWeight: entry.dramaScore >= 7 ? 500 : 400,
                                    }}
                                >
                                    {entry.text}
                                    {entry.isStreaming && <StreamingCursor />}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={endRef} />
            </div>
        </div>
    );
}

function StreamingCursor() {
    return (
        <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                background: "#4A8C86",
                marginLeft: 2,
                verticalAlign: "text-bottom",
                borderRadius: 1,
            }}
        />
    );
}
