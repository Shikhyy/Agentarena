"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@/lib/wallet";

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

export default function ProfilePage() {
    const { isConnected, address, balance, arenaBalance } = useWallet();
    const [activeTab, setActiveTab] = useState<"bets" | "agents" | "nfts">("bets");
    const maxPnl = Math.max(...PNL_DATA.map((d) => d.value));

    // Calculate dynamic stats
    const totalWinnings = isConnected ? "8,240" : "0";
    const totalBets = isConnected ? 147 : 0;
    const winRate = isConnected ? "64%" : "0%";
    const pnl = isConnected ? "+3,812" : "0";

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div style={{ padding: "var(--space-2xl) var(--space-xl)", maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-body)", minHeight: "100vh" }}>
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ marginBottom: "var(--space-2xl)", textAlign: "center" }}
            >
                <h1 style={{ fontSize: "3rem", margin: "0 0 var(--space-sm) 0", fontFamily: "var(--font-display)", fontWeight: 800 }}>
                    My <span style={{ background: "linear-gradient(135deg, var(--electric-purple-light), var(--arena-gold))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Profile</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
                    Manage your identity, track your wagers, and analyze your performance in the Arena.
                </p>
            </motion.div>

            {/* Wallet Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    padding: "clamp(20px, 4vw, 40px)",
                    marginBottom: "var(--space-xl)",
                    background: "linear-gradient(135deg, rgba(108, 58, 237, 0.1), rgba(16, 185, 129, 0.05))",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(139, 92, 246, 0.1)"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-xl)" }}>
                    <div style={{ flex: "1 1 min-content" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--electric-purple), var(--arena-gold))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                                👤
                            </div>
                            <div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                                    Connected Wallet
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", color: "white", fontWeight: 700 }}>
                                    {isConnected ? shortenAddress(address!) : "Not Connected"}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingLeft: "60px" }}>
                            {isConnected && <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", background: "rgba(108, 58, 237, 0.2)", color: "var(--electric-purple-light)", border: "1px solid rgba(108, 58, 237, 0.4)", fontWeight: 600 }}>Polygon</span>}
                            <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", background: isConnected ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", color: isConnected ? "var(--neon-green)" : "var(--danger-red)", border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`, fontWeight: 600 }}>
                                • {isConnected ? "Active" : "Offline"}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-2xl)", flexWrap: "wrap" }}>
                        <div style={{ background: "rgba(15, 10, 26, 0.6)", padding: "20px 30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>MATIC Balance</div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "white" }}>{isConnected ? balance : "0.000"}</div>
                        </div>
                        <div style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 10, 26, 0.6))", padding: "20px 30px", borderRadius: "16px", border: "1px solid rgba(245, 158, 11, 0.3)", boxShadow: "0 0 20px rgba(245, 158, 11, 0.1)" }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--arena-gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", fontWeight: 600 }}>$ARENA Balance</div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--arena-gold)", textShadow: "0 0 10px rgba(245, 158, 11, 0.4)" }}>{isConnected ? arenaBalance : "0"}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-lg)", marginBottom: "var(--space-2xl)" }}>
                {[
                    { label: "Total Winnings", value: totalWinnings, suffix: " $ARENA", color: "var(--arena-gold)", icon: "🏆" },
                    { label: "Total Bets", value: totalBets.toString(), color: "white", icon: "🎲" },
                    { label: "Win Rate", value: winRate, color: "var(--neon-green)", icon: "📈" },
                    { label: "Net P&L", value: pnl, suffix: " $ARENA", color: "var(--neon-green)", icon: "💸" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        style={{
                            padding: "24px",
                            background: "rgba(15, 10, 26, 0.6)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <div style={{ position: "absolute", top: -10, right: -10, fontSize: "4rem", opacity: 0.05 }}>{stat.icon}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <span style={{ fontSize: "1.2rem" }}>{stat.icon}</span>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{stat.label}</div>
                        </div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: stat.color, textShadow: stat.color !== "white" ? `0 0 15px ${stat.color}60` : "none" }}>
                            {stat.value}<span style={{ fontSize: "1rem", color: stat.color !== "white" ? stat.color : "var(--text-muted)", opacity: stat.color !== "white" ? 0.8 : 1 }}>{stat.suffix || ""}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts & Interactive Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-2xl)" }}>

                {/* P&L Chart */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        padding: "30px",
                        background: "rgba(15, 10, 26, 0.6)",
                        backdropFilter: "blur(12px)",
                        borderRadius: "20px",
                        border: "1px solid rgba(139, 92, 246, 0.2)"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                        <h3 style={{ margin: 0, fontSize: "1.4rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                            📊 Performance History <span style={{ fontSize: "0.8rem", padding: "4px 10px", background: "rgba(255,255,255,0.1)", borderRadius: "100px", color: "var(--text-muted)", fontWeight: 500 }}>Last 7 Days</span>
                        </h3>
                        <div style={{ color: "var(--neon-green)", fontWeight: 700, fontFamily: "var(--font-mono)", background: "rgba(16, 185, 129, 0.1)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                            +4,210 $ARENA
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-md)", height: 200, padding: "0 20px" }}>
                        {PNL_DATA.map((d, i) => (
                            <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", position: "relative" }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(5, (d.value / maxPnl) * 160)}px` }}
                                    transition={{ delay: 0.5 + i * 0.08, duration: 0.8, type: "spring", damping: 15 }}
                                    style={{
                                        width: "100%", maxWidth: "40px",
                                        borderRadius: "6px 6px 0 0",
                                        background: i === PNL_DATA.length - 1
                                            ? "linear-gradient(to top, rgba(16, 185, 129, 0.5), var(--neon-green))"
                                            : "linear-gradient(to top, rgba(139, 92, 246, 0.3), var(--electric-purple))",
                                        boxShadow: i === PNL_DATA.length - 1 ? "0 0 20px rgba(16, 185, 129, 0.4)" : "none",
                                        position: "relative"
                                    }}
                                >
                                    {i === PNL_DATA.length - 1 && (
                                        <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", background: "var(--neon-green)", color: "#000", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                                            {d.value}
                                        </div>
                                    )}
                                </motion.div>
                                <span style={{ fontSize: "0.8rem", color: i === PNL_DATA.length - 1 ? "white" : "var(--text-muted)", fontWeight: i === PNL_DATA.length - 1 ? 700 : 500 }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Tabs & Content */}
                <div>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px" }}>
                        {(["bets", "agents", "nfts"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: activeTab === tab ? "rgba(139, 92, 246, 0.15)" : "transparent",
                                    border: `1px solid ${activeTab === tab ? "var(--electric-purple)" : "transparent"}`,
                                    color: activeTab === tab ? "white" : "var(--text-secondary)",
                                    padding: "10px 24px", borderRadius: "100px", cursor: "pointer",
                                    fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "15px",
                                    transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px",
                                    boxShadow: activeTab === tab ? "0 0 15px rgba(139, 92, 246, 0.2)" : "none"
                                }}
                                onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.color = "white"; }}
                                onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.color = "var(--text-secondary)"; }}
                            >
                                {tab === "bets" ? "🎰 Bet History" : tab === "agents" ? "🤖 My Agents" : "💎 My Items"}
                            </button>
                        ))}
                    </div>

                    {/* Bet History */}
                    {activeTab === "bets" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ background: "rgba(15, 10, 26, 0.6)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}
                        >
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                                        {["Game", "Match", "Bet Amount", "Side", "Result", "Payout", "Time"].map((h) => (
                                            <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {BET_HISTORY.map((bet, i) => (
                                        <motion.tr
                                            key={bet.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                            style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", transition: "background 0.2s" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "16px 20px" }}>
                                                <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, background: bet.game === "Chess" ? "rgba(139, 92, 246, 0.15)" : "rgba(59, 130, 246, 0.15)", color: bet.game === "Chess" ? "var(--electric-purple-light)" : "#60A5FA", border: `1px solid ${bet.game === "Chess" ? "rgba(139, 92, 246, 0.3)" : "rgba(59, 130, 246, 0.3)"}` }}>{bet.game}</span>
                                            </td>
                                            <td style={{ padding: "16px 20px", fontSize: "0.95rem", fontWeight: 600, color: "white" }}>{bet.agents}</td>
                                            <td style={{ padding: "16px 20px", fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--text-secondary)" }}>{bet.bet}</td>
                                            <td style={{ padding: "16px 20px", fontWeight: 700, fontSize: "0.9rem", color: "white" }}>{bet.side}</td>
                                            <td style={{ padding: "16px 20px" }}>
                                                <span style={{ padding: "4px 8px", borderRadius: "4px", background: bet.result === "Won" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: bet.color, fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>{bet.result}</span>
                                            </td>
                                            <td style={{ padding: "16px 20px", fontFamily: "var(--font-mono)", fontWeight: 700, color: bet.color, fontSize: "0.95rem" }}>{bet.payout}</td>
                                            <td style={{ padding: "16px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{bet.time}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ padding: "16px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <button style={{ background: "transparent", border: "none", color: "var(--electric-purple-light)", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>View Full History →</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Agents Tab Placeholder */}
                    {activeTab === "agents" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            style={{ padding: "60px 20px", textAlign: "center", background: "rgba(15, 10, 26, 0.6)", borderRadius: "16px", border: "1px dashed rgba(139, 92, 246, 0.3)" }}
                        >
                            <div style={{ fontSize: "4rem", marginBottom: "16px", filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))" }}>🤖</div>
                            <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Your Agent Roster</h3>
                            <p style={{ color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                                You haven't minted any AI agents yet. Head to the Builder to create your first autonomous gladiator.
                            </p>
                            <button style={{
                                background: "linear-gradient(135deg, var(--electric-purple), var(--electric-purple-dark))",
                                border: "1px solid var(--electric-purple-light)", color: "white", padding: "12px 30px",
                                borderRadius: "8px", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)", display: "inline-flex", alignItems: "center", gap: "10px"
                            }}>
                                <span>Go to Builder</span> <span>→</span>
                            </button>
                        </motion.div>
                    )}

                    {/* NFTs Tab Placeholder */}
                    {activeTab === "nfts" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            style={{ padding: "60px 20px", textAlign: "center", background: "rgba(15, 10, 26, 0.6)", borderRadius: "16px", border: "1px dashed rgba(245, 158, 11, 0.3)" }}
                        >
                            <div style={{ fontSize: "4rem", marginBottom: "16px", filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))" }}>💎</div>
                            <h3 style={{ fontSize: "1.5rem", color: "var(--arena-gold)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Skill & Item Inventory</h3>
                            <p style={{ color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                                Your inventory is empty. Browse the marketplace for exclusive Agent traits and equipment NFTs.
                            </p>
                            <button style={{
                                background: "linear-gradient(135deg, var(--arena-gold), #b45309)",
                                border: "1px solid var(--arena-gold-light)", color: "#000", padding: "12px 30px",
                                borderRadius: "8px", fontWeight: 800, fontSize: "1rem", cursor: "pointer",
                                boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)", display: "inline-flex", alignItems: "center", gap: "10px"
                            }}>
                                <span>Browse Marketplace</span> <span>→</span>
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
