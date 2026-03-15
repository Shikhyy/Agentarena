'use client'

import { motion, AnimatePresence } from 'motion/react'
import { BrassRule } from './BrassRule'
import { EloCounter } from './EloCounter'

interface PostMatchOverlayProps {
  visible: boolean
  result: {
    winner: 'a' | 'b'
    agentName: string
    gameType: string
    round: number
    method: string
    eloBefore: number
    eloAfter: number
    winRateBefore: number
    winRateAfter: number
    winsBefore: number
    winsAfter: number
    matchBonus: number
    betPayout: number
    walletAddress?: string
  }
  onClose: () => void
}

export function PostMatchOverlay({ visible, result, onClose }: PostMatchOverlayProps) {
  const eloChange = result.eloAfter - result.eloBefore
  const totalEarnings = result.matchBonus + result.betPayout
  const isWin = result.winner === 'a'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(9, 8, 11, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              border: '1px solid var(--color-border)',
              borderRadius: 4,
              background: 'rgba(24, 21, 28, 0.98)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px 24px 16px',
                borderBottom: '1px solid var(--color-border)',
                textAlign: 'center',
              }}
            >
              <BrassRule label={isWin ? 'VICTORY' : 'DEFEAT'} colour={isWin ? 'gold' : 'dim'} />
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 48,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: isWin ? 'var(--color-gold-hi)' : 'var(--color-stone)',
                  margin: '8px 0 4px',
                }}
              >
                {result.agentName} {isWin ? 'Wins' : 'Falls'}
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-stone)', margin: 0 }}>
                {result.gameType} · Round {result.round} · {result.method}
              </p>
            </div>

            {/* Stats */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <span style={{ color: 'var(--color-stone)' }}>ELO</span>
                <span style={{ color: 'var(--color-ash)' }}>{result.eloBefore.toLocaleString()}</span>
                <span style={{ color: 'var(--color-stone)' }}>→</span>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <EloCounter value={result.eloAfter} size="sm" accent="var(--color-ivory)" />
                  <span style={{ color: eloChange >= 0 ? 'var(--color-teal)' : 'var(--color-red)', fontSize: 10 }}>
                    {eloChange >= 0 ? '+' : ''}{eloChange}
                  </span>
                </span>

                <span style={{ color: 'var(--color-stone)' }}>WIN RATE</span>
                <span style={{ color: 'var(--color-ash)' }}>{Math.round(result.winRateBefore * 100)}%</span>
                <span style={{ color: 'var(--color-stone)' }}>→</span>
                <span style={{ color: 'var(--color-ivory)' }}>{Math.round(result.winRateAfter * 100)}%</span>

                <span style={{ color: 'var(--color-stone)' }}>WINS</span>
                <span style={{ color: 'var(--color-ash)' }}>{result.winsBefore}</span>
                <span style={{ color: 'var(--color-stone)' }}>→</span>
                <span style={{ color: 'var(--color-ivory)' }}>{result.winsAfter}</span>
              </div>
            </div>

            {/* Earnings */}
            {isWin && (
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
                <BrassRule label="YOUR EARNINGS THIS MATCH" colour="teal" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  <span style={{ color: 'var(--color-stone)' }}>Match bonus</span>
                  <span style={{ color: 'var(--color-teal)' }}>+{result.matchBonus.toFixed(1)} ₳</span>
                  <span style={{ color: 'var(--color-stone)' }}>Bet payout</span>
                  <span style={{ color: 'var(--color-teal)' }}>+{result.betPayout.toFixed(1)} ₳</span>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ivory)' }}>TOTAL</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gold)' }}>+{totalEarnings.toFixed(1)} ₳</span>
                </div>
                {result.walletAddress && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ash)', margin: '8px 0 0' }}>
                    Sent to {result.walletAddress.slice(0, 6)}...{result.walletAddress.slice(-4)} automatically.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '16px 24px', display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={onClose}>
                View Match Log
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
                Return to World
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
