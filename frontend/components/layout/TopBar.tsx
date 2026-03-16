"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useUIStore } from "@/lib/stores/uiStore";
import { useBettingStore } from "@/lib/stores/index";

const NAV_LINKS = [
  { href: "/world", label: "3D World" },
  { href: "/arenas", label: "Arenas" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/marketplace", label: "Market" },
  { href: "/world/workshop", label: "Build" },
  { href: "/my-agents", label: "My Agents" },
];

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 4V3a2 2 0 012-2h6a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11.5" cy="9" r="1.2" fill="currentColor" />
    </svg>
  );
}

function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const balance = useBettingStore((s) => s.balance);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const connecting = isConnecting || isPending;

  // Clear local error after 4s
  useEffect(() => {
    if (!localError) return;
    const t = setTimeout(() => setLocalError(null), 4000);
    return () => clearTimeout(t);
  }, [localError]);

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!dropdownOpen && !showConnectors) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowConnectors(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen, showConnectors]);

  if (connecting) {
    return (
      <span className="wallet-btn-connecting">
        <span className="wallet-spinner" />
        Connecting…
      </span>
    );
  }

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
    return (
      <div className="wallet-connected" ref={dropdownRef}>
        <span className="wallet-balance-badge">
          <span>₳</span>
          {balance.toFixed(0)}
        </span>
        <button
          className="wallet-address-btn"
          onClick={() => setDropdownOpen((v) => !v)}
          title={address}
        >
          <span className="wallet-chain-dot" />
          {short}
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity: 0.5 }}>
            <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              className="wallet-dropdown"
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              <div style={{ padding: "8px 12px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-stone)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Balance
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--color-gold)" }}>
                  ₳ {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="wallet-dropdown-divider" />
              <button className="wallet-dropdown-item" onClick={() => { navigator.clipboard.writeText(address); setDropdownOpen(false); }}>
                <WalletIcon /> Copy Address
              </button>
              <button
                className="wallet-dropdown-item"
                onClick={() => { window.open(`https://polygonscan.com/address/${address}`, "_blank"); setDropdownOpen(false); }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 1H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1h4v4M11 1L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                View on Explorer
              </button>
              <div className="wallet-dropdown-divider" />
              <button className="wallet-dropdown-item wallet-dropdown-item--danger" onClick={() => { disconnect(); setDropdownOpen(false); }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 6h6M8 4l2 2-2 2M7 1H3a2 2 0 00-2 2v6a2 2 0 002 2h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Error message from wagmi or local
  const errorMsg = localError || (connectError ? connectError.message.split("\n")[0] : null);

  return (
    <div className="wallet-connect-wrapper" ref={dropdownRef}>
      <button
        className="wallet-btn-connect"
        onClick={() => {
          setLocalError(null);
          if (connectors.length === 0) {
            setLocalError("No wallet detected. Install MetaMask or another wallet extension.");
            return;
          }
          if (connectors.length === 1) {
            connect(
              { connector: connectors[0] },
              {
                onError: (err) =>
                  setLocalError(err.message.split("\n")[0]),
              },
            );
          } else {
            setShowConnectors((v) => !v);
          }
        }}
      >
        <WalletIcon />
        Connect Wallet
      </button>

      {/* Error toast */}
      {errorMsg && (
        <div className="wallet-error-toast">{errorMsg}</div>
      )}

      {/* Connector picker when multiple connectors are available */}
      <AnimatePresence>
        {showConnectors && connectors.length > 1 && (
          <motion.div
            className="wallet-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                className="wallet-dropdown-item"
                onClick={() => {
                  setShowConnectors(false);
                  setLocalError(null);
                  connect(
                    { connector },
                    {
                      onError: (err) =>
                        setLocalError(err.message.split("\n")[0]),
                    },
                  );
                }}
              >
                {connector.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleNotificationPanel = useUIStore((s) => s.toggleNotificationPanel);
  const notifications = useUIStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="topbar">
        <div className="chrome-inner">
          {/* Logo */}
          <Link href="/" className="wordmark" style={{ flexShrink: 0 }}>
            AGENT<span>ARENA</span>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden lg:flex items-center gap-1" style={{ flex: 1, justifyContent: "center" }}>
            {NAV_LINKS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono text-[9px] tracking-[2px] uppercase px-3 py-1.5 rounded transition-colors ${
                    active
                      ? "text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                      : "text-[var(--color-stone)] hover:text-[var(--color-parchment)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            <button
              className="btn relative"
              onClick={toggleNotificationPanel}
              aria-label="Notifications"
              style={{ padding: "6px 8px" }}
            >
              <span style={{ fontSize: 13 }}>🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-red)] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="hidden sm:block">
              <WalletButton />
            </div>

            {/* Mobile hamburger */}
            <button
              className="btn lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ padding: "6px 10px", fontSize: 16 }}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[56px] z-[999] bg-[var(--color-deep)]/98 backdrop-blur-lg border-b border-[var(--color-border)] lg:hidden"
            style={{ maxHeight: "calc(100vh - 56px)", overflowY: "auto" }}
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded font-mono text-[11px] tracking-[2px] uppercase transition-colors ${
                      active
                        ? "bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold-dim)]"
                        : "text-[var(--color-parchment)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ivory)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 mt-2 border-t border-[var(--color-border)]/30 sm:hidden">
                <WalletButton />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
