import json
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import data_loader

app = FastAPI(title="GTM Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ollama = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

INSIGHTS_PROMPT = """You are an analytics assistant for an executive dashboard for LearnCraft, \
a platform that helps teachers create personalized lesson plans. \
Here are the current GTM metrics: {metrics}. \
Identify 3 proactive insights or anomalies an executive should know about. \
Be specific and concise. \
You MUST respond with only a valid JSON array of 3 strings, \
with no preamble, explanation, or markdown formatting. \
Example format: ["insight one", "insight two", "insight three"]"""


def _parse_insights(raw: str) -> list[str]:
    """Parse the model response into a list of insight strings."""
    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        result = json.loads(cleaned)
        if isinstance(result, list):
            return [str(s) for s in result]
    except json.JSONDecodeError:
        pass
    # Fallback: split into non-empty sentences
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", cleaned) if s.strip()]
    return sentences[:3] if sentences else [cleaned]


@app.on_event("startup")
def startup():
    data_loader.get_data()


@app.get("/api/metrics")
def get_metrics():
    return data_loader.compute_metrics()


@app.get("/api/funnel")
def get_funnel():
    return data_loader.compute_funnel()


@app.get("/api/trends")
def get_trends():
    return {
        "monthly": data_loader.compute_trends(),
        "churn_reasons": data_loader.compute_churn_reasons(),
    }


@app.get("/api/insights/proactive")
def get_proactive_insights():
    metrics = data_loader.compute_metrics()
    prompt = INSIGHTS_PROMPT.format(metrics=json.dumps(metrics))
    try:
        response = ollama.chat.completions.create(
            model="llama3.1",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        raw = response.choices[0].message.content or ""
        insights = _parse_insights(raw)
    except Exception as exc:
        insights = [
            f"Ollama unavailable: {exc}. Start Ollama and pull llama3.1 to enable AI insights.",
        ]
    return {"insights": insights}


class QueryRequest(BaseModel):
    question: str


QUERY_SYSTEM = (
    "You are a data analyst assistant for LearnCraft, a teacher lesson plan platform. "
    "You have access to the following data summary:\n{data_summary}\n"
    "The user is an executive. Answer their question directly and concisely. "
    "If you can give a specific number or percentage, do so. Keep answers under 3 sentences. "
    "Do not make up data — only use what is in the summary provided."
)


@app.post("/api/query")
def query(body: QueryRequest):
    data_summary = data_loader.compute_data_summary()
    system_msg = QUERY_SYSTEM.format(data_summary=data_summary)
    try:
        response = ollama.chat.completions.create(
            model="llama3.1",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": body.question},
            ],
            temperature=0.3,
        )
        answer = response.choices[0].message.content or ""
    except Exception as exc:
        answer = f"Ollama unavailable: {exc}. Start Ollama with `ollama serve` to enable AI queries."
    return {"question": body.question, "answer": answer.strip()}
