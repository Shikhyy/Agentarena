"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_WS = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:8000";

interface Message {
    role: "user" | "narrator";
    text: string;
    timestamp: number;
}

interface GeminiLiveChatProps {
    arenaId: string;
    gameContext?: Record<string, unknown>;
}

export default function GeminiLiveChat({ arenaId, gameContext }: GeminiLiveChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isGeminiActive, setIsGeminiActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isNarratorSpeaking, setIsNarratorSpeaking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [streamingText, setStreamingText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecordRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingText]);

    // Connect WebSocket when panel opens
    useEffect(() => {
        if (!isOpen) return;

        const ws = new WebSocket(`${BACKEND_WS}/ws/narrator-voice/${arenaId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setError(null);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                handleServerMessage(msg);
            } catch (_) { }
        };

        ws.onerror = () => {
            setError("Connection error. Is the backend running?");
            setIsConnected(false);
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, arenaId]);

    const handleServerMessage = useCallback((msg: Record<string, unknown>) => {
        switch (msg.type) {
            case "voice_ready":
                setIsGeminiActive(!(msg as any).text_only);
                addMessage("narrator", `🎙️ ${msg.message as string || "Gemini narrator connected!"}`);
                break;

            case "narrator_text":
                setIsNarratorSpeaking(false);
                setStreamingText("");
                addMessage("narrator", msg.text as string);
                break;

            case "narrator_audio":
                setIsNarratorSpeaking(false);
                // Decode and play audio bytes
                playAudioBytes(msg.data as string);
                break;

            case "voice_error":
                setError(msg.message as string);
                setIsNarratorSpeaking(false);
                break;

            case "pong":
                break;
        }
    }, []);

    const addMessage = (role: "user" | "narrator", text: string) => {
        setMessages((prev) => [...prev, { role, text, timestamp: Date.now() }]);
    };

    const playAudioBytes = async (base64Data: string) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }
            const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
            const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
        } catch (_) { }
    };

    const sendText = () => {
        if (!inputText.trim() || !wsRef.current) return;
        const text = inputText.trim();
        addMessage("user", text);
        setInputText("");
        setIsNarratorSpeaking(true);

        wsRef.current.send(
            JSON.stringify({ type: "text_input", text, context: gameContext || {} })
        );
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecordRef.current?.stop();
            setIsRecording(false);
            setIsNarratorSpeaking(true);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecordRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = (reader.result as string).split(",")[1];
                        wsRef.current?.send(JSON.stringify({ type: "audio_chunk", data: base64 }));
                    };
                    reader.readAsDataURL(e.data);
                }
            };

            recorder.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
            };

            recorder.start(250); // 250ms chunks
            setIsRecording(true);
            addMessage("user", "🎤 [Voice message]");
        } catch (_) {
            setError("Microphone access denied.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendText();
        }
    };

    return (
        <>
            {/* Floating trigger button */}
            <motion.button
                id="gemini-narrator-btn"
                onClick={() => setIsOpen((o) => !o)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: "fixed",
                    bottom: 28,
                    right: 28,
                    zIndex: 1000,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background: isOpen
                        ? "linear-gradient(135deg, #8b3fe8, #5e27a0)"
                        : "linear-gradient(135deg, #6d28d9, #4c1d95)",
                    boxShadow: isOpen
                        ? "0 0 30px rgba(139, 63, 232, 0.7), 0 4px 20px rgba(0,0,0,0.4)"
                        : "0 0 20px rgba(109, 40, 217, 0.4), 0 4px 20px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    transition: "background 0.3s ease",
                }}
                aria-label="Talk to the Arena Narrator"
                title="Talk to Gemini Narrator"
            >
                {isOpen ? "✕" : "🎙️"}
                {isConnected && (
                    <span
                        style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#22c55e",
                            boxShadow: "0 0 6px #22c55e",
                        }}
                    />
                )}
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="gemini-live-chat-panel"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        style={{
                            position: "fixed",
                            bottom: 100,
                            right: 28,
                            zIndex: 999,
                            width: 380,
                            maxHeight: 520,
                            borderRadius: 20,
                            background: "rgba(15, 10, 30, 0.95)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(139, 63, 232, 0.3)",
                            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(139, 63, 232, 0.15)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: "16px 20px",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "rgba(139, 63, 232, 0.08)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: "1.4rem" }}>🎙️</span>
                                <div>
                                    <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.2 }}>
                                        Arena Narrator
                                    </div>
                                    <div style={{ color: isGeminiActive ? "#a78bfa" : "#64748b", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                                        {isGeminiActive ? "✦ GEMINI LIVE" : isConnected ? "TEXT MODE" : "CONNECTING..."}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {isNarratorSpeaking && (
                                    <Waveform />
                                )}
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: isConnected ? "#22c55e" : "#ef4444",
                                        boxShadow: `0 0 6px ${isConnected ? "#22c55e" : "#ef4444"}`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "16px 16px 8px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                scrollbarWidth: "none",
                            }}
                        >
                            {messages.length === 0 && (
                                <div
                                    style={{
                                        textAlign: "center",
                                        color: "#64748b",
                                        fontSize: "0.85rem",
                                        marginTop: 20,
                                        lineHeight: 1.8,
                                    }}
                                >
                                    💬 Ask the narrator about the match!<br />
                                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                        "What just happened?" · "Analyze this move" · "Who's winning?"
                                    </span>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: "flex",
                                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: "82%",
                                            padding: "10px 14px",
                                            borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                            background:
                                                msg.role === "user"
                                                    ? "linear-gradient(135deg, #6d28d9, #4c1d95)"
                                                    : "rgba(255,255,255,0.06)",
                                            border: msg.role === "narrator" ? "1px solid rgba(255,255,255,0.08)" : "none",
                                            color: "#e2e8f0",
                                            fontSize: "0.875rem",
                                            lineHeight: 1.6,
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Streaming indicator */}
                            {isNarratorSpeaking && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                                >
                                    <ThinkingDots />
                                </motion.div>
                            )}

                            {error && (
                                <div
                                    style={{
                                        color: "#ef4444",
                                        fontSize: "0.8rem",
                                        textAlign: "center",
                                        padding: "8px",
                                        background: "rgba(239, 68, 68, 0.08)",
                                        borderRadius: 8,
                                    }}
                                >
                                    ⚠️ {error}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div
                            style={{
                                padding: "12px 14px",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                                display: "flex",
                                gap: 8,
                                alignItems: "flex-end",
                                background: "rgba(0,0,0,0.2)",
                            }}
                        >
                            <textarea
                                id="narrator-text-input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask the narrator..."
                                rows={1}
                                style={{
                                    flex: 1,
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 12,
                                    color: "#e2e8f0",
                                    fontSize: "0.875rem",
                                    padding: "10px 14px",
                                    resize: "none",
                                    outline: "none",
                                    fontFamily: "inherit",
                                    lineHeight: 1.5,
                                }}
                            />

                            {/* Mic button */}
                            <motion.button
                                id="narrator-mic-btn"
                                onClick={toggleRecording}
                                whileTap={{ scale: 0.9 }}
                                disabled={!isConnected}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border: "none",
                                    cursor: isConnected ? "pointer" : "not-allowed",
                                    background: isRecording
                                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                        : "rgba(255,255,255,0.08)",
                                    color: "#e2e8f0",
                                    fontSize: "1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    boxShadow: isRecording ? "0 0 16px rgba(239,68,68,0.6)" : "none",
                                    transition: "all 0.2s ease",
                                }}
                                aria-label={isRecording ? "Stop recording" : "Start voice input"}
                            >
                                {isRecording ? "⏹" : "🎤"}
                            </motion.button>

                            {/* Send button */}
                            <motion.button
                                id="narrator-send-btn"
                                onClick={sendText}
                                whileTap={{ scale: 0.9 }}
                                disabled={!inputText.trim() || !isConnected}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border: "none",
                                    cursor: inputText.trim() && isConnected ? "pointer" : "not-allowed",
                                    background:
                                        inputText.trim() && isConnected
                                            ? "linear-gradient(135deg, #8b3fe8, #6d28d9)"
                                            : "rgba(255,255,255,0.05)",
                                    color: "#e2e8f0",
                                    fontSize: "1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    transition: "all 0.2s ease",
                                }}
                                aria-label="Send message"
                            >
                                ↑
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function Waveform() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 3].map((h, i) => (
                <motion.div
                    key={i}
                    animate={{ scaleY: [1, h, 1] }}
                    transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                    style={{
                        width: 3,
                        height: 14,
                        borderRadius: 2,
                        background: "#8b3fe8",
                        transformOrigin: "center",
                    }}
                />
            ))}
        </div>
    );
}

function ThinkingDots() {
    return (
        <div
            style={{
                padding: "10px 14px",
                borderRadius: "18px 18px 18px 4px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                gap: 4,
                alignItems: "center",
            }}
        >
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b3fe8" }}
                />
            ))}
        </div>
    );
}
