'use client'

import { HexPortrait } from './HexPortrait'

type AgentStatus = 'live' | 'idle' | 'thinking' | 'victory' | 'bankrupt' | 'battling' | 'breeding' | 'resting' | 'training' | 'eliminated'

type TierName = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Legendary'

function getTier(elo: number): { name: TierName; color: string } {
  if (elo >= 2500) return { name: 'Legendary', color: 'var(--color-gold-hi)' }
  if (elo >= 2000) return { name: 'Gold', color: 'var(--color-gold)' }
  if (elo >= 1500) return { name: 'Silver', color: 'var(--color-cream)' }
  if (elo >= 1000) return { name: 'Bronze', color: 'var(--color-bronze)' }
  return { name: 'Iron', color: 'var(--color-dim)' }
}

interface AgentPassportProps {
  agent: {
    id: string
    name: string
    elo: number
    level?: number
    winRate?: number
    totalEarned?: number
    combatStyle?: string
    status?: AgentStatus
    skills?: Array<{ skillType: string; equipped?: boolean }>
    imageUrl?: string
    accent?: string
  }
  size?: 'compact' | 'full'
  showActivity?: boolean
  interactive?: boolean
  onClick?: () => void
}

function StatPill({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 10px',
        border: '1px solid var(--color-border)',
        borderRadius: 2,
        background: 'rgba(24, 21, 28, 0.6)',
        minWidth: 0,
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-ash)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: accent || 'var(--color-cream)' }}>
        {value}
      </span>
    </div>
  )
}

export function AgentPassport({ agent, size = 'compact', interactive, onClick }: AgentPassportProps) {
  const tier = getTier(agent.elo)
  const winRate = agent.winRate != null ? `${Math.round(agent.winRate * 100)}%` : '—'
  const earned = agent.totalEarned != null ? `₳ ${agent.totalEarned.toLocaleString()}` : '—'

  if (size === 'compact') {
    return (
      <div
        onClick={interactive ? onClick : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          background: 'rgba(24, 21, 28, 0.88)',
          cursor: interactive ? 'pointer' : 'default',
          transition: 'border-color 0.2s',
          maxWidth: 340,
        }}
        onMouseEnter={(e) => interactive && (e.currentTarget.style.borderColor = 'var(--color-gold-lo)')}
        onMouseLeave={(e) => interactive && (e.currentTarget.style.borderColor = 'var(--color-border)')}
      >
        <HexPortrait
          name={agent.name}
          size={56}
          accent={agent.accent || tier.color}
          imageUrl={agent.imageUrl}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--color-ivory)' }}>
              {agent.name}
            </span>
            {agent.combatStyle && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-stone)' }}>
                {agent.combatStyle}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatPill label="ELO" value={agent.elo.toLocaleString()} accent={tier.color} />
            <StatPill label="W/R" value={winRate} />
            <StatPill label="EARNED" value={earned} accent="var(--color-gold)" />
          </div>
        </div>
        {/* Tier seal */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: tier.color,
            opacity: 0.6,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {tier.name}
        </span>
      </div>
    )
  }

  // Full size
  return (
    <div
      style={{
        width: 400,
        border: '1px solid var(--color-border)',
        borderRadius: 4,
        background: 'rgba(24, 21, 28, 0.88)',
        overflow: 'hidden',
      }}
    >
      {/* Portrait area */}
      <div
        style={{
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(ellipse at center, ${tier.color}11 0%, transparent 70%)`,
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        <HexPortrait
          name={agent.name}
          size={120}
          accent={agent.accent || tier.color}
          imageUrl={agent.imageUrl}
          pulse
        />
        {/* Level badge */}
        {agent.level != null && (
          <span
            style={{
              position: 'absolute',
              bottom: 12,
              right: 16,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-stone)',
            }}
          >
            LVL {agent.level}
          </span>
        )}
        {/* Tier seal */}
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: tier.color,
            border: `1px solid ${tier.color}40`,
            padding: '4px 8px',
            borderRadius: 2,
          }}
        >
          {tier.name}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--color-ivory)', margin: 0 }}>
            {agent.name}
          </h3>
          {agent.combatStyle && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontStyle: 'italic', color: 'var(--color-stone)' }}>
              {agent.combatStyle}
            </span>
          )}
        </div>

        {/* Three-column stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <StatPill label="ELO" value={agent.elo.toLocaleString()} accent={tier.color} />
          <StatPill label="WIN RATE" value={winRate} />
          <StatPill label="EARNED" value={earned} accent="var(--color-gold)" />
        </div>

        {/* Skills */}
        {agent.skills && agent.skills.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {agent.skills.map((s, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '4px 8px',
                  borderRadius: 2,
                  border: `1px solid ${s.equipped ? 'var(--color-teal-dim)' : 'var(--color-border)'}`,
                  color: s.equipped ? 'var(--color-teal)' : 'var(--color-stone)',
                  background: s.equipped ? 'rgba(44, 92, 88, 0.15)' : 'transparent',
                }}
              >
                {s.skillType}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
