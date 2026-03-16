'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ActivityFeedRow, type ActivityEvent } from '../ui/ActivityFeedRow'
import { BrassRule } from '../ui/BrassRule'

interface ActivityFeedProps {
  agentId?: string
  agentName?: string
  events?: ActivityEvent[]
  maxItems?: number
  showTransactionLinks?: boolean
}

let _eventCounter = 0
function nextId() { return `af-${Date.now()}-${_eventCounter++}` }

export function ActivityFeed({
  agentName,
  events: externalEvents = [],
  maxItems = 50,
  showTransactionLinks = true,
}: ActivityFeedProps) {
  const [internalEvents, setInternalEvents] = useState<ActivityEvent[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const addEvent = useCallback(
    (event: ActivityEvent) => {
      setInternalEvents(prev => [event, ...prev].slice(0, maxItems))
    },
    [maxItems]
  )

  useEffect(() => {
    const handleBetCommitted = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {}
      addEvent({
        id: nextId(),
        type: 'transaction',
        message: `Agent auto-bet ${d.amount ?? '?'}₳ at ${d.odds ?? '?'}×`,
        timestamp: new Date(),
        agentId: d.agentId ?? 'unknown',
        autonomous: true,
        txHash: d.txHash,
      })
    }

    const handleBetSettled = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {}
      addEvent({
        id: nextId(),
        type: 'transaction',
        message: `+${d.amount ?? '?'}₳ payout`,
        value: d.amount ? `+${d.amount}₳` : undefined,
        timestamp: new Date(),
        agentId: d.agentId ?? 'unknown',
        autonomous: true,
        txHash: d.txHash,
      })
    }

    const handleNftUpdated = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {}
      addEvent({
        id: nextId(),
        type: 'nft_update',
        message: 'ELO updated on-chain',
        timestamp: new Date(),
        agentId: d.agentId ?? 'unknown',
        autonomous: true,
        txHash: d.txHash,
      })
    }

    const handleTransaction = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {}
      addEvent({
        id: nextId(),
        type: 'transaction',
        message: d.message ?? `Tx ${d.txHash ? d.txHash.slice(0, 8) + '…' : 'submitted'}`,
        value: d.value,
        timestamp: new Date(),
        agentId: d.agentId ?? 'unknown',
        autonomous: d.autonomous ?? true,
        txHash: d.txHash,
      })
    }

    window.addEventListener('agent:bet_committed', handleBetCommitted)
    window.addEventListener('agent:bet_settled', handleBetSettled)
    window.addEventListener('agent:nft_updated', handleNftUpdated)
    window.addEventListener('agent:transaction', handleTransaction)

    return () => {
      window.removeEventListener('agent:bet_committed', handleBetCommitted)
      window.removeEventListener('agent:bet_settled', handleBetSettled)
      window.removeEventListener('agent:nft_updated', handleNftUpdated)
      window.removeEventListener('agent:transaction', handleTransaction)
    }
  }, [addEvent])

  const allEvents = [...internalEvents, ...externalEvents].slice(0, maxItems)
  const count = allEvents.length

  return (
    <div
      style={{
        position: 'fixed',
        top: 120,
        right: 0,
        bottom: 0,
        width: 260,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(9, 8, 11, 0.96)',
        borderLeft: '1px solid var(--color-border)',
        backdropFilter: 'blur(12px)',
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            color: 'var(--color-stone)',
            textTransform: 'uppercase',
          }}>
            {agentName ? `${agentName} — ` : ''}Live Activity
          </span>
          {count > 0 && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              padding: '1px 6px',
              background: 'var(--color-gold-lo)',
              color: 'var(--color-gold)',
              borderRadius: 2,
            }}>
              {count}
            </span>
          )}
        </div>
        <div style={{ height: 1, background: 'var(--color-border)' }} />
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 14px 16px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-border) transparent',
        }}
      >
        <AnimatePresence initial={false}>
          {allEvents.length > 0 ? (
            allEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <ActivityFeedRow
                  event={event}
                  showTransactionLinks={showTransactionLinks}
                />
              </motion.div>
            ))
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-dim)',
                textAlign: 'center',
                padding: '32px 8px',
                lineHeight: 1.6,
              }}
            >
              Waiting for autonomous actions...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

