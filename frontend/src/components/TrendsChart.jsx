import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'

const cardStyle = {
  background: 'var(--white)',
  border: '1px solid var(--lavender-mid)',
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
  color: 'var(--navy)',
  marginBottom: '0.25rem',
}

const subStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 300,
  fontSize: '0.78rem',
  color: 'var(--gray-text)',
  marginBottom: '1.25rem',
}

function formatMonth(str) {
  // "2024-03" → "Mar"
  const [year, month] = str.split('-')
  return new Date(+year, +month - 1).toLocaleString('en-US', { month: 'short' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--navy)',
      border: 'none',
      borderRadius: 10,
      padding: '0.6rem 1rem',
    }}>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.72rem',
        color: 'var(--lavender)',
        marginBottom: '0.3rem',
      }}>
        {label}
      </p>
      {payload.map(p => (
        <p key={p.name} style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: p.color,
          margin: '0.1rem 0',
        }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function TrendsChart() {
  const { data, loading, error } = useApi(api.trends)

  if (loading) return (
    <div style={cardStyle}>
      <p style={headingStyle}>Signup &amp; Activation Trends</p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    </div>
  )

  if (error) return (
    <div style={cardStyle}>
      <p style={headingStyle}>Signup &amp; Activation Trends</p>
      <p style={{ ...subStyle, color: 'var(--gray-text)' }}>Could not load trends: {error}</p>
    </div>
  )

  const chartData = (data?.monthly ?? []).map(row => ({
    ...row,
    monthLabel: formatMonth(row.month),
    activations: Number(row.activations),
    signups: Number(row.signups),
  }))

  return (
    <div style={cardStyle}>
      <p style={headingStyle}>Signup &amp; Activation Trends</p>
      <p style={subStyle}>monthly cohort — signups vs activations</p>

      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--lavender-mid)"
              vertical={false}
            />
            <XAxis
              dataKey="monthLabel"
              tick={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 300,
                fill: 'var(--gray-text)',
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 300,
                fill: 'var(--gray-text)',
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 400,
                color: 'var(--navy)',
                paddingTop: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="signups"
              name="Signups"
              stroke="var(--navy)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--navy)' }}
            />
            <Line
              type="monotone"
              dataKey="activations"
              name="Activations"
              stroke="var(--yellow-dark)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--yellow-dark)' }}
              strokeDasharray="5 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
