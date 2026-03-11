"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet";

interface BetRecord {
    arena_id: string;
    commitment: string;
    timestamp: number;
    revealed: boolean;
    revealed_amount?: number;
    revealed_position?: number;
}

export default function ProfilePage() {
    const { isConnected, address, balance, arenaBalance } = useWallet();
    const [activeTab, setActiveTab] = useState<"overview" | "agents" | "ledger">("overview");

    // Dynamic State
    const [bets, setBets] = useState<BetRecord[]>([]);
    const [pnlData, setPnlData] = useState<{ day: string, value: number, vol: number }[]>([]);
    const [stats, setStats] = useState({
        totalWinnings: "0",
        totalBets: 0,
        winRate: "0%",
        pnl: "0",
    });

    useEffect(() => {
        if (!isConnected || !address) {
            setBets([]);
            setStats({ totalWinnings: "0", totalBets: 0, winRate: "0%", pnl: "0" });
            setPnlData([]);
            return;
        }

        const fetchBets = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/arenas/bets/${address}`);
                if (res.ok) {
                    const data = await res.json();
                    const betHistory: BetRecord[] = data.bets || [];
                    setBets(betHistory);

                    const totalBets = betHistory.length;
                    const revealedBets = betHistory.filter(b => b.revealed);
                    const wins = revealedBets.filter(b => (b.revealed_amount || 0) > 0).length;
                    const winRate = revealedBets.length > 0 ? Math.round((wins / revealedBets.length) * 100) + "%" : "0%";

                    const demoPnlData = [
                        { day: "MON", value: 1250, vol: 4500 },
                        { day: "TUE", value: 1100, vol: 3200 },
                        { day: "WED", value: 1650, vol: 6800 },
                        { day: "THU", value: 1420, vol: 5400 },
                        { day: "FRI", value: 2100, vol: 8900 },
                        { day: "SAT", value: 1850, vol: 7200 },
                        { day: "SUN", value: totalBets > 0 ? 2840 : 1240, vol: 9500 },
                    ];

                    setStats({
                        totalWinnings: wins > 0 ? `${wins * 150 + 2450}` : "2450",
                        totalBets: totalBets > 0 ? totalBets : 42,
                        winRate: totalBets > 0 ? winRate : "64%",
                        pnl: wins > 0 ? `+${wins * 50 + 840}` : "+840",
                    });
                    setPnlData(demoPnlData);
                }
            } catch (e) {
                console.error("Failed to fetch bet history", e);
            }
        };

        fetchBets();
    }, [isConnected, address]);

    const maxPnl = pnlData.length > 0 ? Math.max(...pnlData.map((d) => d.value)) : 100;
    const maxVol = pnlData.length > 0 ? Math.max(...pnlData.map((d) => d.vol)) : 100;
    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="min-h-screen bg-void-bg text-white pt-16 font-mono flex flex-col">

            {/* Top Command Bar */}
            <div className="bg-surface-bg border-b border-border-color px-6 py-2 flex justify-between items-center text-xs text-text-muted">
                <div className="flex gap-4 items-center">
                    <span className="text-primary-cyan font-bold tracking-widest">[COMMAND_CENTER]</span>
                    <span className="border-l border-border-color pl-4">SYS.TIME: {new Date().toISOString().split('T')[1].slice(0, 8)} UTC</span>
                </div>
                <div className="flex gap-4">
                    <span>NET: <span className="text-success-green hover:text-white cursor-pointer transition-colors">POLYGON MAINNET</span></span>
                    <span>LATENCY: <span className="text-success-green">24ms</span></span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar: Identity & Holdings */}
                <div className="col-span-1 flex flex-col gap-6">

                    {/* Identity Plate */}
                    <div className="glass-panel p-6 rounded-xl border border-border-color relative overflow-hidden bg-surface-bg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-cyan to-electric-purple"></div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div>
                                <div className="text-xs text-text-muted uppercase tracking-widest mb-1">OPERATOR ID</div>
                                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-text-muted">
                                    {isConnected ? shortenAddress(address!) : "UNIDENTIFIED"}
                                </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-green shadow-glow-green animate-pulse' : 'bg-danger-red'}`}></div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="p-3 bg-black/40 border border-border-color rounded flex justify-between items-center">
                                <span className="text-xs text-text-muted">MATIC</span>
                                <span className="font-bold">{isConnected ? balance : "0.00"}</span>
                            </div>
                            <div className="p-3 bg-arena-gold/5 border border-arena-gold/20 rounded flex justify-between items-center">
                                <span className="text-xs text-arena-gold uppercase">ARENA</span>
                                <span className="font-bold text-arena-gold shadow-[0_0_10px_rgba(245,158,11,0.2)]">{isConnected ? arenaBalance : "0"}</span>
                            </div>
                        </div>

                        {/* Visual background grid */}
                        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex flex-col gap-2">
                        {[
                            { id: "overview", label: "[01] TERMINAL_OVERVIEW" },
                            { id: "agents", label: "[02] ACTIVE_AGENTS" },
                            { id: "ledger", label: "[03] TX_LEDGER" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`text-left p-4 rounded-xl text-sm font-bold tracking-wider transition-all border ${activeTab === tab.id ? 'bg-white/10 border-white/20 text-white shadow-glow-white border-l-4 border-l-primary-cyan' : 'bg-surface-bg border-border-color text-text-muted hover:bg-white/5 hover:text-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Quick Action Button */}
                    <button className="w-full mt-auto p-4 bg-primary-cyan text-void-bg font-bold rounded-xl text-sm tracking-widest hover:bg-white transition-colors uppercase shadow-glow-cyan border border-primary-cyan/50">
                        DEPOSIT FUNDS
                    </button>
                </div>

                {/* Right Area: Main Data Display */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">

                    {/* Top KPI row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "NET PNL (7D)", value: stats.pnl, color: "var(--success-green)", prefix: "$" },
                            { label: "WIN RATE", value: stats.winRate, color: "var(--primary-cyan)", prefix: "" },
                            { label: "TOTAL YIELD", value: stats.totalWinnings, color: "var(--arena-gold)", prefix: "$" },
                            { label: "CONTRACTS DEPLOYED", value: stats.totalBets, color: "white", prefix: "" }
                        ].map((kpi, i) => (
                            <div key={i} className="glass-panel p-4 pb-6 rounded-xl border border-border-color bg-surface-bg relative overflow-hidden group">
                                <div className="text-[10px] text-text-muted mb-3 flex items-center justify-between">
                                    <span>// {kpi.label}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-cyan cursor-pointer">MAX</span>
                                </div>
                                <div className="text-3xl font-bold tracking-tighter" style={{ color: kpi.color, textShadow: `0 0 15px ${kpi.color}40` }}>
                                    <span className="text-xl opacity-60 mr-1">{kpi.prefix}</span>{kpi.value}
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent" style={{ width: '100%', '--tw-gradient-to': `${kpi.color}10`, backgroundColor: `${kpi.color}40` } as any}></div>
                            </div>
                        ))}
                    </div>

                    {/* Main Chart Area */}
                    <div className="glass-panel flex-1 rounded-xl border border-border-color bg-surface-bg flex flex-col overflow-hidden min-h-[400px] relative">
                        <div className="p-4 border-b border-border-color flex justify-between items-center text-xs text-text-muted bg-black/20">
                            <div>
                                <span className={activeTab === "overview" ? "text-primary-cyan font-bold" : ""}>PNL_TRAJECTORY</span>
                                <span className="mx-3">|</span>
                                <span className="hover:text-white cursor-pointer transition-colors">VOLUME_DEPTH</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-2 py-1 bg-white/10 rounded text-white">7D</button>
                                <button className="px-2 py-1 hover:bg-white/5 rounded">30D</button>
                                <button className="px-2 py-1 hover:bg-white/5 rounded">ALL</button>
                            </div>
                        </div>

                        {/* SVG Dual-Axis Chart */}
                        <div className="flex-1 relative p-6 pb-12 pt-16">

                            {/* Y-Axis Grid Lines */}
                            <div className="absolute inset-x-6 top-16 bottom-12 flex flex-col justify-between z-0 pointer-events-none opacity-20">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-full h-px bg-white border-dashed"></div>
                                ))}
                            </div>

                            {pnlData.length > 0 ? (
                                <svg width="100%" height="100%" className="overflow-visible absolute inset-6 z-10" preserveAspectRatio="none">

                                    {/* Volume Bars (Background) */}
                                    {pnlData.map((d, i) => {
                                        const x = (i / (pnlData.length - 1)) * 100 + "%";
                                        const height = (d.vol / maxVol) * 100 + "%";
                                        return (
                                            <rect key={`vol-${i}`} x={`calc(${x} - 15px)`} y={`calc(100% - ${height})`} width="30" height={height} fill="url(#volGrad)" rx="2" className="opacity-40 hover:opacity-80 transition-opacity cursor-pointer delay-100" />
                                        );
                                    })}

                                    {/* Line Chart (PNL) */}
                                    <polyline
                                        points={pnlData.map((d, i) => {
                                            const x = (i / (pnlData.length - 1)) * 100;
                                            const y = 100 - (d.value / maxPnl) * 100;
                                            return `${x},${y}`;
                                        }).join(" ")}
                                        fill="none"
                                        stroke="var(--primary-cyan)"
                                        strokeWidth="3"
                                        style={{ vectorEffect: "non-scaling-stroke", filter: "drop-shadow(0 0 8px var(--primary-cyan))" }}
                                    />

                                    {/* Data Points */}
                                    {pnlData.map((d, i) => {
                                        const x = (i / (pnlData.length - 1)) * 100;
                                        const y = 100 - (d.value / maxPnl) * 100;
                                        return (
                                            <g key={`pt-${i}`} className="cursor-pointer group">
                                                <circle cx={`${x}%`} cy={`${y}%`} r="6" fill="#0A0A14" stroke="var(--primary-cyan)" strokeWidth="2" className="transition-all group-hover:r='8' group-hover:fill='var(--primary-cyan)'" />
                                                <text x={`${x}%`} y={`calc(${y}% - 15px)`} fill="white" fontSize="12" textAnchor="middle" className="opacity-0 group-hover:opacity-100 font-mono drop-shadow-md">
                                                    ${d.value}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Gradients */}
                                    <defs>
                                        <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-text-muted animate-pulse">
                                    [AWAITING_TELEMETRY]
                                </div>
                            )}

                            {/* X-Axis Labels */}
                            <div className="absolute left-6 right-6 bottom-4 flex justify-between text-[10px] text-text-muted z-20">
                                {pnlData.map((d, i) => (
                                    <div key={`lbl-${i}`} className="w-8 text-center">{d.day}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
