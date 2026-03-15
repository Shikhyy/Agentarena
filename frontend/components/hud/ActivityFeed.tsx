'use client'

import { useRef, useEffect } from 'react'
import { ActivityFeedRow, type ActivityEvent } from '../ui/ActivityFeedRow'
import { BrassRule } from '../ui/BrassRule'

interface ActivityFeedProps {
  agentId: string
  agentName?: string
  events: ActivityEvent[]
  maxItems?: number
  showTransactionLinks?: boolean
}

export function ActivityFeed({
  agentName,
  events,
  maxItems = 50,
  showTransactionLinks = true,
}: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [events.length])

  const visible = events.slice(0, maxItems)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'rgba(16, 14, 19, 0.95)',
        borderLeft: '1px solid var(--color-border)',
      }}
    >
      <div style={{ padding: '12px 14px 0' }}>
        <BrassRule label={agentName ? `${agentName} — LIVE ACTIVITY` : 'LIVE ACTIVITY'} />
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 14px',
        }}
      >
        {visible.map((event) => (
          <ActivityFeedRow
            key={event.id}
            event={event}
            showTransactionLinks={showTransactionLinks}
          />
        ))}
        {visible.length === 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-dim)', textAlign: 'center', padding: '24px 0' }}>
            Waiting for activity...
          </p>
        )}
      </div>
    </div>
  )
}
