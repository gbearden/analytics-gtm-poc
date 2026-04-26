const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const bandStyle = {
  background: 'var(--yellow)',
  borderBottom: '1px solid var(--yellow-dark)',
  padding: '1.25rem 2.5rem 1.5rem',
  display: 'flex',
  alignItems: 'baseline',
  gap: '1rem',
}

const headlineStyle = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 800,
  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
  color: 'var(--navy)',
  letterSpacing: '-0.02em',
  lineHeight: 1,
}

const datlineStyle = {
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontWeight: 700,
  fontSize: '1rem',
  color: 'var(--navy-mid)',
  letterSpacing: '-0.01em',
}

export default function HeroBand() {
  return (
    <div style={bandStyle}>
      <h1 style={headlineStyle}>GTM Performance</h1>
      <span style={datlineStyle}>{monthYear}</span>
    </div>
  )
}
