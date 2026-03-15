"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBettingStore } from "@/lib/stores";

interface ZKBetFlowProps {
    arenaId: string;
    agentAName: string;
    agentBName: string;
    agentAProb: number;
    agentBProb: number;
    onClose?: () => void;
}

type FlowStep = "input" | "committing" | "committed" | "revealing" | "settled";

export function ZKBetFlow({ arenaId, agentAName, agentBName, agentAProb, agentBProb, onClose }: ZKBetFlowProps) {
    const { commitBet, revealBet, activeBets, balance } = useBettingStore();

    const [step, setStep] = useState<FlowStep>("input");
    const [amount, setAmount] = useState("");
    const [position, setPosition] = useState<0 | 1>(0);
    const [secret, setSecret] = useState(() => Math.random().toString(36).substring(2, 18));
    const [commitment, setCommitment] = useState<any>(null);
    const [error, setError] = useState("");

    const activeBetForArena = activeBets.find((b) => b.arenaId === arenaId && !b.revealed);

    const handleCommit = async () => {
        if (!amount || parseInt(amount) <= 0) {
            setError("Enter a valid amount");
            return;
        }
        if (parseInt(amount) > balance) {
            setError("Insufficient $ARENA balance");
            return;
        }
        setError("");
        setStep("committing");
        try {
            const bet = await commitBet(arenaId, parseInt(amount), position, secret);
            setCommitment(bet);
            setStep("committed");
        } catch (e) {
            setError("Failed to commit bet. Try again.");
            setStep("input");
        }
    };

    const handleReveal = async () => {
        if (!commitment && !activeBetForArena) return;
        const betToReveal = commitment || activeBetForArena;
        setStep("revealing");
        try {
            await revealBet(arenaId, betToReveal);
            setStep("settled");
        } catch (e) {
            setError("Failed to reveal bet.");
            setStep("committed");
        }
    };

    return (
        <div
            className="glass-card"
            style={{
                padding: "var(--space-xl)",
                maxWidth: 420,
                width: "100%",
                border: "1px solid var(--electric-purple)",
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-lg)" }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem", margin: 0 }}> ZK Private Bet</h3>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Aztec Network • Commit → Reveal
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: "4px 10px" }}>
                        
                    </button>
                )}
            </div>

            {/* Balance */}
            <div
                className="glass-card"
                style={{ padding: "var(--space-sm) var(--space-md)", marginBottom: "var(--space-lg)", display: "flex", justifyContent: "space-between" }}
            >
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Your Balance</span>
                <span style={{ fontFamily: "var(--font-display)", color: "var(--arena-gold)", fontWeight: 700 }}>
                    {balance.toLocaleString()} $ARENA
                </span>
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Input */}
                {step === "input" && (
                    <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        {/* Position Select */}
                        <div style={{ marginBottom: "var(--space-md)" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                                Betting on:
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <button
                                    onClick={() => setPosition(0)}
                                    className={`btn ${position === 0 ? "btn-primary" : "btn-secondary"}`}
                                    style={{ fontSize: "0.875rem", padding: "8px 4px" }}
                                >
                                     {agentAName}
                                    <div style={{ fontSize: "0.625rem", marginTop: 2, opacity: 0.8 }}>
                                        {Math.round(agentAProb * 100)}% win
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPosition(1)}
                                    className={`btn ${position === 1 ? "btn-gold" : "btn-secondary"}`}
                                    style={{ fontSize: "0.875rem", padding: "8px 4px" }}
                                >
                                     {agentBName}
                                    <div style={{ fontSize: "0.625rem", marginTop: 2, opacity: 0.8 }}>
                                        {Math.round(agentBProb * 100)}% win
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Amount */}
                        <div style={{ marginBottom: "var(--space-md)" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                                Amount ($ARENA)
                            </label>
                            <input
                                type="number"
                                className="input"
                                placeholder="e.g. 100"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ width: "100%" }}
                                min="1"
                            />
                        </div>

                        {/* Secret (auto-generated) */}
                        <div style={{ marginBottom: "var(--space-md)" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                                Blinding Secret (auto-generated)
                            </label>
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.6875rem",
                                    color: "var(--neon-green)",
                                    background: "rgba(0,0,0,0.3)",
                                    padding: "8px 12px",
                                    borderRadius: "var(--radius-sm)",
                                    wordBreak: "break-all",
                                }}
                            >
                                {secret}
                            </div>
                            <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", marginTop: 4 }}>
                                Save this! You&apos;ll need it to reveal your bet.
                            </div>
                        </div>

                        {error && (
                            <div style={{ color: "var(--danger-red)", fontSize: "0.8125rem", marginBottom: "var(--space-sm)" }}>
                                ️ {error}
                            </div>
                        )}

                        <button onClick={handleCommit} className="btn btn-primary" style={{ width: "100%" }}>
                             Commit Bet (ZK Hash)
                        </button>

                        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
                            Your bet amount and position stay private until the match ends.
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Committing */}
                {step === "committing" && (
                    <motion.div
                        key="committing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: "center", padding: "var(--space-xl)" }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            style={{ fontSize: "2rem", display: "inline-block", marginBottom: "var(--space-md)" }}
                        >
                            ️
                        </motion.div>
                        <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>
                            Generating Pedersen Hash...
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Aztec ZK proof generation in progress
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Committed */}
                {step === "committed" && commitment && (
                    <motion.div key="committed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div
                            style={{
                                background: "rgba(16, 255, 140, 0.1)",
                                border: "1px solid var(--neon-green)",
                                borderRadius: "var(--radius-sm)",
                                padding: "var(--space-md)",
                                marginBottom: "var(--space-lg)",
                            }}
                        >
                            <div style={{ color: "var(--neon-green)", fontWeight: 700, marginBottom: 8 }}>
                                 Bet Committed!
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>
                                Commitment Hash:
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.625rem",
                                    color: "var(--text-secondary)",
                                    wordBreak: "break-all",
                                }}
                            >
                                {commitment.commitmentHash}
                            </div>
                            <div style={{ marginTop: 8, fontSize: "0.75rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Amount: </span>
                                <span style={{ color: "var(--arena-gold)", fontWeight: 700 }}>{commitment.amount} $ARENA</span>
                                <span style={{ color: "var(--text-muted)" }}> on </span>
                                <span style={{ color: "var(--electric-purple-light)" }}>
                                    {commitment.position === 0 ? agentAName : agentBName}
                                </span>
                            </div>
                        </div>

                        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "var(--space-lg)", textAlign: "center" }}>
                            Wait for the match to end, then reveal your bet to claim your payout.
                        </div>

                        <button onClick={handleReveal} className="btn btn-gold" style={{ width: "100%" }}>
                             Reveal Bet (at match end)
                        </button>
                    </motion.div>
                )}

                {/* Step 4: Revealing */}
                {step === "revealing" && (
                    <motion.div
                        key="revealing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: "center", padding: "var(--space-xl)" }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            style={{ fontSize: "2rem", display: "inline-block", marginBottom: "var(--space-md)" }}
                        >
                            
                        </motion.div>
                        <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Revealing Bet...</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Verifying ZK proof on Aztec</div>
                    </motion.div>
                )}

                {/* Step 5: Settled */}
                {step === "settled" && (
                    <motion.div
                        key="settled"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: "center", padding: "var(--space-xl)" }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}></div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", marginBottom: 8 }}>
                            Bet Revealed!
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "var(--space-lg)" }}>
                            Your payout will be processed once the match is finalized.
                        </div>
                        {onClose && (
                            <button onClick={onClose} className="btn btn-secondary" style={{ width: "100%" }}>
                                Close
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
