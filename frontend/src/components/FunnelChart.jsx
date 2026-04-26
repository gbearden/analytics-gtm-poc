import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'

function funnelBarWidth(stages, idx) {
  // Each stage width is capped so the funnel never widens.
  // Base width derived from the stage's own rate (0→5%, 100→95%).
  const natural = stages[idx].rate * 0.9 + 5
  if (idx === 0) return natural
  const prev = funnelBarWidth(stages, idx - 1)
  return Math.min(prev, natural)
}

function dropOff(stages, idx) {
  if (idx === 0) return null
  const prev = stages[idx - 1]
  const curr = stages[idx]
  if (prev.count === curr.count) return null
  // Skip when consecutive stages measure different units (e.g., teachers vs schools).
  // Heuristic: if totals differ by more than 3×, they can't be directly compared.
  if (prev.total > curr.total * 3 || curr.total > prev.total * 3) return null
  const pct = ((prev.count - curr.count) / prev.count * 100).toFixed(1)
  return pct > 0 ? `↓ ${pct}% from previous` : null
}

const STAGE_COLORS = ['#10172C', '#2a3556', '#10172C', '#2a3556']

export default function FunnelChart() {
  const { data: stages, loading, error } = useApi(api.funnel)

  const sectionStyle = {
    background: 'var(--white)',
    border: '1px solid var(--lavender-mid)',
    borderRadius: 'var(--radius-card)',
    padding: '1.75rem 2rem',
  }

  const headingStyle = {
    fontFamily: 'var(--font-serif)',
    fontWeight: 700,
    fontSize: '1.25rem',
    letterSpacing: '-0.02em',
    color: 'var(--navy)',
    marginBottom: '1.75rem',
  }

  if (loading) return (
    <div style={sectionStyle}>
      <p style={headingStyle}>GTM Funnel</p>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="spinner" />
      </div>
    </div>
  )

  if (error) return (
    <div style={sectionStyle}>
      <p style={{ color: 'var(--gray-text)', fontSize: '0.875rem' }}>
        Could not load funnel data: {error}
      </p>
    </div>
  )

  return (
    <div style={sectionStyle}>
      <p style={headingStyle}>GTM Funnel</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {stages.map((stage, idx) => {
          const width = funnelBarWidth(stages, idx)
          const drop = dropOff(stages, idx)

          return (
            <div key={stage.stage}>
              {/* Stage label row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.3rem',
                paddingInline: `${(100 - width) / 2}%`,
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  color: 'var(--navy)',
                  textTransform: 'lowercase',
                }}>
                  {stage.stage.toLowerCase()}
                </span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 300,
                  fontSize: '0.75rem',
                  color: 'var(--gray-text)',
                }}>
                  {drop}
                </span>
              </div>

              {/* Bar */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: `${width}%`,
                  background: STAGE_COLORS[idx],
                  borderRadius: 8,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 1.25rem',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--yellow)',
                    letterSpacing: '-0.01em',
                  }}>
                    {stage.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: 'var(--yellow)',
                    letterSpacing: '-0.02em',
                  }}>
                    {stage.rate}%
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: '0.7rem',
                      color: 'var(--lavender)',
                      marginLeft: '0.4rem',
                    }}>
                      ({stage.count.toLocaleString()} / {stage.total.toLocaleString()})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stage connectors */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2.5rem',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--lavender-mid)',
      }}>
        {stages.map((s, i) => (
          <div key={s.stage} style={{ textAlign: 'center' }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--gray-text)',
            }}>
              {s.stage}
            </span>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--navy)',
            }}>
              {s.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
