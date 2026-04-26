import { useState } from 'react'

export default function KPICard({ label, value, sub }) {
  const [hovered, setHovered] = useState(false)

  const cardStyle = {
    background: hovered ? 'var(--yellow)' : 'var(--white)',
    border: '1px solid var(--lavender-mid)',
    borderRadius: 'var(--radius-card)',
    padding: '1.5rem 1.75rem',
    transition: 'background 0.2s ease',
    cursor: 'default',
    flex: 1,
    minWidth: 0,
  }

  const labelStyle = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 300,
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--gray-text)',
    marginBottom: '0.6rem',
    display: 'block',
  }

  const valueStyle = {
    fontFamily: 'var(--font-serif)',
    fontWeight: 800,
    fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: 'var(--navy)',
    display: 'block',
  }

  const subStyle = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 300,
    fontSize: '0.75rem',
    color: 'var(--gray-text)',
    marginTop: '0.4rem',
    display: 'block',
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value ?? '—'}</span>
      {sub && <span style={subStyle}>{sub}</span>}
    </div>
  )
}
