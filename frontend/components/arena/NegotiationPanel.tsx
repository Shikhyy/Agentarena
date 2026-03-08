"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
            className="glass-card"
            style={{
                padding: "var(--space-md)",
                border: "1px solid rgba(255, 200, 0, 0.3)",
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
                    marginBottom: expanded ? "var(--space-md)" : 0,
                }}
            >
                <div className="flex items-center gap-sm">
                    <span style={{ fontSize: "1.1rem" }}></span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}>
                        Negotiations
                    </span>
                    {pending.length > 0 && (
                        <span
                            style={{
                                background: "var(--danger-red)",
                                color: "white",
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.625rem",
                                fontWeight: 700,
                            }}
                        >
                            {pending.length}
                        </span>
                    )}
                </div>
                <span style={{ color: "var(--text-muted)" }}>{expanded ? "▲" : "▼"}</span>
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
                            <div style={{ marginBottom: "var(--space-md)" }}>
                                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Pending Offers
                                </div>
                                {pending.map((offer) => (
                                    <motion.div
                                        key={offer.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            background: "rgba(255, 200, 0, 0.05)",
                                            border: "1px solid rgba(255, 200, 0, 0.2)",
                                            borderRadius: "var(--radius-sm)",
                                            padding: "var(--space-sm) var(--space-md)",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--arena-gold)" }}>
                                                {offer.from} → {offer.to === myAgentId ? "You" : offer.to}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 8, fontStyle: "italic" }}>
                                            &ldquo;{offer.message}&rdquo;
                                        </div>

                                        {/* Trade details */}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 8 }}>
                                            <div style={{ fontSize: "0.6875rem" }}>
                                                <div style={{ color: "var(--neon-green)", marginBottom: 2 }}>Offers:</div>
                                                {offer.offerProperties.map((p) => (
                                                    <div key={p} style={{ color: "var(--text-secondary)" }}> {p}</div>
                                                ))}
                                                {offer.offerCash > 0 && <div style={{ color: "var(--arena-gold)" }}> ${offer.offerCash}</div>}
                                            </div>
                                            <div style={{ color: "var(--text-muted)", fontSize: "1rem" }}>⇄</div>
                                            <div style={{ fontSize: "0.6875rem" }}>
                                                <div style={{ color: "var(--danger-red)", marginBottom: 2 }}>Wants:</div>
                                                {offer.requestProperties.map((p) => (
                                                    <div key={p} style={{ color: "var(--text-secondary)" }}> {p}</div>
                                                ))}
                                                {offer.requestCash > 0 && <div style={{ color: "var(--arena-gold)" }}> ${offer.requestCash}</div>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {offer.to === myAgentId && (
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                                <button
                                                    onClick={() => onAccept?.(offer)}
                                                    className="btn btn-sm"
                                                    style={{ background: "rgba(16, 255, 140, 0.2)", border: "1px solid var(--neon-green)", color: "var(--neon-green)", fontSize: "0.75rem" }}
                                                >
                                                     Accept
                                                </button>
                                                <button
                                                    onClick={() => onReject?.(offer)}
                                                    className="btn btn-sm"
                                                    style={{ background: "rgba(255, 82, 82, 0.2)", border: "1px solid var(--danger-red)", color: "var(--danger-red)", fontSize: "0.75rem" }}
                                                >
                                                     Reject
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
                                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Recent
                                </div>
                                {recent.map((offer) => (
                                    <div
                                        key={offer.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "6px var(--space-sm)",
                                            borderRadius: "var(--radius-sm)",
                                            background: "var(--glass-bg)",
                                            marginBottom: 4,
                                            fontSize: "0.6875rem",
                                        }}
                                    >
                                        <span style={{ color: "var(--text-muted)" }}>
                                            {offer.from} ⇄ {offer.to}
                                        </span>
                                        <span
                                            style={{
                                                color: offer.status === "accepted" ? "var(--neon-green)" : "var(--danger-red)",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {offer.status === "accepted" ? " DEAL" : " REJECTED"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {pending.length === 0 && recent.length === 0 && (
                            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", padding: "var(--space-lg)" }}>
                                No active negotiations
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
