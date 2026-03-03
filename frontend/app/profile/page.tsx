"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const MOCK_WALLET = {
    address: "0x7a3d...F92e",
    balance: "2.847",
    arenaBalance: "12,450",
    totalWinnings: "8,240",
    totalBets: 147,
    winRate: "64%",
    pnl: "+3,812",
};

const BET_HISTORY = [
    { id: 1, game: "Chess", agents: "ZEUS vs ATHENA", bet: "500 $ARENA", side: "ZEUS", result: "Won", payout: "+450 $ARENA", time: "2h ago", color: "var(--neon-green)" },
    { id: 2, game: "Poker", agents: "BLITZ vs SHADOW", bet: "200 $ARENA", side: "SHADOW", result: "Lost", payout: "-200 $ARENA", time: "5h ago", color: "var(--danger-red)" },
    { id: 3, game: "Chess", agents: "TITAN vs ORACLE", bet: "1,000 $ARENA", side: "TITAN", result: "Won", payout: "+890 $ARENA", time: "1d ago", color: "var(--neon-green)" },
    { id: 4, game: "Poker", agents: "NOVA vs BLITZ", bet: "300 $ARENA", side: "NOVA", result: "Won", payout: "+265 $ARENA", time: "1d ago", color: "var(--neon-green)" },
    { id: 5, game: "Chess", agents: "ATHENA vs TITAN", bet: "750 $ARENA", side: "ATHENA", result: "Lost", payout: "-750 $ARENA", time: "2d ago", color: "var(--danger-red)" },
    { id: 6, game: "Poker", agents: "SHADOW vs ORACLE", bet: "400 $ARENA", side: "ORACLE", result: "Won", payout: "+360 $ARENA", time: "3d ago", color: "var(--neon-green)" },
];

const PNL_DATA = [
    { day: "Mon", value: 2400 },
    { day: "Tue", value: 3100 },
    { day: "Wed", value: 2800 },
    { day: "Thu", value: 4200 },
    { day: "Fri", value: 3900 },
    { day: "Sat", value: 5100 },
    { day: "Sun", value: 6240 },
];

import { useWallet } from "@/lib/wallet";

