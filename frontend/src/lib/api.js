const BASE = 'http://localhost:8000'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  metrics:  () => get('/api/metrics'),
  funnel:   () => get('/api/funnel'),
  trends:   () => get('/api/trends'),
  insights: () => get('/api/insights/proactive'),
  query:    (question) => post('/api/query', { question }),
}
