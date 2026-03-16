"use client";

import { useWallet } from "@/lib/wallet";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/world", label: "3D World" },
  { href: "/arenas", label: "Arenas" },
  { href: "/world/workshop", label: "Build Agent" },
  { href: "/marketplace", label: "Market" },
  { href: "/leaderboard", label: "Rankings" },
];

type TickerItem = {
  label: string;
  value: string;
  type?: "green" | "gold" | "danger";
};

const DEFAULT_TICKER: TickerItem[] = [
  { label: "$ARENA", value: "Loading", type: "green" },
  { label: "POOL", value: "Loading", type: "gold" },
  { label: "AGENTS", value: "Loading", type: "green" },
  { label: "NETWORK", value: "Stable" },
];

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, isConnecting, address, arenaBalance, connect, disconnect } = useWallet();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(DEFAULT_TICKER);

  const hideNavbar = useMemo(() => pathname?.startsWith("/world"), [pathname]);

  useEffect(() => {
    if (hideNavbar) return;

    const fetchTicker = async () => {
      try {
        const [statsRes, tokenRes] = await Promise.all([
          apiGet("/stats").catch(() => ({})),
          apiGet("/token/price").catch(() => ({})),
        ]);

        const price = Number(tokenRes.price_usd ?? 0);
        const change = Number(tokenRes.change_24h_pct ?? 0);
        const changeStr = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;

        setTickerItems([
          { label: "$ARENA", value: `$${price.toFixed(2)} ${changeStr}`, type: change >= 0 ? "green" : "danger" },
          { label: "POOL", value: `$${Number(statsRes.pool_volume_usd || 0).toLocaleString()}`, type: "gold" },
          { label: "AGENTS", value: `${Number(statsRes.total_agents || 0).toLocaleString()} active`, type: "green" },
          { label: "NETWORK", value: "12ms" },
          { label: "GAS", value: "14 gwei" },
        ]);
      } catch {
        setTickerItems(DEFAULT_TICKER);
      }
    };

    fetchTicker();
    const timer = setInterval(fetchTicker, 12000);
    return () => clearInterval(timer);
  }, [hideNavbar]);

  if (hideNavbar) return null;

  return (
    <header className="site-header">
      <div className="ticker-tape">
        <div className="ticker-content">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={`${item.label}-${idx}`} className={`ticker-item ${item.type ?? ""}`}>
              <strong style={{ color: "var(--text-secondary)" }}>{item.label}</strong>: {item.value}
            </span>
          ))}
        </div>
      </div>

      <div className="nav-shell">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <span className="nav-brand-mark">A</span>
            <span>AgentArena</span>
          </Link>

          <nav className="nav-links">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} className={`nav-link ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="nav-right">
            <span className="network-pill" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
              <i className="live-dot green" /> LIVE
            </span>

            {isConnected && address ? (
              <button className="btn" onClick={disconnect}>
                {shortenAddress(address)}
                {Number(arenaBalance || 0) > 0 ? ` • ${Number(arenaBalance).toFixed(0)} $ARENA` : ""}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={connect} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}

            <button className="btn mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} className={`nav-link ${active ? "active" : ""}`}>
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