export default function ProfilePage() {
    const { isConnected, address, balance, arenaBalance } = useWallet();
    const [activeTab, setActiveTab] = useState<"bets" | "agents" | "nfts">("bets");
    const maxPnl = Math.max(...PNL_DATA.map((d) => d.value));

    // Calculate dynamic stats
    const totalWinnings = isConnected ? "8,240" : "0";
    const totalBets = isConnected ? 147 : 0;
    const winRate = isConnected ? "64%" : "0%";
    const pnl = isConnected ? "+3,812" : "0";

    return (
        <div style={{ padding: "var(--space-xl) var(--space-2xl)", maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ marginBottom: "var(--space-2xl)" }}
            >
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-sm)" }}>
                    My <span className="gradient-text">Profile</span>
                </h1>
                <p className="text-muted">Manage your wallet, track bets, and view earnings.</p>
            </motion.div>

            {/* Wallet Card */}
            <motion.div
                className="glass-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    padding: "var(--space-xl)",
                    marginBottom: "var(--space-xl)",
                    background: "linear-gradient(135deg, rgba(108, 58, 237, 0.15), rgba(16, 185, 129, 0.1))",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-lg)" }}>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-xs)" }}>
                            Connected Wallet
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.125rem", color: "var(--text-primary)", marginBottom: "var(--space-md)" }}>
                            {isConnected ? address : "Not Connected"}
                        </div>
                        <div className="flex gap-md" style={{ flexWrap: "wrap" }}>
                            {isConnected && <span className="badge badge-purple">Polygon</span>}
                            <span className={`badge ${isConnected ? "badge-win" : ""}`}>{isConnected ? "Active" : "Offline"}</span>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)", textAlign: "right" }}>
                        <div>
                            <div className="stat-label">MATIC Balance</div>
                            <div className="stat-value" style={{ fontSize: "1.5rem" }}>{isConnected ? balance : "0.000"}</div>
                        </div>
                        <div>
                            <div className="stat-label">$ARENA Balance</div>
                            <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--arena-gold)" }}>{isConnected ? arenaBalance : "0"}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
                {[
                    { label: "Total Winnings", value: totalWinnings, suffix: " $ARENA", color: "var(--arena-gold)" },
                    { label: "Total Bets", value: totalBets.toString(), color: "var(--text-primary)" },
                    { label: "Win Rate", value: winRate, color: "var(--neon-green)" },
                    { label: "Net P&L", value: pnl, suffix: " $ARENA", color: "var(--neon-green)" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="glass-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        style={{ padding: "var(--space-lg)", textAlign: "center" }}
                    >
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value" style={{ fontSize: "1.5rem", color: stat.color }}>
                            {stat.value}{stat.suffix || ""}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* P&L Chart */}
            <motion.div
                className="glass-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ padding: "var(--space-xl)", marginBottom: "var(--space-xl)" }}
            >
                <h3 style={{ marginBottom: "var(--space-lg)" }}>📈 P&L Chart (7 Days)</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-sm)", height: 160 }}>
                    {PNL_DATA.map((d, i) => (
                        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-xs)" }}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.value / maxPnl) * 140}px` }}
                                transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                                style={{
                                    width: "100%",
                                    borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                                    background: `linear-gradient(to top, var(--electric-purple), ${i === PNL_DATA.length - 1 ? "var(--neon-green)" : "var(--electric-purple-light)"})`,
                                    minHeight: 4,
                                }}
                            />
                            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{d.day}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-sm" style={{ marginBottom: "var(--space-lg)" }}>
                {(["bets", "agents", "nfts"] as const).map((tab) => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? "btn-primary" : "btn-secondary"} btn-sm`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "bets" ? "🎰 Bet History" : tab === "agents" ? "🤖 My Agents" : "💎 NFTs"}
                    </button>
                ))}
            </div>

            {/* Bet History Table */}
            {activeTab === "bets" && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ overflow: "hidden" }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                {["Game", "Match", "Bet", "Side", "Result", "P&L", "Time"].map((h) => (
                                    <th key={h} style={{ padding: "var(--space-md)", textAlign: "left", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {BET_HISTORY.map((bet, i) => (
                                <motion.tr
                                    key={bet.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                                >
                                    <td style={{ padding: "var(--space-md)" }}>
                                        <span className={`badge ${bet.game === "Chess" ? "badge-purple" : "badge-win"}`}>{bet.game}</span>
                                    </td>
                                    <td style={{ padding: "var(--space-md)", fontSize: "0.875rem" }}>{bet.agents}</td>
                                    <td style={{ padding: "var(--space-md)", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>{bet.bet}</td>
                                    <td style={{ padding: "var(--space-md)", fontWeight: 600, fontSize: "0.875rem" }}>{bet.side}</td>
                                    <td style={{ padding: "var(--space-md)" }}>
                                        <span style={{ color: bet.color, fontWeight: 600, fontSize: "0.875rem" }}>{bet.result}</span>
                                    </td>
                                    <td style={{ padding: "var(--space-md)", fontFamily: "var(--font-mono)", fontWeight: 600, color: bet.color, fontSize: "0.875rem" }}>{bet.payout}</td>
                                    <td style={{ padding: "var(--space-md)", color: "var(--text-muted)", fontSize: "0.8125rem" }}>{bet.time}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Agents Tab Placeholder */}
            {activeTab === "agents" && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ padding: "var(--space-2xl)", textAlign: "center" }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>🤖</div>
                    <h3>Your Agent NFTs</h3>
                    <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                        Mint your first agent to start battling in the arena.
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: "var(--space-lg)" }}>
                        Mint Agent NFT →
                    </button>
                </motion.div>
            )}

            {/* NFTs Tab Placeholder */}
            {activeTab === "nfts" && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ padding: "var(--space-2xl)", textAlign: "center" }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>💎</div>
                    <h3>Skill NFTs</h3>
                    <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                        Purchase and equip skills to boost your agent&apos;s abilities.
                    </p>
                    <button className="btn btn-gold" style={{ marginTop: "var(--space-lg)" }}>
                        Browse Skill Shop →
                    </button>
                </motion.div>
            )}
        </div>
    );
}
