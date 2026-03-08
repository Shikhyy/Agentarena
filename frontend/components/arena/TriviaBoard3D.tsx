"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TriviaQuestion {
    question: string;
    category: string;
    difficulty: number;
    round_number: number;
    time_limit: number;
    buzzed_by: string | null;
}

interface TriviaBoardProps {
    scores: Record<string, number>;
    currentQuestion: TriviaQuestion | null;
    agents: string[];
    currentRound: number;
    totalRounds: number;
    onBuzz?: () => void;
    thinkingAgentId?: string | null;
}

export function TriviaBoard3D({
    scores,
    currentQuestion,
    agents,
    currentRound,
    totalRounds,
    onBuzz,
    thinkingAgentId,
}: TriviaBoardProps) {
    const [timeLeft, setTimeLeft] = useState(15);
    const [buzzerActive, setBuzzerActive] = useState(false);
    const [buzzEffect, setBuzzEffect] = useState(false);

    useEffect(() => {
        if (!currentQuestion) return;
        setTimeLeft(currentQuestion.time_limit || 15);
        setBuzzerActive(true);
        setBuzzEffect(false);

        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    setBuzzerActive(false);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentQuestion]);

    const handleBuzz = () => {
        if (!buzzerActive) return;
        setBuzzEffect(true);
        setBuzzerActive(false);
        onBuzz?.();
        setTimeout(() => setBuzzEffect(false), 500);
    };

    const categoryColors: Record<string, string> = {
        science: "var(--neon-green)",
        history: "var(--arena-gold)",
        geography: "var(--electric-purple-light)",
        crypto: "var(--danger-red)",
        pop_culture: "#ff6eb4",
    };

    const difficultyLabel = ["", "Easy", "Medium", "Hard", "Expert"];
    const timePercent = currentQuestion ? (timeLeft / (currentQuestion.time_limit || 15)) * 100 : 100;

    return (
        <div
            style={{
                background: "rgba(0,0,0,0.6)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-xl)",
                border: "1px solid var(--glass-border)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Neon Game Show Background Glow */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: "linear-gradient(90deg, var(--electric-purple), var(--neon-green), var(--arena-gold), var(--electric-purple))",
                    backgroundSize: "200% 100%",
                }}
            />

            {/* Round + Category Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-lg)" }}>
                <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Round {currentRound} / {totalRounds}
                    </span>
                    {currentQuestion && (
                        <div style={{ marginTop: 2 }}>
                            <span
                                style={{
                                    fontSize: "0.6875rem",
                                    fontWeight: 700,
                                    color: categoryColors[currentQuestion.category] || "var(--text-secondary)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                {currentQuestion.category}
                            </span>
                            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginLeft: 8 }}>
                                {difficultyLabel[currentQuestion.difficulty]} •{" "}
                                {currentQuestion.difficulty * 100} pts
                            </span>
                        </div>
                    )}
                </div>

                {/* Timer */}
                {currentQuestion && (
                    <div style={{ textAlign: "right" }}>
                        <motion.div
                            animate={{ color: timeLeft <= 5 ? "var(--danger-red)" : "var(--arena-gold)" }}
                            style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}
                        >
                            {timeLeft}s
                        </motion.div>
                        <div style={{ marginTop: 4, width: 80, height: 4, background: "var(--glass-bg)", borderRadius: 2 }}>
                            <motion.div
                                animate={{ width: `${timePercent}%` }}
                                style={{
                                    height: "100%",
                                    background: timeLeft <= 5 ? "var(--danger-red)" : "var(--arena-gold)",
                                    borderRadius: 2,
                                    transition: "width 1s linear",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Question Display */}
            <div
                style={{
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-xl)",
                }}
            >
                <AnimatePresence mode="wait">
                    {currentQuestion ? (
                        <motion.div
                            key={currentQuestion.round_number}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                textAlign: "center",
                                fontFamily: "var(--font-display)",
                                fontSize: "1.25rem",
                                lineHeight: 1.5,
                                color: "var(--text-primary)",
                                padding: "0 var(--space-lg)",
                            }}
                        >
                            {currentQuestion.question}
                            {currentQuestion.buzzed_by && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        marginTop: "var(--space-md)",
                                        color: "var(--neon-green)",
                                        fontSize: "0.875rem",
                                        fontFamily: "var(--font-body)",
                                    }}
                                >
                                     {currentQuestion.buzzed_by} buzzed in!
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "1rem" }}
                        >
                             Next question loading...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Buzzer Button */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-xl)" }}>
                <motion.button
                    onClick={handleBuzz}
                    disabled={!buzzerActive}
                    animate={buzzEffect ? { scale: [1, 1.3, 1] } : {}}
                    whileHover={buzzerActive ? { scale: 1.05 } : {}}
                    whileTap={buzzerActive ? { scale: 0.95 } : {}}
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: buzzerActive
                            ? "radial-gradient(circle, var(--danger-red), #8b0000)"
                            : "var(--glass-bg)",
                        border: `4px solid ${buzzerActive ? "var(--danger-red)" : "var(--glass-border)"}`,
                        cursor: buzzerActive ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: buzzerActive ? "white" : "var(--text-muted)",
                        boxShadow: buzzerActive ? "0 0 30px rgba(255, 82, 82, 0.6)" : "none",
                        transition: "all 0.2s ease",
                    }}
                >
                    {buzzerActive ? "BUZZ!" : "WAIT"}
                </motion.button>
            </div>

            {/* Score Board */}
            <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "var(--space-sm)", textAlign: "center" }}>
                    Scores
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(agents.length, 3)}, 1fr)`, gap: 8 }}>
                    {agents.map((agentId, i) => {
                        const agentScore = scores[agentId] || 0;
                        const isThinking = thinkingAgentId === agentId;
                        const maxScore = Math.max(...Object.values(scores), 1);

                        return (
                            <div
                                key={agentId}
                                style={{
                                    textAlign: "center",
                                    padding: "var(--space-sm)",
                                    background: "var(--glass-bg)",
                                    borderRadius: "var(--radius-sm)",
                                    border: `1px solid ${isThinking ? "var(--neon-green)" : "transparent"}`,
                                    transition: "border-color 0.2s",
                                }}
                            >
                                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: 4 }}>
                                    {agentId.replace("agent_", "").toUpperCase()}
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", color: "var(--arena-gold)", fontWeight: 700, fontSize: "1.1rem" }}>
                                    {agentScore}
                                </div>
                                {/* Score bar */}
                                <div style={{ height: 3, background: "var(--glass-bg)", borderRadius: 2, marginTop: 4 }}>
                                    <motion.div
                                        animate={{ width: `${(agentScore / maxScore) * 100}%` }}
                                        style={{ height: "100%", background: "var(--electric-purple-light)", borderRadius: 2 }}
                                        transition={{ type: "spring" }}
                                    />
                                </div>
                                {isThinking && (
                                    <div style={{ fontSize: "0.5rem", color: "var(--neon-green)", marginTop: 2 }}> ANSWERING</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
