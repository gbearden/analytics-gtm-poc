# LearnCraft GTM Analytics Dashboard

An AI-native go-to-market analytics dashboard built for executive audiences. It tracks the full teacher acquisition funnel — signup, activation, engagement, school-wide adoption, and renewal — and answers plain-English questions about the data using a locally-running LLM. No cloud API keys. No data leaving your machine.

Built with FastAPI, React, and [Ollama](https://ollama.com).

---

## What it does

Most GTM dashboards show you numbers. This one tells you what to do about them.

The dashboard surfaces four funnel stages, each backed by real CSV data:

| Stage | Question it answers |
|---|---|
| **Activation** | Are teachers actually using the product after signing up? |
| **Engagement** | Are they coming back week over week? |
| **Adoption** | Is usage spreading within schools? |
| **Renewal** | Are paying teachers staying — and expanding? |

On top of that, a locally-running `llama3.1` model (via Ollama) generates proactive insights on page load and answers natural-language questions like *"What is the top churn reason?"* or *"Which schools are at risk?"* — grounded only in the data you provide.

---

## Stack

| Layer | Technology |
|---|---|
| Backend API | Python · FastAPI · pandas |
| Frontend | React 18 · Vite · Recharts |
| AI | Ollama · llama3.1 (local inference) |
| Data | CSV files — swap in your own |

---

## Project structure

```
analytics-gtm-poc/
├── backend/
│   ├── main.py            # FastAPI app — all API routes
│   ├── data_loader.py     # CSV ingestion, metrics, data summary
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Nav, KPICard, FunnelChart, TrendsChart,
│   │   │                  # AIInsights, ChurnReasonsChart, QueryPanel
│   │   ├── hooks/         # useApi — generic data-fetching hook
│   │   ├── lib/           # api.js — typed wrappers for all endpoints
│   │   └── styles/        # tokens.css — full design system
│   └── index.html
└── data/
    ├── users.csv
    ├── lesson_plans.csv
    ├── engagement_events.csv
    ├── school_adoption.csv
    └── renewals.csv
```

---

## Prerequisites

- Python 3.11+
- Node 18+
- [Ollama](https://ollama.com) installed and running
- `llama3.1` model pulled (~5 GB)
- No API keys required — fully local and free

---

## Getting started

### 1. Start Ollama

```bash
# Install (macOS)
brew install ollama

# Pull the model — do this before your first run, it's ~5 GB
ollama pull llama3.1

# Keep this running in a separate terminal
ollama serve
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`.

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/metrics` | All funnel KPIs + churn reasons |
| `GET` | `/api/funnel` | Four-stage funnel as `[{stage, count, total, rate}]` |
| `GET` | `/api/trends` | Monthly signup and activation trend data |
| `GET` | `/api/insights/proactive` | AI-generated executive insights |
| `POST` | `/api/query` | Natural-language question answering |

---

## Data files

The `/data` directory contains five CSV files. Replace them with your own data — the schema is the contract.

| File | What it represents |
|---|---|
| `users.csv` | One row per teacher: `signup_date`, `activated_at`, `plan_type`, `school_id`, `churned` |
| `lesson_plans.csv` | Every lesson plan created: `teacher_id`, `subject`, `grade_level`, `personalization_tags`, `shared` |
| `engagement_events.csv` | Weekly activity per teacher: `teacher_id`, `week_start`, `event_type`, `event_count` |
| `school_adoption.csv` | School-level adoption: `teacher_count`, `dept_sharing_enabled`, `contract_type`, `arr_usd` |
| `renewals.csv` | Renewal outcomes: `outcome`, `churn_reason`, `arr_usd`, `expansion_usd` |

To regenerate sample data: `python data/generate_data.py`

---

## Moving to production

The AI layer uses the OpenAI-compatible client pointed at Ollama — a deliberate choice that makes the cloud upgrade a three-line diff.

```python
# Local (current)
from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
response = client.chat.completions.create(model="llama3.1", ...)

# Production — swap to Anthropic Claude
import anthropic
client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env
response = client.messages.create(model="claude-sonnet-4-20250514", ...)
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
