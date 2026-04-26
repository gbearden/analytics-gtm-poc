import { useState, useRef } from 'react'
import { api } from '../lib/api'

const MAX_HISTORY = 3

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// ── Thinking indicator ───────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--lavender-mid)',
          display: 'inline-block',
          animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  )
}

// ── History entry ────────────────────────────────────────────────────────────
function HistoryEntry({ entry, isLatest }) {
  return (
    <div style={{
      borderTop: '1px solid var(--lavender-mid)',
      paddingTop: '1.25rem',
      marginTop: '1.25rem',
      opacity: isLatest ? 1 : 0.6,
    }}>
      {/* Question */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--gray-text)',
          paddingTop: '0.15rem',
          flexShrink: 0,
        }}>Q</span>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: '0.9rem',
          color: 'var(--navy)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {entry.question}
        </p>
      </div>

      {/* Answer */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--yellow-dark)',
          paddingTop: '0.15rem',
          flexShrink: 0,
        }}>A</span>
        <div style={{ flex: 1 }}>
          {entry.thinking ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: '0.85rem',
                color: 'var(--gray-text)',
                fontStyle: 'italic',
              }}>Thinking</span>
              <ThinkingDots />
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: '0.9rem',
              color: 'var(--navy)',
              margin: 0,
              lineHeight: 1.65,
            }}>
              {entry.answer}
            </p>
          )}
          {!entry.thinking && entry.time && (
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: '0.7rem',
              color: 'var(--gray-text)',
              display: 'block',
              marginTop: '0.35rem',
            }}>
              {entry.time}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────────
export default function QueryPanel() {
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  async function handleAsk() {
    const q = question.trim()
    if (!q || loading) return

    const entry = { question: q, answer: '', thinking: true, time: null }
    setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY))
    setQuestion('')
    setLoading(true)

    try {
      const data = await api.query(q)
      setHistory(prev =>
        prev.map((h, i) =>
          i === 0 ? { ...h, answer: data.answer, thinking: false, time: timestamp() } : h
        )
      )
    } catch (err) {
      setHistory(prev =>
        prev.map((h, i) =>
          i === 0
            ? { ...h, answer: `Error: ${err.message}`, thinking: false, time: timestamp() }
            : h
        )
      )
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--lavender-mid)',
      borderRadius: 'var(--radius-card)',
      padding: '1.75rem 2rem',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '1.25rem',
          letterSpacing: '-0.02em',
          color: 'var(--navy)',
          marginBottom: '0.25rem',
        }}>
          Ask a Question
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: '0.78rem',
          color: 'var(--gray-text)',
        }}>
          ask anything about the GTM data — powered by llama3.1
        </p>
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          placeholder="e.g. Which grade level has the highest activation rate?"
          style={{
            flex: 1,
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: '0.9rem',
            color: 'var(--navy)',
            background: 'var(--lavender)',
            border: '1px solid var(--lavender-mid)',
            borderRadius: 'var(--radius-pill)',
            padding: '0.65em 1.25em',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--navy)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--lavender-mid)' }}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: '0.85rem',
            color: loading || !question.trim() ? 'var(--gray-text)' : 'var(--yellow)',
            background: loading || !question.trim() ? 'var(--lavender-mid)' : 'var(--navy)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '0.65em 1.5em',
            cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.18s, color 0.18s',
            flexShrink: 0,
            textTransform: 'lowercase',
          }}
        >
          {loading ? 'asking…' : 'ask'}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          {history.map((entry, i) => (
            <HistoryEntry key={i} entry={entry} isLatest={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}
