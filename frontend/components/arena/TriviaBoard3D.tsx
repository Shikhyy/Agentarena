"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COLORS, SHADOWS } from "@/lib/theme";

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
    const questionKey = currentQuestion
        ? `${currentQuestion.round_number}:${currentQuestion.question}`
        : "no-question";

    return (
        <TriviaBoardSession
            key={questionKey}
            scores={scores}
            currentQuestion={currentQuestion}
            agents={agents}
            currentRound={currentRound}
            totalRounds={totalRounds}
            onBuzz={onBuzz}
            thinkingAgentId={thinkingAgentId}
        />
    );
}

function TriviaBoardSession({
    scores,
    currentQuestion,
    agents,
    currentRound,
    totalRounds,
    onBuzz,
    thinkingAgentId,
}: TriviaBoardProps) {
    const [timeLeft, setTimeLeft] = useState(() => currentQuestion?.time_limit || 15);
    const [buzzerActive, setBuzzerActive] = useState(() => Boolean(currentQuestion));
    const [buzzEffect, setBuzzEffect] = useState(false);

    useEffect(() => {
        if (!currentQuestion) return;

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
        science: COLORS.tealLight,
        history: COLORS.gold,
        geography: COLORS.tealLight,
        crypto: COLORS.red,
        pop_culture: COLORS.redBright,
    };

    const difficultyLabel = ["", "Easy", "Medium", "Hard", "Expert"];
    const timePercent = currentQuestion ? (timeLeft / (currentQuestion.time_limit || 15)) * 100 : 100;

    return (
        <div
            style={{
                background: `rgba(7, 7, 31, 0.85)`,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${COLORS.border}`,
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(16px)",
            }}
        >
            {/* Neon Game Show Top Accent Bar */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${COLORS.tealLight}, ${COLORS.tealLight}, ${COLORS.gold}, ${COLORS.tealLight})`,
                    backgroundSize: "200% 100%",
                }}
            />

            {/* Round + Category Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <div>
                    <span style={{ fontSize: "0.75rem", color: COLORS.textMuted, fontFamily: "var(--font-data)" }}>
                        Round {currentRound} / {totalRounds}
                    </span>
                    {currentQuestion && (
                        <div style={{ marginTop: 2 }}>
                            <span
                                style={{
                                    fontSize: "0.6875rem",
                                    fontWeight: 700,
                                    color: categoryColors[currentQuestion.category] || COLORS.textSecondary,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                {currentQuestion.category}
                            </span>
                            <span style={{ fontSize: "0.6875rem", color: COLORS.textMuted, marginLeft: 8 }}>
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
                            animate={{ color: timeLeft <= 5 ? COLORS.red : COLORS.gold }}
                            style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}
                        >
                            {timeLeft}s
                        </motion.div>
                        <div style={{ marginTop: 4, width: 80, height: 4, background: COLORS.raised, borderRadius: 2 }}>
                            <motion.div
                                animate={{ width: `${timePercent}%` }}
                                style={{
                                    height: "100%",
                                    background: timeLeft <= 5 ? COLORS.red : COLORS.gold,
                                    borderRadius: 2,
                                    boxShadow: timeLeft <= 5 ? `0 0 8px ${COLORS.red}` : SHADOWS.gold,
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
                    marginBottom: 24,
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
                                color: COLORS.textPrimary,
                                padding: "0 20px",
                            }}
                        >
                            {currentQuestion.question}
                            {currentQuestion.buzzed_by && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        marginTop: 12,
                                        color: COLORS.tealLight,
                                        fontSize: "0.875rem",
                                        fontFamily: "var(--font-body)",
                                        textShadow: `0 0 8px ${COLORS.tealLight}`,
                                    }}
                                >
                                    ⚡ {currentQuestion.buzzed_by} buzzed in!
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: "center", color: COLORS.textMuted, fontSize: "1rem" }}
                        >
                            ⏳ Next question loading...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Buzzer Button */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
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
                            ? `radial-gradient(circle, ${COLORS.red}, #5a0011)`
                            : COLORS.raised,
                        border: `4px solid ${buzzerActive ? COLORS.red : COLORS.border}`,
                        cursor: buzzerActive ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: buzzerActive ? COLORS.textPrimary : COLORS.textMuted,
                        boxShadow: buzzerActive ? `0 0 30px ${COLORS.red}80, 0 0 60px ${COLORS.red}40` : "none",
                        transition: "all 0.2s ease",
                    }}
                >
                    {buzzerActive ? "BUZZ!" : "WAIT"}
                </motion.button>
            </div>

            {/* Score Board */}
            <div>
                <div style={{ fontSize: "0.75rem", color: COLORS.textMuted, marginBottom: 8, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Scores
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(agents.length, 3)}, 1fr)`, gap: 8 }}>
                    {agents.map((agentId) => {
                        const agentScore = scores[agentId] || 0;
                        const isThinking = thinkingAgentId === agentId;
                        const maxScore = Math.max(...Object.values(scores), 1);

                        return (
                            <div
                                key={agentId}
                                style={{
                                    textAlign: "center",
                                    padding: 10,
                                    background: isThinking ? `rgba(0, 232, 255, 0.06)` : `rgba(12, 12, 40, 0.6)`,
                                    borderRadius: 8,
                                    border: `1px solid ${isThinking ? COLORS.gold : COLORS.border}`,
                                    boxShadow: isThinking ? SHADOWS.gold : "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <div style={{ fontSize: "0.6875rem", color: COLORS.textMuted, marginBottom: 4, fontFamily: "var(--font-data)" }}>
                                    {agentId.replace("agent_", "").toUpperCase()}
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", color: COLORS.gold, fontWeight: 700, fontSize: "1.1rem", textShadow: `0 0 8px ${COLORS.gold}40` }}>
                                    {agentScore}
                                </div>
                                {/* Score bar */}
                                <div style={{ height: 3, background: COLORS.raised, borderRadius: 2, marginTop: 4 }}>
                                    <motion.div
                                        animate={{ width: `${(agentScore / maxScore) * 100}%` }}
                                        style={{ height: "100%", background: COLORS.tealLight, borderRadius: 2, boxShadow: `0 0 6px ${COLORS.tealLight}` }}
                                        transition={{ type: "spring" }}
                                    />
                                </div>
                                {isThinking && (
                                    <div style={{ fontSize: "0.5rem", color: COLORS.gold, marginTop: 2, textShadow: `0 0 4px ${COLORS.gold}` }}>🧠 ANSWERING</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
