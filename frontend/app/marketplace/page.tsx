"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// PRD Skill NFT Catalogue (10 Skill NFTs)
const SKILL_NFTS = [
    { id: "bluff_master", name: "Bluff Master", description: "Opponent bluff probability detection +30%", price: 8, rarity: "Rare", game: "Poker", icon: "🃏" },
    { id: "endgame_specialist", name: "Endgame Specialist", description: "Chess endgame accuracy +25%", price: 15, rarity: "Epic", game: "Chess", icon: "♟️" },
    { id: "web_scout", name: "Web Scout", description: "Trivia search returns 10 results vs 3", price: 6, rarity: "Uncommon", game: "Trivia", icon: "🔍" },
    { id: "iron_will", name: "Iron Will", description: "Performance never degrades after consecutive losses", price: 12, rarity: "Rare", game: "All", icon: "🔥" },
    { id: "negotiator", name: "Negotiator", description: "Monopoly trade valuation depth increased", price: 10, rarity: "Rare", game: "Monopoly", icon: "🤝" },
    { id: "speed_demon", name: "Speed Demon", description: "Turn time limit reduced to 3s", price: 7, rarity: "Uncommon", game: "All", icon: "⚡" },
    { id: "coalition_breaker", name: "Coalition Breaker", description: "Detects and counters coalition patterns", price: 14, rarity: "Epic", game: "Monopoly", icon: "💥" },
    { id: "grand_strategist", name: "Grand Strategist", description: "Access to opening/endgame specialist databases", price: 20, rarity: "Legendary", game: "Chess", icon: "🏆" },
    { id: "mind_reader", name: "Mind Reader", description: "Predicts opponent's next move with 40% accuracy", price: 18, rarity: "Legendary", game: "All", icon: "🧠" },
    { id: "poker_oracle", name: "Poker Oracle", description: "AutoML Bluff Probability model access", price: 16, rarity: "Epic", game: "Poker", icon: "🔮" },
];

const rarityColors: Record<string, string> = {
    Uncommon: "var(--neon-green)",
    Rare: "var(--electric-purple-light)",
    Epic: "var(--arena-gold)",
    Legendary: "var(--danger-red)",
};

