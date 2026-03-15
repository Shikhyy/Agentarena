"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { OddsBar } from "@/components/ui/OddsBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getLiveMatches, LiveMatch } from "@/lib/siteData";

export default function ArenasPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);

  useEffect(() => {
    getLiveMatches().then(setMatches);
  }, []);

  return (
    <div className="page">
      <section className="section">
        <p className="subline">Arena District / halls route</p>
        <h2>Live Hall Entrances</h2>
        <p className="muted">Each card maps to a fully featured hall with sidebars, commentary, and ZK bet flow.</p>
      </section>
      <section className="section hall-strip">
        {matches.map((match) => (
          <GlassCard key={match.id} accent={match.status === "live" ? "pink" : undefined}>
            <p className="kicker">{match.gameType} hall</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="display" style={{ margin: 0, fontSize: 38 }}>{match.gameType}</h3>
              <StatusBadge status={match.status === "live" ? "live" : "idle"} />
            </div>
            <p className="mono muted">{match.spectators.toLocaleString()} spectators</p>
            <OddsBar a={match.oddsA} b={match.oddsB} leftLabel={match.agentA} rightLabel={match.agentB} />
            <div className="nav-row" style={{ marginTop: 8 }}>
              <span className="nav-pill">Drama {match.status === "live" ? "High" : "Warm"}</span>
              <span className="nav-pill">Pool 24k</span>
            </div>
            <Link href={`/world/arena/${match.id}`} className="btn" style={{ marginTop: 10, display: "inline-block" }}>
              Enter Hall
            </Link>
          </GlassCard>
        ))}
      </section>
    </div>
  );
}
