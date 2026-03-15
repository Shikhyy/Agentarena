'use client'

import { useEffect, useRef, useState } from 'react'

interface EloCounterProps {
  value: number
  duration?: number
  accent?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { fontSize: 14, fontWeight: 500 },
  md: { fontSize: 28, fontWeight: 500 },
  lg: { fontSize: 40, fontWeight: 500 },
}

export function EloCounter({ value, duration = 600, accent, size = 'md' }: EloCounterProps) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    if (from === to) return

    const start = performance.now()
    const diff = to - from

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    prevRef.current = to
  }, [value, duration])

  const style = SIZES[size]

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: accent || 'var(--color-cream)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {display.toLocaleString()}
    </span>
  )
}
