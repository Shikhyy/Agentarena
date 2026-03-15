'use client'

interface BrassRuleProps {
  label: string
  colour?: 'gold' | 'teal' | 'amber' | 'dim'
}

export function BrassRule({ label, colour = 'gold' }: BrassRuleProps) {
  const variant = colour !== 'gold' ? ` brass-rule--${colour}` : ''

  return (
    <div className={`brass-rule${variant}`}>
      <span className="brass-rule-label">{label}</span>
    </div>
  )
}
