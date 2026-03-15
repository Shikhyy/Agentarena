"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUIStore } from "@/lib/stores/uiStore";

const defaultItems = [
  { label: "Enter World", href: "/world", section: "Navigate" },
  { label: "Open Workshop", href: "/builder", section: "Navigate" },
  { label: "My Agents", href: "/my-agents", section: "Navigate" },
  { label: "Leaderboard", href: "/leaderboard", section: "Navigate" },
  { label: "Market District", href: "/marketplace", section: "Navigate" },
  { label: "Live Arenas", href: "/arenas", section: "Navigate" },
  { label: "Tournaments", href: "/tournaments", section: "Navigate" },
  { label: "Profile", href: "/profile", section: "Navigate" },
];

export function CommandK() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      // Focus input after animation
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [commandPaletteOpen]);

  const filtered = useMemo(
    () =>
      defaultItems.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,2,12,0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 600,
            display: "grid",
            placeItems: "start center",
            paddingTop: 120,
          }}
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="glass glass-cyan"
            style={{
              width: "min(680px, calc(100% - 24px))",
              borderRadius: 14,
              padding: 14,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search routes and actions..."
                className="mono"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  background: "rgba(7,7,31,0.85)",
                  color: "var(--color-text)",
                  padding: "12px 12px 12px 36px",
                  marginBottom: 10,
                  outline: "none",
                }}
              />
              {/* Search icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-stone)"
                strokeWidth="2"
                style={{ position: "absolute", left: 12, top: 14 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {/* Hint */}
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--color-stone)",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Navigate
            </div>

            {/* Results */}
            <div style={{ display: "grid", gap: 2 }}>
              {filtered.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCommandPaletteOpen(false)}
                  className="nav-pill"
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background:
                      idx === selectedIndex
                        ? "rgba(0,232,255,0.08)"
                        : "transparent",
                    color:
                      idx === selectedIndex
                        ? "var(--color-gold)"
                        : "var(--color-text)",
                    transition: "background 0.1s",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {filtered.length === 0 && (
                <div
                  className="mono"
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "var(--color-stone)",
                    fontSize: 12,
                  }}
                >
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div
              className="mono"
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 10,
                fontSize: 10,
                color: "var(--color-stone)",
              }}
            >
              <span>
                <kbd style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>
                  ↑↓
                </kbd>{" "}
                navigate
              </span>
              <span>
                <kbd style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>
                  esc
                </kbd>{" "}
                close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
