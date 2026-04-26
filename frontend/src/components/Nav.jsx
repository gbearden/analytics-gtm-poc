const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})

const navStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0,
  zIndex: 100,
  height: 56,
  background: 'var(--yellow)',
  borderBottom: '1px solid var(--yellow-dark)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2.5rem',
}

const wordmarkStyle = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 800,
  fontSize: '1.05rem',
  color: 'var(--navy)',
  letterSpacing: '-0.02em',
}

const dateStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 300,
  fontSize: '0.8rem',
  color: 'var(--navy)',
  letterSpacing: '0.01em',
}

export default function Nav() {
  return (
    <nav style={navStyle}>
      <span style={wordmarkStyle}>learned analytics</span>
      <span style={dateStyle}>{today.toLowerCase()}</span>
    </nav>
  )
}
