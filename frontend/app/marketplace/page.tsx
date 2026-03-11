"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// PRD Skill NFT Catalogue
interface SkillNFT {
    id: string;
    name: string;
    description: string;
    price: number;
    rarity: string;
    game: string;
    icon: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const rarityColors: Record<string, string> = {
    Uncommon: "var(--success-green)",
    Rare: "var(--primary-cyan)",
    Epic: "var(--premium-gold)",
    Legendary: "var(--danger-red)",
};

const FILTERS = ["All", "Chess", "Poker", "Monopoly", "Trivia"];

// Fake Order Book Data Generator
function generateOrderBook(basePrice: number) {
    const asks = Array.from({ length: 8 }).map((_, i) => ({
        price: basePrice + (i + 1) * 2.5,
        size: Math.floor(Math.random() * 50) + 5,
        total: 0
    })).reverse();

    const bids = Array.from({ length: 8 }).map((_, i) => ({
        price: basePrice - (i + 1) * 2.5,
        size: Math.floor(Math.random() * 50) + 5,
        total: 0
    }));

    let askTotal = 0;
    asks.forEach(a => { askTotal += a.size; a.total = askTotal; });
    let bidTotal = 0;
    bids.forEach(b => { bidTotal += b.size; b.total = bidTotal; });

    return { asks, bids };
}

export default function MarketplacePage() {
    const [skills, setSkills] = useState<SkillNFT[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [selectedSkill, setSelectedSkill] = useState<SkillNFT | null>(null);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [owned, setOwned] = useState<string[]>([]);

    // Fake order book
    const [orderBook, setOrderBook] = useState<{ asks: any[], bids: any[] }>({ asks: [], bids: [] });

    useEffect(() => {
        fetch(`${BACKEND_URL}/agents/skills`)
            .then(res => res.json())
            .then(data => {
                setSkills(data.skills || []);
                if (data.skills && data.skills.length > 0) {
                    setSelectedSkill(data.skills[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch skills:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (selectedSkill) {
            setOrderBook(generateOrderBook(selectedSkill.price));

            // Simulate live order book updates
            const interval = setInterval(() => {
                setOrderBook(prev => {
                    const newAsks = [...prev.asks];
                    if (newAsks.length > 0) {
                        const idx = Math.floor(Math.random() * newAsks.length);
                        newAsks[idx] = { ...newAsks[idx], size: Math.max(1, newAsks[idx].size + (Math.random() > 0.5 ? 5 : -5)) };
                    }
                    const newBids = [...prev.bids];
                    if (newBids.length > 0) {
                        const idx = Math.floor(Math.random() * newBids.length);
                        newBids[idx] = { ...newBids[idx], size: Math.max(1, newBids[idx].size + (Math.random() > 0.5 ? 5 : -5)) };
                    }
                    return { asks: newAsks, bids: newBids };
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [selectedSkill]);

    const filtered = skills.filter((s) => filter === "All" || s.game === filter || s.game === "All");

    const handlePurchase = async () => {
        if (!selectedSkill) return;
        setPurchasing(selectedSkill.id);
        await new Promise((r) => setTimeout(r, 1500)); // Simulate tx
        setOwned((prev) => [...prev, selectedSkill.id]);
        setPurchasing(null);
    };

    const isOwned = selectedSkill ? owned.includes(selectedSkill.id) : false;

    return (
        <div className="page" style={{ padding: "0" }}>
            {/* DEX Layout */}
            <div className="flex flex-col h-screen pt-16">

                {/* Header Strip */}
                <div className="bg-surface-bg border-b border-border-color px-6 py-3 flex justify-between items-center text-xs mono">
                    <div className="flex gap-4 items-center">
                        <span className="text-primary-cyan font-bold tracking-widest">[SKILL_DEX]</span>
                        <div className="h-4 w-px bg-border-color"></div>
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`uppercase transition-colors ${filter === f ? "text-primary-cyan" : "text-text-muted hover:text-white"}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-6 text-text-muted">
                        <span>NETWORK: <span className="text-success-green">POLYGON ZKEVM</span></span>
                        <span>STATUS: <span className="text-success-green animate-pulse">● OPERATIONAL</span></span>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* Left: Pairs List */}
                    <div className="w-1/4 min-w-[300px] border-r border-border-color bg-void-bg overflow-y-auto hidden md:block">
                        <div className="p-3 border-b border-border-color text-xs mono text-text-muted flex justify-between">
                            <span>MARKET</span>
                            <span>PRICE / 24H</span>
                        </div>
                        {loading ? (
                            <div className="p-6 text-center text-text-muted mono animate-pulse">LOADING_DATA_STREAMS...</div>
                        ) : (
                            <div className="flex flex-col">
                                {filtered.map((skill) => (
                                    <button
                                        key={skill.id}
                                        onClick={() => setSelectedSkill(skill)}
                                        className={`p-4 border-b border-border-color/50 text-left transition-colors font-mono flex justify-between items-center ${selectedSkill?.id === skill.id ? "bg-surface-bg border-l-2 border-l-primary-cyan" : "hover:bg-surface-bg/50"}`}
                                    >
                                        <div>
                                            <div className="font-bold text-sm text-white mb-1">{skill.name}</div>
                                            <div className="text-xs text-text-muted">{skill.game}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-success-green text-sm">{skill.price} $ARENA</div>
                                            <div className="text-xs text-text-muted">+{Math.floor(Math.random() * 15 + 1)}%</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Middle: Chart & Details */}
                    <div className="flex-1 flex flex-col bg-[#05050A]">
                        {selectedSkill ? (
                            <>
                                {/* Trade Header */}
                                <div className="p-6 border-b border-border-color flex justify-between items-start bg-gradient-to-r from-surface-bg to-transparent">
                                    <div className="flex gap-4 items-center">
                                        <div
                                            className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                                            style={{ border: `1px solid ${rarityColors[selectedSkill.rarity]}`, background: `${rarityColors[selectedSkill.rarity]}20`, color: rarityColors[selectedSkill.rarity], boxShadow: `0 0 20px ${rarityColors[selectedSkill.rarity]}40` }}
                                        >
                                            {selectedSkill.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold tracking-tight mb-1">{selectedSkill.name}</h2>
                                            <div className="flex gap-3 text-xs mono">
                                                <span className="text-text-muted uppercase px-2 py-0.5 rounded bg-white/5">{selectedSkill.rarity}</span>
                                                <span className="text-text-muted uppercase px-2 py-0.5 rounded bg-white/5">{selectedSkill.game}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-mono text-success-green" style={{ textShadow: "var(--shadow-glow-green)" }}>
                                            {selectedSkill.price} <span className="text-sm text-text-primary">$ARENA</span>
                                        </div>
                                        <div className="text-text-muted text-sm mono mt-1">~${(selectedSkill.price * 1.24).toFixed(2)} USD</div>
                                    </div>
                                </div>

                                {/* Main Chart Area (Fake Depth Chart) */}
                                <div className="flex-1 border-b border-border-color relative overflow-hidden flex flex-col">
                                    <div className="p-4 text-xs mono text-text-muted absolute top-0 left-0 bg-black/50 rounded-br-lg z-10">DEPTH_CHART // LIQUIDITY MINING ACTIVE</div>

                                    <div className="flex-1 relative flex items-end justify-center p-8 opacity-60">
                                        {/* Fake SVG Depth Chart */}
                                        <svg width="100%" height="80%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                            {/* Bids (Green) */}
                                            <path d="M 0 300 L 0 150 Q 100 150 200 120 T 400 80 L 480 80 L 480 300 Z" fill="url(#gradBid)" stroke="var(--success-green)" strokeWidth="2" />
                                            {/* Asks (Red) */}
                                            <path d="M 520 300 L 520 70 L 600 70 Q 700 80 800 140 T 1000 200 L 1000 300 Z" fill="url(#gradAsk)" stroke="var(--danger-red)" strokeWidth="2" />

                                            <defs>
                                                <linearGradient id="gradBid" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--success-green)" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="var(--success-green)" stopOpacity="0" />
                                                </linearGradient>
                                                <linearGradient id="gradAsk" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--danger-red)" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="var(--danger-red)" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        {/* Center Price Line */}
                                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border-color border-dashed"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-bg px-3 py-1 rounded text-primary-cyan font-mono text-sm border border-primary-cyan/50 shadow-glow-cyan z-10">
                                            {selectedSkill.price}.00
                                        </div>
                                    </div>

                                    {/* Description Strip */}
                                    <div className="bg-surface-bg/80 backdrop-blur border-t border-border-color p-4 text-sm text-text-muted leading-relaxed max-h-24 overflow-y-auto">
                                        {selectedSkill.description}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-text-muted mono animate-pulse">
                                SELECT_MARKET_PAIR
                            </div>
                        )}
                    </div>

                    {/* Right: Order Book & Actions */}
                    <div className="w-[340px] border-l border-border-color bg-void-bg flex flex-col hidden lg:flex">

                        {/* Order Book */}
                        <div className="flex-1 flex flex-col overflow-hidden text-xs mono">
                            <div className="p-3 border-b border-border-color text-text-muted flex justify-between bg-surface-bg">
                                <span>ORDER_BOOK</span>
                                <div><span className="w-2 h-2 rounded-full inline-block bg-success-green mr-2"></span>LIVE</div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col p-2">
                                {/* Asks (Red) */}
                                <div className="flex-1 flex flex-col justify-end">
                                    {orderBook.asks.map((ask, i) => (
                                        <div key={`ask-${i}`} className="flex justify-between py-1 relative">
                                            <div className="absolute right-0 top-0 bottom-0 bg-danger-red/10" style={{ width: `${(ask.total / 500) * 100}%` }}></div>
                                            <span className="text-danger-red relative z-10">{ask.price.toFixed(2)}</span>
                                            <span className="text-white relative z-10">{ask.size}</span>
                                            <span className="text-text-muted relative z-10">{ask.total}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Current Price */}
                                <div className="py-2 my-2 border-y border-border-color text-center font-bold text-lg text-primary-cyan" style={{ textShadow: "var(--shadow-glow-cyan)" }}>
                                    {selectedSkill?.price.toFixed(2)} ↑
                                </div>

                                {/* Bids (Green) */}
                                <div className="flex-1 flex flex-col">
                                    {orderBook.bids.map((bid, i) => (
                                        <div key={`bid-${i}`} className="flex justify-between py-1 relative">
                                            <div className="absolute right-0 top-0 bottom-0 bg-success-green/10" style={{ width: `${(bid.total / 500) * 100}%` }}></div>
                                            <span className="text-success-green relative z-10">{bid.price.toFixed(2)}</span>
                                            <span className="text-white relative z-10">{bid.size}</span>
                                            <span className="text-text-muted relative z-10">{bid.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trade Action Box */}
                        <div className="p-6 bg-surface-bg border-t border-border-color">
                            <div className="flex justify-between text-xs mono text-text-muted mb-4">
                                <span>AVAILABLE BALANCE</span>
                                <span className="text-white">12,450.00 $ARENA</span>
                            </div>

                            {isOwned ? (
                                <div className="w-full text-center p-4 border border-success-green/50 bg-success-green/10 rounded-lg text-success-green font-mono shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                                    [ASSET_OWNED] <br />
                                    <span className="text-xs text-text-muted mt-2 block">Skill is active in your inventory.</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing !== null || !selectedSkill}
                                    className="w-full relative group overflow-hidden rounded-lg font-mono font-bold text-sm tracking-wider"
                                    style={{
                                        background: "var(--success-green)",
                                        color: "var(--void-bg)",
                                        padding: "16px",
                                        boxShadow: "0 0 20px rgba(0,255,136,0.3)"
                                    }}
                                >
                                    <span className="relative z-10">
                                        {purchasing === selectedSkill?.id ? "PROCESSING_TX..." : "MARKET_BUY"}
                                    </span>
                                </button>
                            )}

                            <div className="mt-4 text-center text-[10px] text-text-muted mono flex justify-center gap-2">
                                <span>MIN FEE: 0.05%</span>
                                <span>|</span>
                                <span>SETTLEMENT: INSTANT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
