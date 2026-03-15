"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useWalletStore } from "@/lib/stores/walletStore";
import { useBettingStore } from "@/lib/stores";
import { useWorldStore } from "@/lib/worldStore";

export function BalanceBar() {
  const arenaBalance = useWalletStore((s) => s.arenaBalance);
  const ethBalance = useWalletStore((s) => s.ethBalance);
  const maticBalance = useWalletStore((s) => s.maticBalance);
  const activeBets = useBettingStore((s) => s.activeBets);
  const liveMatches = useWorldStore((s) => s.liveMatches);
  const spectatorCount = useWorldStore((s) => s.spectatorCount);

  const liveCount = liveMatches.filter((m) => m.status === "live").length;
  const activeBetCount = activeBets.filter((b) => !b.revealed).length;

  return (
    <div className="balancebar">
      <div className="chrome-inner">
        {/* Left: Network status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-teal-light)",
              boxShadow: "0 0 8px var(--color-teal-light)",
              display: "inline-block",
            }}
          />
          <span className="mono muted" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Live Network
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--color-gold)" }}>
            {spectatorCount.toLocaleString()} watching
          </span>
        </div>

        {/* Center: Balances */}
        <div className="nav-row">
          <div className="nav-pill active mono" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--color-gold)", fontSize: 10 }}>ARENA</span>
            <AnimatedCounter
              value={parseFloat(arenaBalance) || 0}
              decimals={2}
              color="var(--color-gold)"
            />
          </div>
          <div className="nav-pill mono" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--color-teal-light)", fontSize: 10 }}>ETH</span>
            <AnimatedCounter
              value={parseFloat(ethBalance) || 0}
              decimals={4}
              color="var(--color-teal-light)"
            />
          </div>
          <div className="nav-pill mono" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--color-copper)", fontSize: 10 }}>MATIC</span>
            <AnimatedCounter
              value={parseFloat(maticBalance) || 0}
              decimals={2}
              color="var(--color-copper)"
            />
          </div>
        </div>

        {/* Right: Stats */}
        <div className="nav-row">
          <div className="nav-pill mono">
            <span style={{ color: "var(--color-amber)" }}>{activeBetCount}</span> active bet{activeBetCount !== 1 ? "s" : ""}
          </div>
          <div className="nav-pill mono">
            <span style={{ color: "var(--color-gold)" }}>{liveCount}</span> match{liveCount !== 1 ? "es" : ""} live
          </div>
        </div>
      </div>
    </div>
  );
}
