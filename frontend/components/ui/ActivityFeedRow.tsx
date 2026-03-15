'use client'

export type ActivityEventType =
  | 'thinking'
  | 'move'
  | 'odds_shift'
  | 'transaction'
  | 'commentary'
  | 'zk_event'
  | 'nft_update'
  | 'match_found'
  | 'skill_purchase'
  | 'tournament'

export interface ActivityEvent {
  id: string
  timestamp: Date
  agentId: string
  type: ActivityEventType
  message: string
  value?: string
  txHash?: string
  quality?: number
}

const EVENT_ICONS: Record<ActivityEventType, string> = {
  thinking: '●',
  move: '◆',
  odds_shift: '▲',
  transaction: '✦',
  commentary: '◈',
  zk_event: '⬡',
  nft_update: '◇',
  match_found: '◆',
  skill_purchase: '✦',
  tournament: '✦',
}

const EVENT_COLORS: Record<ActivityEventType, string> = {
  thinking: 'var(--color-dim)',
  move: 'var(--color-cream)',
  odds_shift: 'var(--color-amber)',
  transaction: 'var(--color-gold)',
  commentary: 'var(--color-stone)',
  zk_event: 'var(--color-teal)',
  nft_update: 'var(--color-gold-hi)',
  match_found: 'var(--color-teal)',
  skill_purchase: 'var(--color-amber)',
  tournament: 'var(--color-gold)',
}

interface ActivityFeedRowProps {
  event: ActivityEvent
  showTransactionLinks?: boolean
}

export function ActivityFeedRow({ event, showTransactionLinks }: ActivityFeedRowProps) {
  const time = event.timestamp instanceof Date
    ? event.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    : ''
  const icon = EVENT_ICONS[event.type]
  const color = EVENT_COLORS[event.type]
  const isCommentary = event.type === 'commentary'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '42px 16px 1fr auto',
        gap: 8,
        alignItems: 'start',
        padding: '6px 0',
        borderBottom: '1px solid var(--color-border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        lineHeight: 1.4,
      }}
    >
      <span style={{ color: 'var(--color-ash)', fontSize: 10 }}>{time}</span>
      <span style={{ color, fontSize: 12 }}>{icon}</span>
      <span style={{ color, fontStyle: isCommentary ? 'italic' : 'normal' }}>
        {event.message}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {event.value && (
          <span style={{ color: 'var(--color-gold)', fontSize: 10, fontWeight: 500 }}>
            {event.value}
          </span>
        )}
        {showTransactionLinks && event.txHash && (
          <a
            href={`https://polygonscan.com/tx/${event.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-teal)', fontSize: 10 }}
            title={event.txHash}
          >
            ⬡
          </a>
        )}
      </div>
    </div>
  )
}
