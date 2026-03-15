'use client'

import { BrassRule } from './BrassRule'

interface BettingTerminalProps {
  match: {
    id: string
    gameType: string
    agentA: { name: string; elo: number }
    agentB: { name: string; elo: number }
    odds: [number, number]
  }
  spectatorMode?: boolean
  agentMode?: boolean
  agentBet?: { amount: number; odds: number; potential: number; zkStatus: string }
  onBet?: (agent: 'a' | 'b', amount: number) => void
}

function OddsSplitBar({ odds }: { odds: [number, number] }) {
  const total = odds[0] + odds[1]
  const pctA = Math.round((odds[0] / total) * 100)

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-gold)' }}>{pctA}%</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-stone)' }}>{100 - pctA}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
        <div
          style={{
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

const CHIP_AMOUNTS = [1, 10, 25, 50]

export function BettingTerminal({ match, spectatorMode, agentMode, agentBet, onBet }: BettingTerminalProps) {
  return (
    <div
      style={{
        padding: 16,
        background: 'rgba(16, 14, 19, 0.95)',
        border: '1px solid var(--color-border)',
        borderRadius: 4,
      }}
    >
      <BrassRule label="BETTING" />

      {/* Odds display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, fontStyle: 'italic', color: 'var(--color-ivory)' }}>
          {match.agentA.name}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-dim)' }}>vs</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, fontStyle: 'italic', color: 'var(--color-ivory)' }}>
          {match.agentB.name}
        </span>
      </div>

      <OddsSplitBar odds={match.odds} />

      {/* Agent autonomous bet status */}
      {agentMode && agentBet && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: '1px solid var(--color-gold-lo)',
            borderRadius: 4,
            background: 'rgba(122, 90, 34, 0.08)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold)', marginBottom: 4 }}>
            ✦ Auto-bet: {agentBet.amount} ₳ at {agentBet.odds}×
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-teal)' }}>
            ⬡ {agentBet.zkStatus}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-stone)', marginTop: 4 }}>
            Potential: +{agentBet.potential.toFixed(1)} ₳
          </div>
        </div>
      )}

      {/* Spectator bet UI */}
      {spectatorMode && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button
              className="btn"
              style={{ flex: 1, fontSize: 11, padding: '8px', color: 'var(--color-gold)' }}
            >
              {match.agentA.name}
            </button>
            <button
              className="btn"
              style={{ flex: 1, fontSize: 11, padding: '8px' }}
            >
              {match.agentB.name}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {CHIP_AMOUNTS.map((amt) => (
              <button
                key={amt}
                className="btn"
                style={{ flex: 1, fontSize: 11, padding: '8px 4px', textAlign: 'center' }}
                onClick={() => onBet?.('a', amt)}
              >
                {amt}
              </button>
            ))}
            <button
              className="btn btn-primary"
              style={{ flex: 1, fontSize: 11, padding: '8px 4px' }}
              onClick={() => onBet?.('a', 999)}
            >
              ALL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { OddsSplitBar }
