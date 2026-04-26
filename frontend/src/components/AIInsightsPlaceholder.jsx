const style = {
  background: 'var(--navy)',
  border: '1px solid var(--navy-mid)',
  borderRadius: 'var(--radius-card)',
  padding: '1.75rem 2rem',
  height: '100%',
  minHeight: 260,
  display: 'flex',
  flexDirection: 'column',
}

const headingStyle = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  fontSize: '1.25rem',
  letterSpacing: '-0.02em',
  color: 'var(--yellow)',
  marginBottom: '0.5rem',
}

const subStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 300,
  fontSize: '0.8rem',
  color: 'var(--lavender)',
}

const chipStyle = {
  display: 'inline-block',
  background: 'var(--navy-mid)',
  color: 'var(--lavender)',
  borderRadius: 'var(--radius-pill)',
  padding: '0.3em 0.85em',
  fontSize: '0.72rem',
  fontFamily: 'var(--font-sans)',
  fontWeight: 400,
  marginTop: '1.25rem',
}

export default function AIInsightsPlaceholder() {
  return (
    <div style={style}>
      <p style={headingStyle}>AI Insights</p>
      <p style={subStyle}>powered by llama3.1 via Ollama — coming next</p>
      <span style={chipStyle}>● ollama not yet connected</span>
    </div>
  )
}
