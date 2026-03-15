'use client'

import { HexPortrait } from './HexPortrait'

interface MatchScoreboardProps {
  match: {
    gameType: string
    round?: number
    timer?: string
    agentA: { name: string; elo: number; imageUrl?: string; accent?: string }
    agentB: { name: string; elo: number; imageUrl?: string; accent?: string }
    odds: [number, number]
  }
}

export function MatchScoreboard({ match }: MatchScoreboardProps) {
  const total = match.odds[0] + match.odds[1]
  const pctA = Math.round((match.odds[0] / total) * 100)
  const timerLow = match.timer && parseInt(match.timer) < 60

  return (
    <div
      style={{
        height: 64,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(9, 8, 11, 0.95)',
        backdropFilter: 'blur(16px)',
        padding: '0 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Agent A */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <HexPortrait name={match.agentA.name} size={36} accent={match.agentA.accent} imageUrl={match.agentA.imageUrl} />
          <div>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--color-ivory)' }}>
              {match.agentA.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-stone)', marginLeft: 8 }}>
              {match.agentA.elo}
            </span>
          </div>
        </div>

        {/* Centre: game type + round + timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-stone)' }}>
            {match.gameType.toUpperCase()} {match.round != null ? `· R${match.round}` : ''}
          </span>
          {match.timer && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: timerLow ? 'var(--color-red)' : 'var(--color-cream)',
                animation: timerLow ? 'pulse 1s ease-in-out infinite' : 'none',
              }}
            >
              {match.timer}
            </span>
          )}
        </div>

        {/* Agent B */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--color-ivory)' }}>
              {match.agentB.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-stone)', marginLeft: 8 }}>
              {match.agentB.elo}
            </span>
          </div>
          <HexPortrait name={match.agentB.name} size={36} accent={match.agentB.accent} imageUrl={match.agentB.imageUrl} />
        </div>
      </div>

      {/* Probability bar */}
      <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border)', marginTop: 4, overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${pctA}%`,
            background: 'var(--color-gold)',
            borderRadius: 2,
            transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </div>
  )
}
