'use client'

import { BrassRule } from './BrassRule'

type TxType = 'bet_placed' | 'bet_won' | 'bet_lost' | 'match_bonus' | 'skill_buy' | 'nft_update' | 'breed' | 'tournament'

interface TransactionEntry {
  id: string
  timestamp: Date
  type: TxType
  description: string
  value?: string
  txHash?: string
}

const TX_CONFIG: Record<TxType, { icon: string; color: string }> = {
  bet_placed: { icon: '✦', color: 'var(--color-gold)' },
  bet_won: { icon: '✦', color: 'var(--color-teal)' },
  bet_lost: { icon: '✦', color: 'var(--color-blood)' },
  match_bonus: { icon: '◆', color: 'var(--color-teal)' },
  skill_buy: { icon: '◈', color: 'var(--color-amber)' },
  nft_update: { icon: '◇', color: 'var(--color-gold)' },
  breed: { icon: '◈', color: 'var(--color-bronze)' },
  tournament: { icon: '◆', color: 'var(--color-gold)' },
}

interface TransactionLogProps {
  entries: TransactionEntry[]
  maxItems?: number
}

export function TransactionLog({ entries, maxItems = 50 }: TransactionLogProps) {
  const visible = entries.slice(0, maxItems)

  return (
    <div>
      <BrassRule label="TRANSACTION HISTORY" />
      <div style={{ overflow: 'auto' }}>
        {visible.map((entry) => {
          const cfg = TX_CONFIG[entry.type]
          const date = entry.timestamp instanceof Date
            ? entry.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ''
          const time = entry.timestamp instanceof Date
            ? entry.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
            : ''

          return (
            <div
              key={entry.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 42px 16px 1fr auto auto',
                gap: 8,
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                cursor: entry.txHash ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (entry.txHash) window.open(`https://polygonscan.com/tx/${entry.txHash}`, '_blank')
              }}
            >
              <span style={{ color: 'var(--color-ash)', fontSize: 10 }}>{date}</span>
              <span style={{ color: 'var(--color-ash)', fontSize: 10 }}>{time}</span>
              <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.icon}</span>
              <span style={{ color: 'var(--color-cream)' }}>{entry.description}</span>
              {entry.value && (
                <span style={{ color: cfg.color, fontWeight: 500 }}>{entry.value}</span>
              )}
              {entry.txHash && (
                <span style={{ color: 'var(--color-teal)', fontSize: 10 }}>⬡</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { TransactionEntry, TxType }
