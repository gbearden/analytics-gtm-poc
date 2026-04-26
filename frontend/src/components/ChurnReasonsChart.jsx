const cardStyle = {
  background: 'var(--white)',
  border: '1px solid var(--lavender-mid)',
  borderRadius: 'var(--radius-card)',
  padding: '1.75rem 2rem',
  height: '100%',
}

const headingStyle = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  fontSize: '1.25rem',
  letterSpacing: '-0.02em',
  color: 'var(--navy)',
  marginBottom: '0.25rem',
}

const subStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 300,
  fontSize: '0.78rem',
  color: 'var(--gray-text)',
  marginBottom: '1.5rem',
}

export default function ChurnReasonsChart({ reasons = [], loading }) {
  if (loading) return (
    <div style={cardStyle}>
      <p style={headingStyle}>Churn Reasons</p>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="spinner" />
      </div>
    </div>
  )

  const total = reasons.reduce((s, r) => s + r.count, 0)
  const maxCount = Math.max(...reasons.map(r => r.count), 1)

  return (
    <div style={cardStyle}>
      <p style={headingStyle}>Churn Reasons</p>
      <p style={subStyle}>{total} churned · renewal period</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {reasons.map(({ reason, count }) => {
          const pct = Math.round(count / total * 100)
          const barW = Math.round(count / maxCount * 100)
          const label = reason.replace(/_/g, ' ')

          return (
            <div key={reason}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: '0.8rem',
                  color: 'var(--navy)',
                  textTransform: 'lowercase',
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'var(--navy)',
                }}>
                  {pct}%
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    fontSize: '0.7rem',
                    color: 'var(--gray-text)',
                    marginLeft: '0.3rem',
                  }}>
                    ({count})
                  </span>
                </span>
              </div>
              {/* Track */}
              <div style={{
                height: 7,
                background: 'var(--lavender)',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                {/* Fill */}
                <div style={{
                  height: '100%',
                  width: `${barW}%`,
                  background: 'var(--navy)',
                  borderRadius: 4,
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
