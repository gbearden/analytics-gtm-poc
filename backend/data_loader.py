"""Loads all CSV files and computes GTM funnel metrics."""
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).parent.parent / "data"


def _load() -> dict[str, pd.DataFrame]:
    return {
        "users": pd.read_csv(DATA_DIR / "users.csv", parse_dates=["signup_date", "activated_at"]),
        "lesson_plans": pd.read_csv(DATA_DIR / "lesson_plans.csv", parse_dates=["created_date"]),
        "engagement_events": pd.read_csv(DATA_DIR / "engagement_events.csv", parse_dates=["week_start"]),
        "school_adoption": pd.read_csv(DATA_DIR / "school_adoption.csv"),
        "renewals": pd.read_csv(DATA_DIR / "renewals.csv", parse_dates=["due_date"]),
    }


_cache: dict | None = None


def get_data() -> dict[str, pd.DataFrame]:
    global _cache
    if _cache is None:
        _cache = _load()
    return _cache


def compute_metrics() -> dict:
    d = get_data()
    users = d["users"]
    engagement = d["engagement_events"]
    schools = d["school_adoption"]
    renewals = d["renewals"]

    # Stage 1 — Activation
    total_signups = len(users)
    activated = users["activated_at"].notna().sum()
    activation_rate = round(activated / total_signups * 100, 1) if total_signups else 0

    # Stage 2 — Engagement
    events_per_teacher = (
        engagement.groupby("teacher_id")["event_count"].sum().reset_index()
    )
    engaged_users = int((events_per_teacher["event_count"] >= 2).sum())
    engagement_rate = round(engaged_users / activated * 100, 1) if activated else 0

    # Stage 3 — Wider Adoption
    total_schools = len(schools)
    multi_teacher_schools = int((schools["teacher_count"] >= 3).sum())
    adoption_rate = round(multi_teacher_schools / total_schools * 100, 1) if total_schools else 0

    # Stage 4 — Renewal
    completed = renewals[renewals["outcome"].isin(["renewed", "churned"])]
    renewed_count = int((completed["outcome"] == "renewed").sum())
    renewal_rate = round(renewed_count / len(completed) * 100, 1) if len(completed) else 0
    total_arr = int(renewals.loc[renewals["outcome"] == "renewed", "arr_usd"].sum())
    total_expansion = int(renewals["expansion_usd"].sum())

    churn_reasons = compute_churn_reasons()
    return {
        "total_signups": int(total_signups),
        "activated_users": int(activated),
        "activation_rate": activation_rate,
        "engaged_users": engaged_users,
        "engagement_rate": engagement_rate,
        "schools_with_multi_teacher": multi_teacher_schools,
        "total_schools": total_schools,
        "adoption_rate": adoption_rate,
        "renewed_count": renewed_count,
        "renewal_rate": renewal_rate,
        "total_arr": total_arr,
        "total_expansion": total_expansion,
        "churn_reasons": churn_reasons,
    }


def compute_funnel() -> list[dict]:
    m = compute_metrics()
    return [
        {
            "stage": "Activation",
            "label": "Signed up & created first plan",
            "count": m["activated_users"],
            "total": m["total_signups"],
            "rate": m["activation_rate"],
        },
        {
            "stage": "Engagement",
            "label": "Active weekly users",
            "count": m["engaged_users"],
            "total": m["activated_users"],
            "rate": m["engagement_rate"],
        },
        {
            "stage": "Adoption",
            "label": "Schools with 3+ active teachers",
            "count": m["schools_with_multi_teacher"],
            "total": m["total_schools"],
            "rate": m["adoption_rate"],
        },
        {
            "stage": "Renewal",
            "label": "Pro teachers renewed",
            "count": m["renewed_count"],
            "total": m["renewed_count"] + int((get_data()["renewals"]["outcome"] == "churned").sum()),
            "rate": m["renewal_rate"],
        },
    ]


def compute_trends() -> list[dict]:
    users = get_data()["users"].copy()
    users["month"] = users["signup_date"].dt.to_period("M")
    signups_by_month = users.groupby("month").size().reset_index(name="signups")
    activations_by_month = (
        users.dropna(subset=["activated_at"])
        .assign(month=lambda df: df["activated_at"].dt.to_period("M"))
        .groupby("month")
        .size()
        .reset_index(name="activations")
    )
    trend = (
        signups_by_month
        .merge(activations_by_month, on="month", how="left")
        .fillna(0)
        .sort_values("month")
    )
    trend["month"] = trend["month"].astype(str)
    return trend.to_dict(orient="records")


