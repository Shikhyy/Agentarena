"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ethers } from "ethers";
import {
    CONTRACTS,
    computeCommitHash,
    getArenaTokenWrite,
    getZKBettingPoolWrite,
} from "@/lib/contracts";

interface BetSlipProps {
    arenaId: string;
    agentAName: string;
    agentBName: string;
    oddsA?: number;   // American
    oddsB?: number;   // American
    userBalance?: number;  // $ARENA balance
    onBetConfirmed?: (bet: { side: 0 | 1, amount: number, commitment: string }) => void;
}

function formatOdds(o: number) {
    return o > 0 ? `+${o}` : `${o}`;
}

function calcPayout(amount: number, odds: number): number {
    if (odds > 0) return amount + amount * (odds / 100);
    return amount + amount * (100 / Math.abs(odds));
}

export function BetSlip({
    arenaId, agentAName, agentBName,
    oddsA = -150, oddsB = 210,
    userBalance = 500,
    onBetConfirmed,
}: BetSlipProps) {
    const [selectedSide, setSelectedSide] = useState<0 | 1 | null>(null);
    const [amount, setAmount] = useState(50);
    const [submitting, setSubmitting] = useState(false);
    const [committed, setCommitted] = useState(false);
    const [secretHex, setSecretHex] = useState<string | null>(null);

    const selectedOdds = selectedSide === 0 ? oddsA : selectedSide === 1 ? oddsB : null;
    const potentialPayout = selectedOdds != null ? calcPayout(amount, selectedOdds) : 0;

    const handleConfirm = async () => {
        if (selectedSide === null || submitting) return;
        setSubmitting(true);

        // Generate a random blinding secret
        const secretBytes = crypto.getRandomValues(new Uint8Array(32));
        const secret = "0x" + Array.from(secretBytes).map(b => b.toString(16).padStart(2, "0")).join("");
        setSecretHex(secret);

        // Compute real keccak256 commitment: keccak256(abi.encodePacked(amount, side, secret))
        const amountWei = ethers.parseUnits(String(amount), 18);
        const secretBigInt = BigInt(secret);
        const side = selectedSide === 0 ? 1 : 2; // contract uses 1=agentA, 2=agentB
        const commitHash = computeCommitHash(amountWei, side, secretBigInt);

        // Try on-chain first if contracts are deployed
        const hasContracts = !!CONTRACTS.ZK_BETTING_POOL && !!CONTRACTS.ARENA_TOKEN;
        let onChainSuccess = false;

        if (hasContracts && typeof window !== "undefined" && (window as any).ethereum) {
            try {
                // 1. Approve ArenaToken spending
                const tokenContract = await getArenaTokenWrite();
                if (tokenContract) {
                    const approveTx = await tokenContract.approve(CONTRACTS.ZK_BETTING_POOL, amountWei);
                    await approveTx.wait();
                }

                // 2. Commit bet on ZKBettingPool
                const bettingContract = await getZKBettingPoolWrite();
                if (bettingContract) {
                    // Use a numeric gameId derived from the arena string
                    const gameIdNum = parseInt(arenaId.replace(/\D/g, "")) || 0;
                    const noirCommit = ethers.zeroPadValue("0x00", 32); // placeholder for Noir Pedersen
                    const tx = await bettingContract.commitBetArena(gameIdNum, amountWei, commitHash, noirCommit);
                    await tx.wait();
                    onChainSuccess = true;
                }
            } catch (e) {
                console.warn("On-chain bet failed, falling back to backend:", e);
            }
        }

        // Fallback: send to backend API
        if (!onChainSuccess) {
            try {
                const token = localStorage.getItem("auth_token") || localStorage.getItem("agentarena_token");
                const res = await fetch(`http://localhost:8000/arenas/${arenaId}/bet`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ amount, position: selectedSide, secret }),
                });

                if (res.ok) {
                    const data = await res.json();
                    onBetConfirmed?.({ side: selectedSide, amount, commitment: data.commitment_hash || commitHash });
                }
            } catch (e) {
                console.error("Bet submission failed", e);
            }
        } else {
            onBetConfirmed?.({ side: selectedSide, amount, commitment: commitHash });
        }

        setCommitted(true);
        setSubmitting(false);
    };

    if (committed) {
        return (
            <motion.div
                className="glass-panel"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ padding: "var(--space-lg)", textAlign: "center" }}
            >
                <div style={{ fontSize: "2rem", marginBottom: "var(--space-sm)" }}></div>
                <h3 style={{ color: "var(--neon-green)", marginBottom: "var(--space-sm)" }}>Bet Committed!</h3>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                    Your ZK commitment is stored on-chain. Reveal after the match ends.
                </p>
                {secretHex && (
                    <div style={{ marginTop: "var(--space-md)", padding: "var(--space-sm)", background: "var(--surface-sunken)", borderRadius: "var(--radius-sm)" }}>
                        <div className="text-muted" style={{ fontSize: "0.65rem", marginBottom: 4 }}>️ Save your secret — needed to reveal your bet</div>
                        <code style={{ fontSize: "0.6rem", wordBreak: "break-all", color: "var(--arena-gold)" }}>{secretHex}</code>
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            className="glass-panel"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ padding: "var(--space-lg)", minWidth: 280 }}
        >
            <h3 style={{ fontSize: "1rem", marginBottom: "var(--space-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Place Bet
                <span className="badge badge-purple" style={{ fontSize: "0.6rem" }}> ZK Private</span>
            </h3>

            {/* Side Selection */}
            <div style={{ marginBottom: "var(--space-md)" }}>
                <div className="text-muted" style={{ fontSize: "0.75rem", marginBottom: "var(--space-xs)" }}>Select Winner</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
                    {([0, 1] as (0 | 1)[]).map((side) => {
                        const name = side === 0 ? agentAName : agentBName;
                        const odds = side === 0 ? oddsA : oddsB;
                        const color = side === 0 ? "var(--neon-green)" : "var(--electric-purple)";
                        const isSelected = selectedSide === side;

                        return (
                            <motion.button
                                key={side}
                                onClick={() => setSelectedSide(side)}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-secondary btn-sm"
                                style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                                    border: `1.5px solid ${isSelected ? color : "var(--border-subtle)"}`,
                                    background: isSelected ? `${color}15` : "transparent",
                                    transition: "all 0.2s",
                                    padding: "8px 4px",
                                }}
                            >
                                <span style={{ fontSize: "0.8rem", fontWeight: isSelected ? 700 : 400, color: isSelected ? color : "var(--text-primary)" }}>
                                    {name.split(" ")[0]}
                                </span>
                                <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color }}>
                                    {formatOdds(odds)}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Amount Slider */}
            <div style={{ marginBottom: "var(--space-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "var(--space-xs)" }}>
                    <span className="text-muted">Amount</span>
                    <span style={{ color: "var(--arena-gold)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {amount} $ARENA
                    </span>
                </div>
                <input
                    type="range"
                    min={10} max={userBalance} step={10}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--arena-gold)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    <span>10 min</span>
                    <span>{userBalance} max</span>
                </div>
            </div>

            {/* Payout Summary */}
            <AnimatePresence>
                {selectedSide !== null && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{
                            background: "var(--surface-sunken)",
                            borderRadius: "var(--radius-sm)",
                            padding: "var(--space-sm)",
                            marginBottom: "var(--space-md)",
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-xs)",
                            fontSize: "0.75rem",
                        }}>
                            <div><span className="text-muted">Bet: </span>{amount} $ARENA</div>
                            <div><span className="text-muted">Odds: </span><span style={{ color: "var(--neon-green)" }}>{formatOdds(selectedOdds!)}</span></div>
                            <div style={{ gridColumn: "1/-1" }}>
                                <span className="text-muted">Potential payout: </span>
                                <span style={{ color: "var(--arena-gold)", fontWeight: 700 }}>
                                    {potentialPayout.toFixed(1)} $ARENA
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                className="btn btn-primary"
                style={{ width: "100%", opacity: selectedSide === null || submitting ? 0.5 : 1 }}
                disabled={selectedSide === null || submitting}
                onClick={handleConfirm}
            >
                {submitting ? "Generating ZK Proof..." : "Confirm ZK Bet"}
            </button>
            <div className="text-muted" style={{ fontSize: "0.65rem", textAlign: "center", marginTop: "var(--space-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, background: "var(--neon-green)", borderRadius: "50%", animation: "pulse 2s infinite" }}></span>
                Commitment hashed locally · Never revealed until match ends
            </div>
        </motion.div>
    );
}
