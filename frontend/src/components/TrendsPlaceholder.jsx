const style = {
  background: 'var(--white)',
  border: '1px solid var(--lavender-mid)',
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
  color: 'var(--navy)',
  marginBottom: '0.5rem',
}

const subStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 300,
  fontSize: '0.8rem',
  color: 'var(--gray-text)',
}

export default function TrendsPlaceholder() {
  return (
    <div style={style}>
      <p style={headingStyle}>Signup &amp; Activation Trends</p>
      <p style={subStyle}>monthly cohort chart — coming next</p>
      <div style={{
        flex: 1,
        marginTop: '1.25rem',
        borderRadius: 10,
        background: 'var(--lavender)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="spinner" />
      </div>
    </div>
  )
}