def compute_data_summary() -> str:
    """Build a concise plain-text summary from all 5 DataFrames for LLM context."""
    d = get_data()
    users = d["users"]
    plans = d["lesson_plans"]
    events = d["engagement_events"]
    schools = d["school_adoption"]
    renewals = d["renewals"]

    activated = users[users["activated_at"].notna()]

    # Plans by subject and grade
    top_subjects = plans["subject"].value_counts().head(5)
    top_grades = plans["grade_level"].value_counts().head(5)
    # Activation rate by grade (join plans → users via teacher_id)
    plans_with_grade = plans.merge(
        users[["user_id", "activated_at"]],
        left_on="teacher_id", right_on="user_id", how="left"
    )
    grade_activation = (
        plans_with_grade.groupby("grade_level")["teacher_id"]
        .nunique()
        .reset_index(name="active_teachers")
        .sort_values("active_teachers", ascending=False)
        .head(5)
    )

    # Engagement: avg events per teacher
    events_per = events.groupby("teacher_id")["event_count"].sum()
    avg_events = round(events_per.mean(), 1)
    top_event_types = events.groupby("event_type")["event_count"].sum().sort_values(ascending=False)

    # School stats
    top_schools = schools.nlargest(3, "teacher_count")[["school_name", "district", "teacher_count", "arr_usd"]]
    arr_by_contract = schools.groupby("contract_type")["arr_usd"].sum()

    # Renewals
    completed = renewals[renewals["outcome"].isin(["renewed", "churned"])]
    churn_reasons = renewals[renewals["outcome"] == "churned"]["churn_reason"].value_counts()
    pending_count = int((renewals["outcome"] == "pending").sum())

    lines = [
        "=== USERS ===",
        f"Total teachers: {len(users)}",
        f"Activated (created first plan): {len(activated)} ({round(len(activated)/len(users)*100,1)}%)",
        f"Plan types: {users['plan_type'].value_counts().to_dict()}",
        f"Churned users: {users['churned'].sum()}",

        "\n=== LESSON PLANS ===",
        f"Total lesson plans created: {len(plans)}",
        f"Plans per activated teacher (avg): {round(len(plans)/max(len(activated),1), 1)}",
        f"Plans shared: {plans['shared'].sum()} ({round(plans['shared'].mean()*100,1)}%)",
        f"Top subjects by plan count: {top_subjects.to_dict()}",
        f"Top grade levels by plan count: {top_grades.to_dict()}",
        f"Most active grade levels (unique teachers): {grade_activation.set_index('grade_level')['active_teachers'].to_dict()}",
        f"Personalization tags used: {plans['personalization_tags'].str.split(',').explode().str.strip().value_counts().head(5).to_dict()}",

        "\n=== ENGAGEMENT ===",
        f"Total engagement events: {len(events)}",
        f"Avg event count per teacher: {avg_events}",
        f"Event type totals: {top_event_types.to_dict()}",

        "\n=== SCHOOL ADOPTION ===",
        f"Total schools: {len(schools)}",
        f"Schools with 3+ active teachers: {int((schools['teacher_count'] >= 3).sum())}",
        f"Dept sharing enabled: {int(schools['dept_sharing_enabled'].sum())} schools",
        f"ARR by contract type: {arr_by_contract.to_dict()}",
        f"Top 3 schools by active teachers:\n{top_schools.to_string(index=False)}",

        "\n=== RENEWALS ===",
        f"Total renewal records: {len(renewals)}",
        f"Renewed: {int((completed['outcome']=='renewed').sum())}",
        f"Churned: {int((completed['outcome']=='churned').sum())}",
        f"Pending: {pending_count}",
        f"Renewal rate: {round(int((completed['outcome']=='renewed').sum())/max(len(completed),1)*100,1)}%",
        f"Total renewed ARR: ${int(renewals.loc[renewals['outcome']=='renewed','arr_usd'].sum()):,}",
        f"Total expansion revenue: ${int(renewals['expansion_usd'].sum()):,}",
        f"Top churn reasons: {churn_reasons.to_dict()}",
    ]
    return "\n".join(lines)


def compute_churn_reasons() -> list[dict]:
    renewals = get_data()["renewals"]
    churned = renewals[renewals["outcome"] == "churned"]
    reasons = (
        churned["churn_reason"]
        .value_counts()
        .reset_index()
        .rename(columns={"churn_reason": "reason", "count": "count"})
    )
    return reasons.to_dict(orient="records")