const FILTERS = ["All", "Chess", "Poker", "Monopoly", "Trivia"];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MarketplacePage() {
    const [filter, setFilter] = useState("All");
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [owned, setOwned] = useState<string[]>([]);
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const filtered = SKILL_NFTS.filter(
        (s) => filter === "All" || s.game === filter || s.game === "All"
    );

    const handlePurchase = async (skillId: string) => {
        setPurchasing(skillId);
        await new Promise((r) => setTimeout(r, 1500)); // Simulate transaction
        setOwned((prev) => [...prev, skillId]);
        setPurchasing(null);
    };

    return (
        <div className="page" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: "var(--space-3xl)" }}>
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
                <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "var(--space-xs)" }}>
                    <span style={{ filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))" }}>💎</span> Skill <span className="text-gradient">NFT Marketplace</span>
                </h1>
                <p className="text-muted" style={{ maxWidth: 700, margin: "0 auto", fontSize: "1.1rem", lineHeight: 1.6 }}>
                    Equip your agents with on-chain Skill NFTs. Each skill permanently enhances
                    your agent's capabilities. Stored on IPFS, minted on <span style={{ color: "#8247E5", fontWeight: 700 }}>Polygon zkEVM</span>.
                </p>
            </motion.div>

            {/* Filter Bar */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-2xl)" }}>
                <div style={{ display: "flex", gap: "var(--space-xs)", background: "rgba(0,0,0,0.3)", borderRadius: "100px", padding: 6, border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
                            style={{ borderRadius: "100px", padding: "8px 20px", fontSize: "0.95rem" }}
                        >
                            {f === "All" ? "🌐 All Games" : f}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "var(--space-xl)" }}>
                Showing <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{filtered.length}</span> legendary skills
            </div>

            {/* Grid */}
            <motion.div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-xl)" }}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <AnimatePresence>
                    {filtered.map((skill) => {
                        const isOwned = owned.includes(skill.id);
                        const isBuying = purchasing === skill.id;
                        const isHovered = hoveredSkill === skill.id;

                        return (
                            <motion.div
                                key={skill.id}
                                variants={itemVariants}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-card"
                                onMouseEnter={() => setHoveredSkill(skill.id)}
                                onMouseLeave={() => setHoveredSkill(null)}
                                whileHover={{ scale: 1.02 }}
                                style={{
                                    padding: "var(--space-xl)",
                                    display: "flex",
                                    flexDirection: "column",
                                    border: `1px solid ${isOwned ? "var(--neon-green)" : isHovered ? rarityColors[skill.rarity] : "rgba(255,255,255,0.05)"}`,
                                    background: isOwned ? "rgba(16,185,129,0.05)" : isHovered ? `linear-gradient(180deg, ${rarityColors[skill.rarity]}10, rgba(10,5,20,0.6))` : "rgba(10,5,20,0.4)",
                                    boxShadow: isOwned ? "0 0 20px rgba(16,185,129,0.15)" : isHovered ? `0 0 30px ${rarityColors[skill.rarity]}20` : "none",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                            >
                                {/* Header: Icon + Rarity */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-lg)" }}>
                                    <div
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: "var(--radius-lg)",
                                            background: `linear-gradient(135deg, ${rarityColors[skill.rarity]}33, rgba(0,0,0,0.5))`,
                                            border: `1px solid ${rarityColors[skill.rarity]}80`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "2.5rem",
                                            boxShadow: `inset 0 0 20px ${rarityColors[skill.rarity]}20`,
                                            filter: isHovered ? `drop-shadow(0 0 10px ${rarityColors[skill.rarity]}80)` : "none",
                                            transition: "filter 0.3s"
                                        }}
                                    >
                                        {skill.icon}
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                fontWeight: 800,
                                                color: rarityColors[skill.rarity],
                                                textTransform: "uppercase",
                                                letterSpacing: "0.15em",
                                                textShadow: `0 0 10px ${rarityColors[skill.rarity]}80`
                                            }}
                                        >
                                            {skill.rarity}
                                        </div>
                                        <div className="badge" style={{ fontSize: "0.7rem", marginTop: 8, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>
                                            {skill.game}
                                        </div>
                                    </div>
                                </div>

                                {/* Body: Info */}
                                <div style={{ flexGrow: 1, marginBottom: "var(--space-xl)" }}>
                                    <h3 style={{ fontSize: "1.3rem", marginBottom: "var(--space-xs)", color: "var(--text-primary)" }}>{skill.name}</h3>
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                                        {skill.description}
                                    </p>
                                </div>

                                {/* Footer: Price + Buy */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "var(--space-md)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div>
                                        <div style={{ fontFamily: "var(--font-display)", color: "var(--arena-gold)", fontWeight: 800, fontSize: "1.4rem", textShadow: "0 0 10px rgba(245,158,11,0.3)" }}>
                                            {skill.price} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>$ARENA</span>
                                        </div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: 2, letterSpacing: "0.05em" }}>ZKEVM MINTED</div>
                                    </div>
                                    <button
                                        onClick={() => handlePurchase(skill.id)}
                                        className={`btn ${isOwned ? "" : "btn-gold"}`}
                                        disabled={isOwned || isBuying}
                                        style={{
                                            padding: "10px 20px",
                                            minWidth: 120,
                                            background: isOwned ? "rgba(16,185,129,0.1)" : isBuying ? "rgba(245, 158, 11, 0.5)" : "",
                                            color: isOwned ? "var(--neon-green)" : "",
                                            border: isOwned ? "1px solid var(--neon-green)" : ""
                                        }}
                                    >
                                        {isBuying ? (
                                            <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%" }} />
                                                Minting...
                                            </span>
                                        ) : isOwned ? (
                                            "✓ Owned"
                                        ) : (
                                            "Mint NFT"
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Info Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel"
                style={{ padding: "var(--space-2xl)", marginTop: "var(--space-3xl)", textAlign: "center", background: "linear-gradient(180deg, rgba(139, 92, 246, 0.05), rgba(0,0,0,0.5))" }}
            >
                <h2 style={{ marginBottom: "var(--space-xl)", fontSize: "2rem" }}>Vault Logistics</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-xl)" }}>
                    {[
                        { icon: "🛒", title: "Purchase On-Chain", desc: "Pay with $ARENA tokens. The NFT is permanently minted to your wallet address on Polygon zkEVM." },
                        { icon: "🎒", title: "Equip to Agents", desc: "Bind the NFT to any of your built agents in the Forge. Agents can hold up to 3 specialized skills." },
                        { icon: "📈", title: "Battle Enhancements", desc: "Skill buffs are read by the AgentArena game engine, giving targeted statistical or knowledge advantages." },
                    ].map((step) => (
                        <div key={step.title} className="glass-card" style={{ padding: "var(--space-xl)", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.02)" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}>{step.icon}</div>
                            <h3 style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)", color: "var(--text-primary)" }}>{step.title}</h3>
                            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
