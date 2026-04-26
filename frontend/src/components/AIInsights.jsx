import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'

const cardStyle = {
  background: 'var(--navy)',
  border: '1px solid var(--navy-mid)',
  borderRadius: 'var(--radius-card)',
  padding: '1.75rem 2rem',
  height: '100%',
  minHeight: 320,
  display: 'flex',
  flexDirection: 'column',
}

const headingStyle = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  fontSize: '1.25rem',
  letterSpacing: '-0.02em',
  color: 'var(--yellow)',
  marginBottom: '0.25rem',
}

const subStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 300,
  fontSize: '0.78rem',
  color: 'var(--lavender-mid)',
  marginBottom: '1.5rem',
}

const bulletStyle = {
  display: 'flex',
  gap: '0.6rem',
  alignItems: 'flex-start',
  marginBottom: '1rem',
}

const iconStyle = {
  color: 'var(--yellow)',
  fontSize: '0.75rem',
  lineHeight: 1.65,
  flexShrink: 0,
  marginTop: '0.05rem',
}

const textStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 400,
  fontSize: '0.875rem',
  color: 'var(--lavender)',
  lineHeight: 1.65,
  margin: 0,
}

function LoadingPulse() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
      {[90, 100, 75].map((w, i) => (
        <div key={i} style={{
          height: 14,
          width: `${w}%`,
          borderRadius: 6,
          background: 'var(--navy-mid)',
          opacity: 0.6,
          animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

function OllamaUnavailable() {
  return (
    <div style={{
      background: 'var(--navy-mid)',
      borderRadius: 12,
      padding: '1rem 1.25rem',
      marginTop: '0.25rem',
    }}>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: '0.82rem',
        color: 'var(--yellow)',
        marginBottom: '0.35rem',
      }}>
        AI features unavailable
      </p>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 300,
        fontSize: '0.78rem',
        color: 'var(--lavender-mid)',
        lineHeight: 1.55,
        margin: 0,
      }}>
        Make sure Ollama is running:
        <br />
        <code style={{
          fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.07)',
          padding: '0.15em 0.45em',
          borderRadius: 4,
          fontSize: '0.75rem',
          color: 'var(--lavender)',
          display: 'inline-block',
          marginTop: '0.3rem',
        }}>
          ollama serve
        </code>
      </p>
    </div>
  )
}

function isOllamaError(insights) {
  return insights.length === 1 && insights[0].toLowerCase().includes('ollama unavailable')
}

export default function AIInsights() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading, error } = useApi(api.insights, [refreshKey])

  const insights = data?.insights ?? []
  const ollamaDown = error || isOllamaError(insights)

  return (
    <div style={cardStyle}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <p style={{ ...headingStyle, marginBottom: 0 }}>AI Insights</p>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loading}
          title="Refresh insights"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: '0.72rem',
            color: loading ? 'var(--navy-mid)' : 'var(--lavender-mid)',
            background: 'transparent',
            border: '1px solid var(--navy-mid)',
            borderRadius: 'var(--radius-pill)',
            padding: '0.3em 0.8em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
            textTransform: 'lowercase',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.target.style.color = 'var(--yellow)'
              e.target.style.borderColor = 'var(--yellow)'
            }
          }}
          onMouseLeave={e => {
            e.target.style.color = 'var(--lavender-mid)'
            e.target.style.borderColor = 'var(--navy-mid)'
          }}
        >
          {loading ? '↻ refreshing' : '↻ refresh'}
        </button>
      </div>

      <p style={subStyle}>powered by llama3.1 via Ollama</p>

      {loading && <LoadingPulse />}

      {!loading && ollamaDown && <OllamaUnavailable />}

      {!loading && !ollamaDown && insights.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {insights.map((insight, i) => (
            <li key={i} style={bulletStyle}>
              <span style={iconStyle}>✦</span>
              <p style={textStyle}>{insight}</p>
            </li>
          ))}
        </ul>
      )}

      {!loading && !ollamaDown && insights.length === 0 && (
        <p style={{ ...textStyle, fontStyle: 'italic', color: 'var(--lavender-mid)' }}>
          No insights returned.
        </p>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
        <span style={{
          display: 'inline-block',
          background: 'var(--navy-mid)',
          color: 'var(--lavender-mid)',
          borderRadius: 'var(--radius-pill)',
          padding: '0.3em 0.85em',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
        }}>
          ● llama3.1
        </span>
      </div>
    </div>
  )
}
