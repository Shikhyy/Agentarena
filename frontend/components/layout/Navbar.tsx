"use client";

import { useWallet } from "@/lib/wallet";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
    { href: "/", label: "Home", mono: false },
    { href: "/world", label: "3D World", mono: false },
    { href: "/arenas", label: "Arenas", mono: false },
    { href: "/builder", label: "Build", mono: false },
    { href: "/marketplace", label: "Market", mono: false },
    { href: "/leaderboard", label: "Rankings", mono: false },
];

const STATIC_TICKER_ITEMS = [
    { label: "$ARENA", value: "$1.24 +5.2%", type: "green" },
    { label: "LAST WIN", value: "ALPHAGO vs DEEPBLUE — CHECKMATE IN 47", type: "danger" },
    { label: "POOL", value: "loading...", type: "gold" },
    { label: "NETWORK", value: "12ms latency", type: "" },
    { label: "GAS", value: "14 GWEI", type: "" },
    { label: "AGENTS", value: "loading...", type: "green" },
];

export function Navbar() {
    const { isConnected, isConnecting, address, arenaBalance, connect, disconnect } = useWallet();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [tickerItems, setTickerItems] = useState(STATIC_TICKER_ITEMS);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, tokenRes] = await Promise.all([
                    apiGet("/stats").catch(() => ({})),
                    apiGet("/token/price").catch(() => ({})),
                ]);

                const price = tokenRes.price_usd ?? 1.24;
                const change = tokenRes.change_24h_pct ?? 0;
                const changeStr = change >= 0 ? `+${change}%` : `${change}%`;

                setTickerItems([
                    { label: "$ARENA", value: `$${price.toFixed(2)} ${changeStr}`, type: change >= 0 ? "green" : "danger" },
                    { label: "LAST WIN", value: "ALPHAGO vs DEEPBLUE — CHECKMATE IN 47", type: "danger" },
                    { label: "POOL", value: `$${(statsRes.pool_volume_usd || 0).toLocaleString()} locked`, type: "gold" },
                    { label: "MCAP", value: `$${((tokenRes.market_cap || 0) / 1e6).toFixed(1)}M`, type: "green" },
                    { label: "VOL 24H", value: `$${((tokenRes.volume_24h_usd || 0) / 1e3).toFixed(0)}K`, type: "" },
                    { label: "AGENTS", value: `${(statsRes.total_agents || 0).toLocaleString()} active`, type: "green" },
                ]);
            } catch {}
        };

        fetchData();
        const interval = setInterval(fetchData, 10_000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (pathname === "/world") return null;

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

    return (
        <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, display: "flex", flexDirection: "column" }}>

            {/* ── Ticker tape ─────────────────────────────── */}
            <div className="ticker-tape hidden sm:block" style={{ fontSize: "0.68rem" }}>
                <div className="ticker-content">
                    {[...tickerItems, ...tickerItems].map((item, i) => (
                        <span
                            key={i}
                            className={`ticker-item ${item.type}`}
                            style={{ color: item.type === "green" ? "var(--apex-green)" : item.type === "danger" ? "var(--apex-red)" : item.type === "gold" ? "var(--apex-gold)" : undefined }}
                        >
                            <strong style={{ color: "var(--text-secondary)", marginRight: 4 }}>{item.label}:</strong>
                            {item.value}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Main nav ─────────────────────────────────── */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: scrolled ? "10px 32px" : "16px 40px",
                    background: scrolled ? "rgba(8,8,16,0.96)" : "rgba(8,8,16,0.7)",
                    backdropFilter: "blur(24px) saturate(200%)",
                    WebkitBackdropFilter: "blur(24px) saturate(200%)",
                    borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                }}
            >

                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none" }}>
                    <motion.div
                        whileHover={{ scale: 1.04 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        {/* Icon mark */}
                        <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, var(--apex-violet), var(--apex-cyan))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 20px rgba(123,92,250,0.4)",
                            fontSize: "0.9rem",
                            fontWeight: 900,
                            color: "#fff",
                            fontFamily: "var(--font-display)",
                            letterSpacing: "-0.05em",
                        }}>
                            A
                        </div>
                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "1.2rem",
                            letterSpacing: "-0.04em",
                            background: "linear-gradient(110deg, var(--apex-cyan) 0%, var(--apex-violet) 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter: "drop-shadow(0 0 12px rgba(0,212,255,0.25))",
                        }}>
                            AgentArena
                        </span>
                    </motion.div>
                </Link>

                {/* Desktop nav links */}
                <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    padding: "7px 14px",
                                    borderRadius: 8,
                                    fontSize: "0.875rem",
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? "var(--apex-cyan)" : "var(--text-secondary)",
                                    background: isActive ? "rgba(0,212,255,0.08)" : "transparent",
                                    transition: "all 0.2s ease",
                                    position: "relative",
                                    textDecoration: "none",
                                    letterSpacing: "0.01em",
                                    fontFamily: "var(--font-body)",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        (e.target as HTMLElement).style.color = "var(--text-primary)";
                                        (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        (e.target as HTMLElement).style.color = "var(--text-secondary)";
                                        (e.target as HTMLElement).style.background = "transparent";
                                    }
                                }}
                            >
                                {link.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        style={{
                                            position: "absolute",
                                            bottom: -1,
                                            left: 14,
                                            right: 14,
                                            height: 2,
                                            background: "var(--apex-cyan)",
                                            borderRadius: 1,
                                            boxShadow: "0 0 8px var(--apex-cyan-glow)",
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Network status dot */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 4 }} className="hidden sm:flex">
                        <div className="live-dot green" style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>LIVE</span>
                    </div>

                    {isConnected && address ? (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={disconnect}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                padding: "7px 16px",
                                borderRadius: 10,
                                background: "rgba(0,232,135,0.08)",
                                border: "1px solid rgba(0,232,135,0.2)",
                                color: "var(--apex-green)",
                                fontSize: "0.8rem",
                                fontFamily: "var(--font-mono)",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--apex-green)", boxShadow: "0 0 6px var(--apex-green-glow)", display: "inline-block" }} />
                            {shortenAddress(address)}
                            {parseFloat(arenaBalance) > 0 && (
                                <span style={{
                                    marginLeft: 6, padding: "2px 8px", borderRadius: 6,
                                    background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.2)",
                                    color: "var(--apex-gold)", fontSize: "0.7rem",
                                }}>
                                    {parseFloat(arenaBalance).toFixed(0)} $ARENA
                                </span>
                            )}
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(123,92,250,0.4)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={connect}
                            disabled={isConnecting}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 20px",
                                borderRadius: 10,
                                background: "linear-gradient(135deg, var(--apex-violet) 0%, #5A3AE8 100%)",
                                border: "none",
                                color: "#fff",
                                fontSize: "0.875rem",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                cursor: isConnecting ? "wait" : "pointer",
                                boxShadow: "0 4px 20px rgba(123,92,250,0.35)",
                                transition: "all 0.2s ease",
                                opacity: isConnecting ? 0.7 : 1,
                                letterSpacing: "0.01em",
                            }}
                        >
                            {isConnecting ? "Connecting..." : "Connect Wallet"}
                        </motion.button>
                    )}

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(o => !o)}
                        className="flex md:hidden"
                        style={{
                            width: 36, height: 36,
                            borderRadius: 8,
                            border: "1px solid var(--border-subtle)",
                            background: "rgba(255,255,255,0.04)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                        }}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? "✕" : "☰"}
                    </button>
                </div>
            </motion.nav>

            {/* ── Mobile Menu ──────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{
                            background: "rgba(8, 8, 16, 0.98)",
                            backdropFilter: "blur(24px)",
                            borderBottom: "1px solid var(--border-subtle)",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        padding: "12px 16px",
                                        borderRadius: 10,
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: pathname === link.href ? "var(--apex-cyan)" : "var(--text-secondary)",
                                        background: pathname === link.href ? "rgba(0,212,255,0.08)" : "transparent",
                                        textDecoration: "none",
                                        fontFamily: "var(--font-body)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
