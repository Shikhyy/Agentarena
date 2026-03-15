"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COLORS, SHADOWS } from "@/lib/theme";

export interface TradeOffer {
    id: string;
    from: string;
    to: string;
    offerProperties: string[];
    offerCash: number;
    requestProperties: string[];
    requestCash: number;
    message: string;
    timestamp: number;
    status: "pending" | "accepted" | "rejected";
}

interface NegotiationPanelProps {
    negotiations: TradeOffer[];
    myAgentId: string;
    onAccept?: (offer: TradeOffer) => void;
    onReject?: (offer: TradeOffer) => void;
    onCounterOffer?: (offer: TradeOffer) => void;
}

export function NegotiationPanel({
    negotiations,
    myAgentId,
    onAccept,
    onReject,
    onCounterOffer,
}: NegotiationPanelProps) {
    const [expanded, setExpanded] = useState(true);

    const pending = negotiations.filter((n) => n.status === "pending");
    const recent = negotiations.filter((n) => n.status !== "pending").slice(0, 3);

    return (
        <div
            style={{
                background: `rgba(12, 12, 40, 0.85)`,
                backdropFilter: "blur(16px)",
                borderRadius: 12,
                padding: 16,
                border: `1px solid rgba(255, 190, 0, 0.25)`,
                boxShadow: SHADOWS.gold,
                maxWidth: 360,
                width: "100%",
            }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded((e) => !e)}
                style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: expanded ? 16 : 0,
                }}
            >
                <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontSize: "1.1rem" }}>🤝</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: COLORS.textPrimary }}>
                        Negotiations
                    </span>
                    {pending.length > 0 && (
                        <span
                            style={{
                                background: COLORS.red,
                                color: COLORS.textPrimary,
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                boxShadow: `0 0 8px ${COLORS.red}60`,
                            }}
                        >
                            {pending.length}
                        </span>
                    )}
                </div>
                <span style={{ color: COLORS.textMuted }}>{expanded ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {/* Pending offers */}
                        {pending.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: "0.6875rem", color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-data)" }}>
                                    Pending Offers
                                </div>
                                {pending.map((offer) => (
                                    <motion.div
                                        key={offer.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            background: `rgba(255, 190, 0, 0.05)`,
                                            border: `1px solid rgba(255, 190, 0, 0.2)`,
                                            borderRadius: 8,
                                            padding: "10px 14px",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: COLORS.gold, textShadow: `0 0 6px ${COLORS.gold}40` }}>
                                                {offer.from} → {offer.to === myAgentId ? "You" : offer.to}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: "0.75rem", color: COLORS.textSecondary, marginBottom: 8, fontStyle: "italic" }}>
                                            &ldquo;{offer.message}&rdquo;
                                        </div>

                                        {/* Trade details */}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 8 }}>
                                            <div style={{ fontSize: "0.6875rem" }}>
                                                <div style={{ color: COLORS.tealLight, marginBottom: 2 }}>Offers:</div>
                                                {offer.offerProperties.map((p) => (
                                                    <div key={p} style={{ color: COLORS.textSecondary }}>📋 {p}</div>
                                                ))}
                                                {offer.offerCash > 0 && <div style={{ color: COLORS.gold }}>💰 ${offer.offerCash}</div>}
                                            </div>
                                            <div style={{ color: COLORS.textMuted, fontSize: "1rem" }}>⇄</div>
                                            <div style={{ fontSize: "0.6875rem" }}>
                                                <div style={{ color: COLORS.red, marginBottom: 2 }}>Wants:</div>
                                                {offer.requestProperties.map((p) => (
                                                    <div key={p} style={{ color: COLORS.textSecondary }}>📋 {p}</div>
                                                ))}
                                                {offer.requestCash > 0 && <div style={{ color: COLORS.gold }}>💰 ${offer.requestCash}</div>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {offer.to === myAgentId && (
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                                <button
                                                    onClick={() => onAccept?.(offer)}
                                                    style={{
                                                        background: `rgba(0, 255, 176, 0.12)`,
                                                        border: `1px solid ${COLORS.tealLight}`,
                                                        color: COLORS.tealLight,
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        padding: "6px 12px",
                                                        borderRadius: 6,
                                                        cursor: "pointer",
                                                        transition: "all 0.15s ease",
                                                    }}
                                                >
                                                    ✓ Accept
                                                </button>
                                                <button
                                                    onClick={() => onReject?.(offer)}
                                                    style={{
                                                        background: `rgba(255, 34, 68, 0.12)`,
                                                        border: `1px solid ${COLORS.red}`,
                                                        color: COLORS.red,
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        padding: "6px 12px",
                                                        borderRadius: 6,
                                                        cursor: "pointer",
                                                        transition: "all 0.15s ease",
                                                    }}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Recent resolved */}
                        {recent.length > 0 && (
                            <div>
                                <div style={{ fontSize: "0.6875rem", color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-data)" }}>
                                    Recent
                                </div>
                                {recent.map((offer) => (
                                    <div
                                        key={offer.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "6px 10px",
                                            borderRadius: 6,
                                            background: `rgba(12, 12, 40, 0.6)`,
                                            border: `1px solid ${COLORS.border}`,
                                            marginBottom: 4,
                                            fontSize: "0.6875rem",
                                        }}
                                    >
                                        <span style={{ color: COLORS.textMuted }}>
                                            {offer.from} ⇄ {offer.to}
                                        </span>
                                        <span
                                            style={{
                                                color: offer.status === "accepted" ? COLORS.tealLight : COLORS.red,
                                                fontWeight: 700,
                                                textShadow: offer.status === "accepted" ? `0 0 4px ${COLORS.tealLight}` : `0 0 4px ${COLORS.red}`,
                                            }}
                                        >
                                            {offer.status === "accepted" ? "✓ DEAL" : "✗ REJECTED"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {pending.length === 0 && recent.length === 0 && (
                            <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: "0.875rem", padding: 20 }}>
                                No active negotiations
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
