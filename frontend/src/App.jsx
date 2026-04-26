import { useApi } from './hooks/useApi'
import { api } from './lib/api'
import Nav from './components/Nav'
import HeroBand from './components/HeroBand'
import KPICard from './components/KPICard'
import FunnelChart from './components/FunnelChart'
import TrendsChart from './components/TrendsChart'
import AIInsights from './components/AIInsights'
import ChurnReasonsChart from './components/ChurnReasonsChart'
import QueryPanel from './components/QueryPanel'

function formatARR(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function App() {
  const { data: metrics, loading } = useApi(api.metrics)

  const pageStyle = {
    paddingTop: 56,
    minHeight: '100vh',
    background: 'var(--lavender)',
  }

  const kpiRowStyle = {
    background: 'var(--white)',
    borderBottom: '1px solid var(--lavender-mid)',
    padding: '1.5rem 2.5rem',
  }

  const kpiInnerStyle = {
    maxWidth: 'var(--max-w)',
    margin: '0 auto',
  }

  const mainStyle = {
    maxWidth: 'var(--max-w)',
    margin: '0 auto',
    padding: '2rem 2.5rem 4rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  }

  return (
    <div style={pageStyle}>
      <Nav />
      <HeroBand />

      {/* KPI Row */}
      <div style={kpiRowStyle}>
        <div style={kpiInnerStyle}>
          <div className="grid-kpi">
            <KPICard
              label="Total Teachers"
              value={loading ? '—' : metrics?.total_signups?.toLocaleString()}
              sub={loading ? '' : `${metrics?.activated_users} activated`}
            />
            <KPICard
              label="Activation Rate"
              value={loading ? '—' : `${metrics?.activation_rate}%`}
              sub="signed up → first lesson plan"
            />
            <KPICard
              label="Renewal Rate"
              value={loading ? '—' : `${metrics?.renewal_rate}%`}
              sub={loading ? '' : `${metrics?.renewed_count} renewals closed`}
            />
            <KPICard
              label="Total ARR"
              value={loading ? '—' : formatARR(metrics?.total_arr)}
              sub={loading ? '' : `+${formatARR(metrics?.total_expansion)} expansion`}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={mainStyle}>
        <FunnelChart />

        <div className="grid-bottom">
          <TrendsChart />
          <ChurnReasonsChart
            reasons={metrics?.churn_reasons ?? []}
            loading={loading}
          />
          <AIInsights />
        </div>

        <QueryPanel />
      </div>
    </div>
  )
}
