# Contributing

Thanks for your interest in improving this project. Contributions of all kinds are welcome — bug fixes, new metrics, better visualizations, or swapping in a different model.

---

## Getting started

Follow the setup steps in the [README](README.md) to get the backend and frontend running locally. You'll need both servers running to test changes end-to-end.

---

## Ways to contribute

### Add a new metric or funnel stage

All funnel logic lives in `backend/data_loader.py`:

- **`compute_metrics()`** — returns the KPI dict consumed by `/api/metrics`
- **`compute_funnel()`** — returns the four-stage funnel array
- **`compute_data_summary()`** — builds the plain-text context string sent to the LLM

Add your metric to the relevant function, then surface it in the frontend by updating the appropriate component in `frontend/src/components/`.

### Connect your own data

Replace any of the five CSV files in `/data/` with your own. The backend reads them on startup and caches them in memory. The only contract is the column names — see the [data files table](README.md#data-files) in the README for the expected schema.

If your column names differ, update the corresponding references in `data_loader.py`.

### Add a new chart or panel

Frontend components live in `frontend/src/components/`. The pattern for a new data-fetching component is:

```jsx
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'

export default function MyChart() {
  const { data, loading, error } = useApi(api.myEndpoint)
  // render loading state, error state, then chart
}
```

Add a new endpoint to `backend/main.py`, register it in `frontend/src/lib/api.js`, and drop the component into `frontend/src/App.jsx`.

### Swap the LLM

The AI layer in `backend/main.py` uses the OpenAI-compatible client pointed at Ollama. Any model that speaks the OpenAI chat completions API will work as a drop-in replacement. See the [Moving to production](README.md#moving-to-production) section in the README for the exact diff to switch to Anthropic Claude.

---

## Code style

- **Python** — standard library + pandas idioms; no additional linters enforced, but keep functions focused and under ~50 lines
- **JavaScript** — React functional components, inline styles using CSS variables from `tokens.css`, no hardcoded hex values
- **No comments** unless the *why* is non-obvious; well-named variables are preferred over explanation

---

## Submitting changes

1. Fork the repo and create a branch: `git checkout -b your-feature-name`
2. Make your changes and test them with both servers running
3. Open a pull request with a short description of what you changed and why
4. Keep PRs focused — one idea per pull request is easier to review

---

## Reporting issues

Open a GitHub issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce (include your Python and Node versions, and whether Ollama is running)
