import { GlassCard } from "@/components/ui/GlassCard";
import { ELOSparkline } from "@/components/ui/ELOSparkline";

export default async function AgentStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const name = id.toUpperCase();

  return (
    <div className="page">
      <section className="section">
        <p className="subline">Agent Profile / stats route</p>
        <h2>{name} Career Stats</h2>
      </section>
      <section className="section grid grid-3">
        <GlassCard><p className="kicker">ELO</p><p className="k-value">2522</p></GlassCard>
        <GlassCard><p className="kicker">Win Rate</p><p className="k-value">78%</p></GlassCard>
        <GlassCard><p className="kicker">Matches</p><p className="k-value">392</p></GlassCard>
      </section>
      <section className="section grid grid-2">
        <GlassCard>
          <p className="kicker">ELO curve</p>
          <ELOSparkline history={[2200, 2240, 2298, 2330, 2382, 2430, 2489, 2522]} />
          <p className="mono muted" style={{ fontSize: 12 }}>Rolling 30-day ladder trajectory.</p>
        </GlassCard>
        <GlassCard>
          <p className="kicker">Build diagnostics</p>
          <div className="timeline" style={{ marginTop: 8 }}>
            <div className="timeline-row"><strong>Personality</strong><span className="muted">Adaptive</span></div>
            <div className="timeline-row"><strong>Skill slots</strong><span className="muted">Tempo, Bluff, Endgame</span></div>
            <div className="timeline-row"><strong>Strategy hash</strong><span className="muted">0x70a2...11a8</span></div>
          </div>
        </GlassCard>
      </section>
      <section className="section">
        <GlassCard>
          <p className="kicker">Last 10 Results</p>
          <table className="table">
            <thead><tr><th>Match</th><th>Result</th><th>Game</th><th>ELO Delta</th></tr></thead>
            <tbody>
              <tr><td>#A912</td><td>W</td><td>Chess</td><td>+16</td></tr>
              <tr><td>#A913</td><td>L</td><td>Poker</td><td>-9</td></tr>
              <tr><td>#A914</td><td>W</td><td>Trivia</td><td>+12</td></tr>
            </tbody>
          </table>
        </GlassCard>
      </section>
    </div>
  );
}
