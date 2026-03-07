"use client";

import { useWallet } from "@/lib/wallet";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { isConnected, isConnecting, address, connect, disconnect } = useWallet();
    const pathname = usePathname();

    // Hide navbar on immersive 3D world page
    if (pathname === "/world") return null;

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <nav className="nav">
            <Link href="/" className="nav-logo">
                ⚔️ AgentArena
            </Link>
            <ul className="nav-links">
                <li>
                    <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link href="/world" className={`nav-link ${pathname === "/world" ? "active" : ""}`}>
                        3D World
                    </Link>
                </li>
                <li>
                    <Link href="/arenas" className={`nav-link ${pathname === "/arenas" ? "active" : ""}`}>
                        Arenas
                    </Link>
                </li>
                <li>
                    <Link href="/builder" className={`nav-link ${pathname === "/builder" ? "active" : ""}`}>
                        Build Agent
                    </Link>
                </li>
                <li>
                    <Link href="/leaderboard" className={`nav-link ${pathname === "/leaderboard" ? "active" : ""}`}>
                        Leaderboard
                    </Link>
                </li>
                <li>
                    <Link href="/my-agents" className={`nav-link ${pathname?.startsWith("/my-agents") || pathname?.startsWith("/agents") ? "active" : ""}`}>
                        My Agents
                    </Link>
                </li>
                <li>
                    <Link href="/tournaments" className={`nav-link ${pathname?.startsWith("/tournaments") ? "active" : ""}`}>
                        Tournaments
                    </Link>
                </li>
                <li>
                    <Link href="/marketplace" className={`nav-link ${pathname?.startsWith("/marketplace") ? "active" : ""}`}>
                        Marketplace
                    </Link>
                </li>
                <li>
                    <Link href="/profile" className={`nav-link ${pathname === "/profile" ? "active" : ""}`}>
                        Profile
                    </Link>
                </li>
            </ul>

            {isConnected && address ? (
                <button className="btn btn-secondary btn-sm" onClick={disconnect}>
                    {shortenAddress(address)}
                </button>
            ) : (
                <button
                    className="btn btn-primary btn-sm"
                    onClick={connect}
                    disabled={isConnecting}
                >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
            )}
        </nav>
    );
}
