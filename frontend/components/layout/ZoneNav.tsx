"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useWorldStore, WORLD_ZONES, type WorldZone } from "@/lib/worldStore";

/** Maps zone IDs to the Next.js route they should navigate to. */
const ZONE_ROUTES: Record<WorldZone, string> = {
  "central-nexus": "/world",
  "arena-chess": "/world/arena/chess",
  "arena-poker": "/world/arena/poker",
  "arena-monopoly": "/world/arena/monopoly",
  workshop: "/builder",
  marketplace: "/marketplace",
  "hall-of-fame": "/leaderboard",
  "grand-arena": "/tournaments",
  "archive": "/archive",
  "sky-deck": "/sky-deck",
};

/** The zones to display in the nav bar (subset / reordered for UX). */
const ZONE_NAV_ITEMS: { id: WorldZone; shortLabel: string }[] = [
  { id: "central-nexus", shortLabel: "Nexus" },
  { id: "arena-chess", shortLabel: "Chess" },
  { id: "arena-poker", shortLabel: "Poker" },
  { id: "arena-monopoly", shortLabel: "Monopoly" },
  { id: "workshop", shortLabel: "Workshop" },
  { id: "marketplace", shortLabel: "Market" },
  { id: "hall-of-fame", shortLabel: "Archive" },
  { id: "grand-arena", shortLabel: "Sky Deck" },
  { id: "archive", shortLabel: "Archive" },
  { id: "sky-deck", shortLabel: "Sky Deck" },
];

export function ZoneNav() {
  const pathname = usePathname();
  const currentZone = useWorldStore((s) => s.currentZone);
  const teleportToZone = useWorldStore((s) => s.teleportToZone);
  const liveMatches = useWorldStore((s) => s.liveMatches);

  const handleZoneClick = (zoneId: WorldZone) => {
    teleportToZone(zoneId);
  };

  return (
    <footer className="zonebar">
      <div className="chrome-inner">
        <nav
          className="nav-row"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          {ZONE_NAV_ITEMS.map((item) => {
            const route = ZONE_ROUTES[item.id];
            const zoneConfig = WORLD_ZONES.find((z) => z.id === item.id);
            const active = currentZone === item.id;
            const matchesInZone = liveMatches.filter(
              (m) => m.zone === item.id && m.status === "live"
            ).length;

            return (
              <Link
                key={item.id}
                href={route}
                className={`nav-pill ${active ? "active" : ""}`}
                onClick={() => handleZoneClick(item.id)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  borderColor: active ? zoneConfig?.color : undefined,
                  color: active ? zoneConfig?.color : undefined,
                }}
              >
                <span style={{ fontSize: 13 }}>{zoneConfig?.icon}</span>
                <span>{item.shortLabel}</span>

                {/* Live match indicator */}
                {matchesInZone > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      boxShadow: "0 0 8px var(--color-gold)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
