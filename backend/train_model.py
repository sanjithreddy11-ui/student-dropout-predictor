"""
Trains a RandomForestClassifier on the synthetic student dataset,
evaluates it, computes SHAP-based explainability, and saves all
artifacts (model, metrics, feature importances, scored students)
so the FastAPI backend can serve them without retraining on every boot.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "students.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURES = [
    "attendance",
    "avg_grade",
    "assignment_completion",
    "engagement_score",
    "participation_score",
    "study_hours",
    "previous_failures",
    "absences",
    "family_support",
    "extracurricular",
]
TARGET = "dropout"

FEATURE_LABELS = {
    "attendance": "Attendance",
    "avg_grade": "Average Grade",
    "assignment_completion": "Assignment Completion",
    "engagement_score": "Engagement",
    "participation_score": "Participation",
    "study_hours": "Study Hours",
    "previous_failures": "Previous Failures",
    "absences": "Absences",
    "family_support": "Family Support",
    "extracurricular": "Extracurricular Activity",
}


def main():
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, df.index, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=8,
        min_samples_leaf=4,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "f1": round(f1_score(y_test, y_pred), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),  # [[TN,FP],[FN,TP]]
        "train_size": len(X_train),
        "test_size": len(X_test),
        "dropout_rate": round(float(y.mean()), 4),
    }
    print("Metrics:", json.dumps(metrics, indent=2))

    # Global feature importance (model-level)
    global_importance = dict(zip(FEATURES, model.feature_importances_.tolist()))

    # SHAP explainability (per-student local explanations)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X, check_additivity=False)
    # shap_values can be (n_samples, n_features, n_classes) in newer SHAP versions
    sv = np.array(shap_values)
    if sv.ndim == 3:
        # take the "dropout=1" class contributions
        class_idx = 1 if sv.shape[2] > 1 else 0
        sv = sv[:, :, class_idx]

    shap_df = pd.DataFrame(sv, columns=FEATURES)

    # Predict risk probability for the FULL dataset (for dashboard/table use)
    full_proba = model.predict_proba(X)[:, 1]

    def risk_level(p):
        if p <= 0.30:
            return "Low"
        elif p <= 0.60:
            return "Medium"
        else:
            return "High"

    scored = df.copy()
    scored["risk_probability"] = np.round(full_proba, 4)
    scored["risk_level"] = [risk_level(p) for p in full_proba]

    # Attach top-3 SHAP contributing factors per student as JSON string
    top_factors_list = []
    for i in range(len(df)):
        row = shap_df.iloc[i]
        # sort by absolute contribution, keep factors pushing risk UP (positive)
        sorted_feats = row.reindex(row.abs().sort_values(ascending=False).index)
        factors = []
        for feat, val in sorted_feats.items():
            factors.append({
                "feature": feat,
                "label": FEATURE_LABELS[feat],
                "value": float(df.iloc[i][feat]),
                "contribution": round(float(val), 4),
                "direction": "increases_risk" if val > 0 else "decreases_risk",
            })
        top_factors_list.append(factors[:5])

    scored["top_factors"] = [json.dumps(f) for f in top_factors_list]

    # Save artifacts
    joblib.dump(model, os.path.join(MODEL_DIR, "dropout_model.pkl"))
    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    with open(os.path.join(MODEL_DIR, "global_importance.json"), "w") as f:
        json.dump(global_importance, f, indent=2)
    with open(os.path.join(MODEL_DIR, "feature_labels.json"), "w") as f:
        json.dump(FEATURE_LABELS, f, indent=2)
    scored.to_csv(os.path.join(MODEL_DIR, "students_scored.csv"), index=False)

    print("\nSaved model + metrics + scored dataset to /model")
    print("Global feature importance:", json.dumps(global_importance, indent=2))


if __name__ == "__main__":
    main()
