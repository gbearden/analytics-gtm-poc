"""Generate realistic sample CSV data for the GTM analytics dashboard."""
import csv, random, math
from datetime import date, timedelta

random.seed(42)

BASE = date(2024, 1, 1)

SCHOOLS = [
    ("S01", "Lincoln Elementary", "Springfield USD"),
    ("S02", "Jefferson Middle", "Springfield USD"),
    ("S03", "Washington High", "Springfield USD"),
    ("S04", "Roosevelt K-8", "Riverside USD"),
    ("S05", "Kennedy Elementary", "Riverside USD"),
    ("S06", "Adams Middle", "Oakwood USD"),
    ("S07", "Madison High", "Oakwood USD"),
    ("S08", "Monroe Elementary", "Pinecrest USD"),
    ("S09", "Harrison Middle", "Pinecrest USD"),
    ("S10", "Tyler Elementary", "Greenfield USD"),
    ("S11", "Polk High", "Greenfield USD"),
    ("S12", "Taylor K-8", "Westside USD"),
    ("S13", "Fillmore Elementary", "Westside USD"),
    ("S14", "Pierce Middle", "Eastview USD"),
    ("S15", "Buchanan High", "Eastview USD"),
]

SUBJECTS = ["Math", "Science", "ELA", "History", "Art", "PE", "Music", "Spanish"]
GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
TAGS = ["visual_learner", "adhd", "ell", "gifted", "iep", "dyslexia", "auditory", "kinesthetic"]
PLAN_TYPES = ["free", "pro", "district"]
EVENT_TYPES = ["plan_created", "plan_shared", "plan_viewed", "feedback_given", "login"]
CHURN_REASONS = ["price", "missing_features", "admin_left", "switched_tool", "budget_cuts", ""]

def rand_date(start_offset_days=0, end_offset_days=450):
    return BASE + timedelta(days=random.randint(start_offset_days, end_offset_days))

def fmt(d):
    return d.isoformat() if d else ""

# ── users.csv ────────────────────────────────────────────────────────────────
users = []
user_id = 1
for school_id, _, _ in SCHOOLS:
    n_teachers = random.randint(4, 14)
    for _ in range(n_teachers):
        uid = f"U{user_id:03d}"
        signup = rand_date(0, 420)
        # ~72% activate within 14 days of signup
        if random.random() < 0.72:
            activated_at = signup + timedelta(days=random.randint(0, 14))
        else:
            activated_at = None
        plan = random.choices(PLAN_TYPES, weights=[0.45, 0.40, 0.15])[0]
        # pro/district users churn less
        churn_prob = 0.08 if plan == "free" else 0.05
        churned = random.random() < churn_prob
        users.append({
            "user_id": uid,
            "school_id": school_id,
            "name": f"Teacher {user_id}",
            "email": f"teacher{user_id}@school.edu",
            "signup_date": fmt(signup),
            "activated_at": fmt(activated_at),
            "plan_type": plan,
            "churned": churned,
        })
        user_id += 1

with open("users.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(users[0].keys()))
    w.writeheader(); w.writerows(users)

print(f"users.csv: {len(users)} rows")

# ── lesson_plans.csv ─────────────────────────────────────────────────────────
plans = []
plan_id = 1
activated_users = [u for u in users if u["activated_at"]]
for u in activated_users:
    n_plans = random.randint(1, 20)
    act_date = date.fromisoformat(u["activated_at"])
    for _ in range(n_plans):
        created = act_date + timedelta(days=random.randint(0, 300))
        tag_count = random.randint(1, 3)
        plans.append({
            "plan_id": f"P{plan_id:04d}",
            "teacher_id": u["user_id"],
            "created_date": fmt(created),
            "subject": random.choice(SUBJECTS),
            "grade_level": random.choice(GRADES),
            "personalization_tags": ",".join(random.sample(TAGS, tag_count)),
            "shared": random.random() < 0.35,
        })
        plan_id += 1

with open("lesson_plans.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(plans[0].keys()))
    w.writeheader(); w.writerows(plans)

print(f"lesson_plans.csv: {len(plans)} rows")

# ── engagement_events.csv ────────────────────────────────────────────────────
events = []
event_id = 1
for u in activated_users:
    act_date = date.fromisoformat(u["activated_at"])
    # generate 2-24 weekly event rows per teacher
    n_weeks = random.randint(2, 24)
    for _ in range(n_weeks):
        week_start = act_date + timedelta(weeks=random.randint(0, 40))
        # round to Monday
        week_start -= timedelta(days=week_start.weekday())
        for etype in random.sample(EVENT_TYPES, random.randint(1, 3)):
            events.append({
                "event_id": f"E{event_id:05d}",
                "teacher_id": u["user_id"],
                "week_start": fmt(week_start),
                "event_type": etype,
                "event_count": random.randint(1, 12),
            })
            event_id += 1

with open("engagement_events.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(events[0].keys()))
    w.writeheader(); w.writerows(events)

print(f"engagement_events.csv: {len(events)} rows")

# ── school_adoption.csv ───────────────────────────────────────────────────────
school_teacher_counts = {}
for u in users:
    school_teacher_counts.setdefault(u["school_id"], 0)
    if u["activated_at"]:
        school_teacher_counts[u["school_id"]] += 1

school_rows = []
for school_id, school_name, district in SCHOOLS:
    active = school_teacher_counts.get(school_id, 0)
    total = sum(1 for u in users if u["school_id"] == school_id)
    dept_sharing = active >= 3 and random.random() < 0.65
    if active >= 5:
        contract = "district"
        arr = random.randint(8000, 25000)
    elif active >= 2:
        contract = "school"
        arr = random.randint(1500, 7000)
    else:
        contract = "none"
        arr = 0
    school_rows.append({
        "school_id": school_id,
        "school_name": school_name,
        "district": district,
        "teacher_count": active,
        "total_teachers": total,
        "dept_sharing_enabled": dept_sharing,
        "contract_type": contract,
        "arr_usd": arr,
        "contract_start_date": fmt(rand_date(0, 300)) if contract != "none" else "",
    })

with open("school_adoption.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(school_rows[0].keys()))
    w.writeheader(); w.writerows(school_rows)

print(f"school_adoption.csv: {len(school_rows)} rows")

# ── renewals.csv ─────────────────────────────────────────────────────────────
pro_users = [u for u in users if u["plan_type"] in ("pro", "district")]
renewals = []
renewal_id = 1
for u in pro_users:
    signup = date.fromisoformat(u["signup_date"])
    renewal_due = signup + timedelta(days=365)
    if renewal_due > date.today():
        outcome = "pending"
        churn_reason = ""
        arr = 0
        expansion = 0
    elif random.random() < 0.78:
        outcome = "renewed"
        churn_reason = ""
        arr = 1200 if u["plan_type"] == "pro" else 8000
        expansion = random.randint(0, 2000) if random.random() < 0.3 else 0
    else:
        outcome = "churned"
        churn_reason = random.choice([r for r in CHURN_REASONS if r])
        arr = 0
        expansion = 0
    renewals.append({
        "renewal_id": f"R{renewal_id:03d}",
        "user_id": u["user_id"],
        "due_date": fmt(renewal_due),
        "outcome": outcome,
        "churn_reason": churn_reason,
        "arr_usd": arr,
        "expansion_usd": expansion,
        "original_plan": u["plan_type"],
    })
    renewal_id += 1

with open("renewals.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(renewals[0].keys()))
    w.writeheader(); w.writerows(renewals)

print(f"renewals.csv: {len(renewals)} rows")
print("Done.")
