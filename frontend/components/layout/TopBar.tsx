"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useUIStore } from "@/lib/stores/uiStore";
import { useWorldStore } from "@/lib/worldStore";
import { WORLD_ZONES } from "@/lib/worldStore";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/world", label: "World" },
  { href: "/builder", label: "Workshop" },
  { href: "/my-agents", label: "My Agents" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/marketplace", label: "Market" },
  { href: "/tournaments", label: "Sky Deck" },
];

function NavPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      className={`nav-pill ${active ? "active" : ""}`}
      href={href}
    >
      {label}
    </Link>
  );
}

function LiveBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "4px",
        textTransform: "uppercase" as const,
        color: "var(--color-teal)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--color-teal)",
          boxShadow: "0 0 8px var(--color-teal)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      LIVE
    </span>
  );
}

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <button
        className="btn"
        onClick={() => disconnect()}
        title={address}
      >
        {short}
      </button>
    );
  }

  return (
    <button
      className="btn btn-primary"
      onClick={() => {
        const connector = connectors[0];
        if (connector) connect({ connector });
      }}
    >
      Connect Wallet
    </button>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const toggleNotificationPanel = useUIStore((s) => s.toggleNotificationPanel);
  const notifications = useUIStore((s) => s.notifications);
  const currentZone = useWorldStore((s) => s.currentZone);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const zoneConfig = WORLD_ZONES.find((z) => z.id === currentZone);
  const zoneName = zoneConfig?.label ?? "Central Nexus";

  return (
    <header className="topbar">
      <div className="chrome-inner">
        {/* Logo + Zone + Live badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" className="wordmark">
            AGENT<span>ARENA</span>
          </Link>
          <motion.span
            key={currentZone}
            className="mono"
            style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-stone)" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {zoneConfig?.icon} {zoneName}
          </motion.span>
          <LiveBadge />
        </div>

        {/* Nav links */}
        <nav className="nav-row" style={{ flex: 1, justifyContent: "center" }}>
          {NAV_LINKS.map((item) => (
            <NavPill
              key={item.href}
              href={item.href}
              label={item.label}
              active={
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
        </nav>

        {/* Right: Cmd+K, notifications, wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="btn"
            onClick={toggleCommandPalette}
            aria-label="Open command palette"
            style={{ padding: "8px 10px", fontSize: 11 }}
          >
            <span className="mono" style={{ opacity: 0.6 }}>⌘K</span>
          </button>

          <button
            className="btn"
            onClick={toggleNotificationPanel}
            aria-label="Notifications"
            style={{ position: "relative", padding: "8px 10px" }}
          >
            <span style={{ fontSize: 14 }}>🔔</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "var(--color-red)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
