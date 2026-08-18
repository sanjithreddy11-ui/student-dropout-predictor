"""
FastAPI backend for the Student Early Warning System.

Serves:
  GET  /api/stats                 -> dashboard summary + risk distribution
  GET  /api/students              -> list of scored students (search/filter/sort)
  GET  /api/students/{student_id} -> full detail for one student
  POST /api/predict                -> live prediction for a new/hypothetical student
  GET  /api/model/performance      -> accuracy/precision/recall/f1/confusion matrix
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model")

FEATURES = [
    "attendance", "avg_grade", "assignment_completion", "engagement_score",
    "participation_score", "study_hours", "previous_failures", "absences",
    "family_support", "extracurricular",
]

app = FastAPI(title="Student Early Warning System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load artifacts on startup ----
model = joblib.load(os.path.join(MODEL_DIR, "dropout_model.pkl"))
with open(os.path.join(MODEL_DIR, "metrics.json")) as f:
    METRICS = json.load(f)
with open(os.path.join(MODEL_DIR, "global_importance.json")) as f:
    GLOBAL_IMPORTANCE = json.load(f)
with open(os.path.join(MODEL_DIR, "feature_labels.json")) as f:
    FEATURE_LABELS = json.load(f)
STUDENTS_DF = pd.read_csv(os.path.join(MODEL_DIR, "students_scored.csv"))
STUDENTS_DF["top_factors"] = STUDENTS_DF["top_factors"].apply(json.loads)

EXPLAINER = shap.TreeExplainer(model)


def risk_level(p: float) -> str:
    if p <= 0.30:
        return "Low"
    elif p <= 0.60:
        return "Medium"
    return "High"


def explain_instance(feature_row: pd.DataFrame):
    """Return top contributing factors for one row using SHAP."""
    shap_values = EXPLAINER.shap_values(feature_row, check_additivity=False)
    sv = np.array(shap_values)
    if sv.ndim == 3:
        class_idx = 1 if sv.shape[2] > 1 else 0
        sv = sv[:, :, class_idx]
    row_shap = pd.Series(sv[0], index=FEATURES)
    sorted_feats = row_shap.reindex(row_shap.abs().sort_values(ascending=False).index)
    factors = []
    for feat, val in sorted_feats.items():
        factors.append({
            "feature": feat,
            "label": FEATURE_LABELS[feat],
            "value": float(feature_row.iloc[0][feat]),
            "contribution": round(float(val), 4),
            "direction": "increases_risk" if val > 0 else "decreases_risk",
        })
    return factors[:5]


INTERVENTIONS = {
    "attendance": "Consider faculty follow-up and structured attendance monitoring.",
    "avg_grade": "Recommend academic support, tutoring, or a study plan review.",
    "assignment_completion": "Encourage assignment check-ins and workload support.",
    "engagement_score": "Consider mentoring or increased faculty interaction to rebuild engagement.",
    "participation_score": "Encourage classroom participation through small-group involvement.",
    "study_hours": "Suggest a structured study schedule or peer study group.",
    "previous_failures": "Schedule an academic counselling session to address repeated failures.",
    "absences": "Flag for attendance officer outreach and check in on underlying causes.",
    "family_support": "Connect student with counselling or family-support resources.",
    "extracurricular": "Encourage involvement in extracurricular activities to build engagement.",
}


def recommendations_for(factors):
    seen = set()
    recs = []
    for f in factors:
        if f["direction"] == "increases_risk" and f["feature"] not in seen:
            recs.append({
                "factor": f["label"],
                "suggestion": INTERVENTIONS.get(f["feature"], "Recommend a faculty check-in."),
            })
            seen.add(f["feature"])
        if len(recs) >= 3:
            break
    if not recs:
        recs.append({"factor": "Overall profile", "suggestion": "No urgent concerns detected — continue regular monitoring."})
    return recs


# ---------------- Schemas ----------------

class PredictRequest(BaseModel):
    attendance: float = Field(..., ge=0, le=100)
    avg_grade: float = Field(..., ge=0, le=100)
    assignment_completion: float = Field(..., ge=0, le=100)
    engagement_score: float = Field(..., ge=0, le=100)
    participation_score: float = Field(50, ge=0, le=100)
    study_hours: float = Field(10, ge=0, le=60)
    previous_failures: int = Field(0, ge=0, le=10)
    absences: int = Field(0, ge=0, le=100)
    family_support: int = Field(3, ge=1, le=5)
    extracurricular: int = Field(0, ge=0, le=1)


# ---------------- Endpoints ----------------

@app.get("/api/stats")
def get_stats():
    total = len(STUDENTS_DF)
    counts = STUDENTS_DF["risk_level"].value_counts().to_dict()
    return {
        "total_students": total,
        "high_risk": counts.get("High", 0),
        "medium_risk": counts.get("Medium", 0),
        "low_risk": counts.get("Low", 0),
        "risk_distribution": [
            {"name": "Low", "value": counts.get("Low", 0)},
            {"name": "Medium", "value": counts.get("Medium", 0)},
            {"name": "High", "value": counts.get("High", 0)},
        ],
        "global_feature_importance": [
            {"feature": FEATURE_LABELS[k], "importance": round(v, 4)}
            for k, v in sorted(GLOBAL_IMPORTANCE.items(), key=lambda x: -x[1])
        ],
    }


@app.get("/api/students")
def list_students(
    search: Optional[str] = Query(None),
    risk: Optional[str] = Query(None, description="Low | Medium | High"),
    sort_by: str = Query("risk_probability"),
    order: str = Query("desc"),
    limit: int = Query(2000, le=2000),
):
    df = STUDENTS_DF.copy()
    if search:
        df = df[df["student_id"].str.contains(search, case=False, na=False)]
    if risk and risk.lower() != "all":
        df = df[df["risk_level"].str.lower() == risk.lower()]
    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=(order == "asc"))
    df = df.head(limit)
    cols = ["student_id", "attendance", "avg_grade", "engagement_score",
            "assignment_completion", "previous_failures", "risk_level", "risk_probability"]
    return df[cols].to_dict(orient="records")


@app.get("/api/students/{student_id}")
def get_student(student_id: str):
    row = STUDENTS_DF[STUDENTS_DF["student_id"] == student_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Student not found")
    row = row.iloc[0]
    factors = row["top_factors"]
    return {
        "student_id": row["student_id"],
        "age": int(row["age"]),
        "attendance": row["attendance"],
        "avg_grade": row["avg_grade"],
        "assignment_completion": row["assignment_completion"],
        "engagement_score": row["engagement_score"],
        "participation_score": row["participation_score"],
        "study_hours": row["study_hours"],
        "previous_failures": int(row["previous_failures"]),
        "absences": int(row["absences"]),
        "family_support": int(row["family_support"]),
        "extracurricular": int(row["extracurricular"]),
        "risk_level": row["risk_level"],
        "risk_probability": row["risk_probability"],
        "top_factors": factors,
        "recommendations": recommendations_for(factors),
    }


@app.post("/api/predict")
def predict(payload: PredictRequest):
    row = pd.DataFrame([payload.dict()])[FEATURES]
    proba = float(model.predict_proba(row)[0, 1])
    factors = explain_instance(row)
    return {
        "risk_probability": round(proba, 4),
        "risk_level": risk_level(proba),
        "top_factors": factors,
        "recommendations": recommendations_for(factors),
    }


@app.get("/api/model/performance")
def model_performance():
    return METRICS


@app.get("/api/health")
def health():
    return {"status": "ok", "students_loaded": len(STUDENTS_DF)}
