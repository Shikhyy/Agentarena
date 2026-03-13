"use client";

import { useMemo, useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet";
import { apiGet } from "@/lib/api";

// PRD Skill NFT Catalogue
interface SkillNFT {
    id: string;
    name: string;
    description: string;
    price: number;
    rarity: string;
    game: string;
    icon: string;
    last_price?: number;
    change_24h_pct?: number;
    volume_24h?: number;
}

const rarityColors: Record<string, string> = {
    Uncommon: "var(--success-green)",
    Rare: "var(--primary-cyan)",
    Epic: "var(--premium-gold)",
    Legendary: "var(--danger-red)",
};

const FILTERS = ["All", "Chess", "Poker", "Monopoly", "Trivia"];

interface ContractsConfig {
    contracts: {
        agent_nft?: string;
        skill_nft?: string;
        arena_token?: string;
        zk_betting_pool?: string;
    };
}

export default function MarketplacePage() {
    const wallet = useWallet();
    const [skills, setSkills] = useState<SkillNFT[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedSkill, setSelectedSkill] = useState<SkillNFT | null>(null);
    const [contracts, setContracts] = useState<ContractsConfig | null>(null);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        Promise.all([
            apiGet("/agents/skills/market"),
            apiGet("/config/contracts").catch(() => null),
        ])
            .then(([marketData, contractData]) => {
                const incoming = marketData.skills || [];
                setSkills(incoming);
                if (incoming.length > 0) {
                    setSelectedSkill(incoming[0]);
                }
                setContracts(contractData);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return skills
            .filter((s) => filter === "All" || s.game === filter || s.game === "All")
            .filter((s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }, [skills, filter, search]);

    const stats = useMemo(() => {
        const listed = filtered.length;
        const volume = filtered.reduce((acc, s) => acc + (s.volume_24h || 0), 0);
        const avgChange = listed > 0
            ? filtered.reduce((acc, s) => acc + (s.change_24h_pct || 0), 0) / listed
            : 0;
        return { listed, volume, avgChange };
    }, [filtered]);

    const contractReady = Boolean(
        contracts?.contracts?.skill_nft &&
        contracts?.contracts?.arena_token
    );

    const handleBuy = async () => {
        if (!selectedSkill || buying) return;
        setBuying(true);
        await new Promise((resolve) => setTimeout(resolve, 700));
        setBuying(false);
    };

    const balance = parseFloat(wallet.arenaBalance || "0");

    const currentPrice = selectedSkill?.last_price ?? selectedSkill?.price ?? 0;

    return (
        <div style={{ paddingTop: 80, minHeight: "100vh" }}>
            <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 28px 72px" }}>
                <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                        <div className="section-label">Skill Marketplace</div>
                        <h1 style={{ margin: 0, fontSize: "clamp(2rem,4.5vw,3rem)" }}>Trade Skill NFTs</h1>
                        <p className="text-muted" style={{ marginTop: 8 }}>Live catalog from backend with synchronized contract configuration.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: 12, minWidth: 280 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>System Sync</div>
                        <div style={{ fontSize: 13 }}>
                            Contracts: <span style={{ color: contractReady ? "var(--success-green)" : "var(--danger-red)" }}>{contractReady ? "ready" : "missing env"}</span>
                        </div>
                        <div style={{ fontSize: 13 }}>
                            Wallet: <span style={{ color: wallet.isConnected ? "var(--success-green)" : "var(--text-muted)" }}>{wallet.isConnected ? "connected" : "not connected"}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
                    <div className="glass-panel" style={{ padding: 16 }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search skill name or description"
                                className="input"
                                style={{ maxWidth: 360 }}
                            />
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {FILTERS.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className="btn btn-sm"
                                        style={{
                                            background: filter === f ? "var(--electric-purple)" : "rgba(255,255,255,0.03)",
                                            color: filter === f ? "#fff" : "var(--text-secondary)",
                                        }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                            {loading && Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="skeleton" style={{ height: 150 }} />
                            ))}

                            {!loading && filtered.map((skill) => {
                                const selected = selectedSkill?.id === skill.id;
                                const change = skill.change_24h_pct || 0;
                                return (
                                    <button
                                        key={skill.id}
                                        onClick={() => setSelectedSkill(skill)}
                                        style={{
                                            textAlign: "left",
                                            borderRadius: 12,
                                            border: selected ? "1px solid var(--electric-purple)" : "1px solid rgba(255,255,255,0.08)",
                                            background: selected ? "rgba(108,58,237,0.12)" : "rgba(255,255,255,0.02)",
                                            padding: 12,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <strong>{skill.name}</strong>
                                            <span style={{ color: rarityColors[skill.rarity] || "var(--text-secondary)", fontSize: 12 }}>{skill.rarity}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: "var(--text-muted)", minHeight: 36 }}>{skill.description}</div>
                                        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                            <span>{skill.last_price ?? skill.price} $ARENA</span>
                                            <span style={{ color: change >= 0 ? "var(--success-green)" : "var(--danger-red)" }}>
                                                {change >= 0 ? "+" : ""}{change}%
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: 16 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Details</h3>
                        {selectedSkill ? (
                            <>
                                <div style={{ marginBottom: 8 }}><strong>{selectedSkill.name}</strong></div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{selectedSkill.description}</div>
                                <div style={{ display: "grid", gap: 6, fontSize: 13, marginBottom: 12 }}>
                                    <div>Game: {selectedSkill.game}</div>
                                    <div>Rarity: <span style={{ color: rarityColors[selectedSkill.rarity] || "var(--text-secondary)" }}>{selectedSkill.rarity}</span></div>
                                    <div>Price: {currentPrice} $ARENA</div>
                                    <div>24h Vol: {selectedSkill.volume_24h || 0}</div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleBuy}
                                    disabled={buying || !wallet.isConnected || balance < currentPrice}
                                    style={{ width: "100%" }}
                                >
                                    {buying ? "Processing..." : "Buy Skill"}
                                </button>
                                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                                    Balance: {balance.toFixed(2)} $ARENA
                                </div>
                            </>
                        ) : (
                            <div className="text-muted">Select a skill to inspect.</div>
                        )}

                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)", display: "grid", gap: 6, fontSize: 13 }}>
                            <div>Listed: {stats.listed}</div>
                            <div>24h Volume: {stats.volume}</div>
                            <div>
                                Avg Change: <span style={{ color: stats.avgChange >= 0 ? "var(--success-green)" : "var(--danger-red)" }}>
                                    {stats.avgChange >= 0 ? "+" : ""}{stats.avgChange.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
