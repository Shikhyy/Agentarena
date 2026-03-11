"use client";

import { useWallet } from "@/lib/wallet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const { isConnected, isConnecting, address, connect, disconnect } = useWallet();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hide navbar on immersive 3D world page
    if (pathname === "/world") return null;

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <header className="fixed w-full top-0 z-[200] flex flex-col">
            {/* Ticker Tape */}
            <div className="ticker-tape hidden sm:block">
                <div className="ticker-content">
                    <span className="ticker-item"><strong>$ARENA:</strong> $1.24 (+5.2%)</span>
                    <span className="ticker-item danger"><strong>LAST MATCH:</strong> ALPHAGO ZERO CRUSHED DEEPBLUE</span>
                    <span className="ticker-item"><strong>MARKET:</strong> NEURAL NET OPTIMIZER SOLD FOR 500 $ARENA</span>
                    <span className="ticker-item"><strong>SYSTEM:</strong> NETWORK LATENCY 12MS</span>
                    <span className="ticker-item danger"><strong>GAS:</strong> 15 GWEI</span>
                    <span className="ticker-item"><strong>$ARENA:</strong> $1.24 (+5.2%)</span>
                </div>
            </div>

            {/* Main Nav */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`nav ${scrolled ? 'bg-surface-bg/90 backdrop-blur-xl border-b border-border-color shadow-card' : 'bg-transparent border-b border-transparent'}`}
                style={{ padding: scrolled ? "0.5rem 2rem" : "1rem 2rem", transition: "all 0.3s ease", borderBottomWidth: scrolled ? "1px" : "0" }}
            >
                <Link href="/" className="nav-logo" style={{ color: "var(--success-green)", textShadow: "var(--shadow-glow-green)" }}>
                    AGNT.ARN
                </Link>
                <ul className="nav-links">
                    <li>
                        <Link href="/" className={`nav-link mono ${pathname === "/" ? "active" : ""}`}>
                            [HOME]
                        </Link>
                    </li>
                    <li>
                        <Link href="/world" className={`nav-link mono ${pathname === "/world" ? "active" : ""}`}>
                            [3D_WORLD]
                        </Link>
                    </li>
                    <li>
                        <Link href="/arenas" className={`nav-link mono ${pathname === "/arenas" ? "active" : ""}`}>
                            [ARENAS]
                        </Link>
                    </li>
                    <li>
                        <Link href="/builder" className={`nav-link mono ${pathname === "/builder" ? "active" : ""}`}>
                            [BUILD_AGENT]
                        </Link>
                    </li>
                    <li>
                        <Link href="/marketplace" className={`nav-link mono ${pathname?.startsWith("/marketplace") ? "active" : ""}`}>
                            [MARKET_DEX]
                        </Link>
                    </li>
                    <li>
                        <Link href="/profile" className={`nav-link mono ${pathname === "/profile" ? "active" : ""}`}>
                            [COMMAND_CENTER]
                        </Link>
                    </li>
                </ul>

                {isConnected && address ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-secondary btn-sm"
                        onClick={disconnect}
                        style={{ borderColor: "var(--success-green)", color: "var(--success-green)", boxShadow: "var(--shadow-glow-green)" }}
                    >
                        ● {shortenAddress(address)}
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-primary btn-sm"
                        onClick={connect}
                        disabled={isConnecting}
                        style={{ backgroundColor: "var(--success-green)", color: "var(--void-bg)", boxShadow: "var(--shadow-glow-green)" }}
                    >
                        {isConnecting ? "CONNECTING_LINK..." : "CONNECT_WALLET"}
                    </motion.button>
                )}
            </motion.nav>
        </header>
    );
}
