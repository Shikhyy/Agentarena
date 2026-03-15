'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

type TickerItem = {
  label: string
  value: string
  accent?: string
}

export function TickerBar() {
  const [items, setItems] = useState<TickerItem[]>([
    { label: '$ARENA', value: '$0.42', accent: 'var(--color-teal)' },
    { label: 'POOL', value: '$0', accent: 'var(--color-gold)' },
    { label: 'AGENTS', value: '0 active', accent: 'var(--color-teal)' },
    { label: 'NETWORK', value: 'Polygon zkEVM' },
  ])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [stats, token] = await Promise.all([
          apiGet('/stats').catch(() => ({})),
          apiGet('/token/price').catch(() => ({})),
        ])
        const price = Number(token.price_usd ?? 0)
        const change = Number(token.change_24h_pct ?? 0)
        setItems([
          { label: '$ARENA', value: `$${price.toFixed(2)} ${change >= 0 ? '+' : ''}${change.toFixed(1)}%`, accent: change >= 0 ? 'var(--color-teal)' : 'var(--color-red)' },
          { label: 'POOL', value: `$${Number(stats.pool_volume_usd || 0).toLocaleString()}`, accent: 'var(--color-gold)' },
          { label: 'AGENTS', value: `${Number(stats.total_agents || 0).toLocaleString()} active`, accent: 'var(--color-teal)' },
          { label: 'GAS', value: '14 gwei' },
          { label: 'NETWORK', value: '12ms' },
        ])
      } catch { /* keep defaults */ }
    }
    fetch()
    const t = setInterval(fetch, 15000)
    return () => clearInterval(t)
  }, [])

  const doubled = [...items, ...items]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 28,
        zIndex: 350,
        overflow: 'hidden',
        borderTop: '1px solid var(--color-border)',
        background: 'rgba(9, 8, 11, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          whiteSpace: 'nowrap',
          animation: 'ticker-scroll 30s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.05em',
              marginRight: 40,
              color: 'var(--color-stone)',
            }}
          >
            <strong style={{ color: item.accent || 'var(--color-stone)' }}>{item.label}</strong>
            {' '}
            <span style={{ color: 'var(--color-cream)' }}>{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
