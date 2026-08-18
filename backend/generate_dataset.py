"""
Synthetic Student Dataset Generator
------------------------------------
Generates a realistic synthetic dataset of students with attendance,
grades, engagement and other academic signals, plus a dropout label
that depends on a *weighted combination* of many features (not a
single hard-coded rule) with added noise, so the relationships feel
realistic rather than trivially deterministic.
"""

import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
N_STUDENTS = 1200  # >1000 as required

rng = np.random.default_rng(RANDOM_SEED)


def clip(arr, lo, hi):
    return np.clip(arr, lo, hi)


def generate_dataset(n=N_STUDENTS):
    student_id = [f"ST{1000 + i}" for i in range(n)]

    age = rng.integers(16, 24, size=n)

    # Latent "student risk propensity" drives correlated features so the
    # dataset has realistic structure instead of independent random noise.
    latent_risk = rng.normal(0, 1, size=n)

    attendance = clip(78 - 18 * latent_risk + rng.normal(0, 9, size=n), 30, 100)
    avg_grade = clip(72 - 16 * latent_risk + 0.15 * (attendance - 78) + rng.normal(0, 8, size=n), 20, 100)
    assignment_completion = clip(80 - 15 * latent_risk + 0.2 * (attendance - 78) + rng.normal(0, 10, size=n), 10, 100)
    engagement_score = clip(70 - 17 * latent_risk + 0.1 * (avg_grade - 72) + rng.normal(0, 10, size=n), 5, 100)
    participation_score = clip(68 - 14 * latent_risk + rng.normal(0, 11, size=n), 5, 100)

    study_hours = clip(12 - 4.5 * latent_risk + rng.normal(0, 3, size=n), 0, 30)
    previous_failures = clip(np.round(1.4 * latent_risk + rng.normal(1, 1.1, size=n)), 0, 6).astype(int)
    absences = clip(np.round((100 - attendance) * 0.35 + rng.normal(0, 3, size=n)), 0, 60).astype(int)

    family_support = rng.integers(1, 6, size=n)  # 1 (low) - 5 (high) survey-style score
    extracurricular = rng.integers(0, 2, size=n)  # participates or not

    # --- Dropout probability: weighted combination of several signals ---
    z = (
        -0.055 * (attendance - 75)
        - 0.05 * (avg_grade - 70)
        - 0.045 * (engagement_score - 68)
        - 0.03 * (assignment_completion - 75)
        + 0.28 * previous_failures
        - 0.025 * study_hours
        - 0.02 * participation_score
        - 0.12 * (family_support - 3)
        - 0.25 * extracurricular
        + rng.normal(0, 0.65, size=n)  # noise so it's not a deterministic rule
    )
    prob = 1 / (1 + np.exp(-z))
    dropout = (rng.random(n) < prob).astype(int)

    df = pd.DataFrame({
        "student_id": student_id,
        "age": age,
        "attendance": np.round(attendance, 1),
        "avg_grade": np.round(avg_grade, 1),
        "assignment_completion": np.round(assignment_completion, 1),
        "engagement_score": np.round(engagement_score, 1),
        "participation_score": np.round(participation_score, 1),
        "study_hours": np.round(study_hours, 1),
        "previous_failures": previous_failures,
        "absences": absences,
        "family_support": family_support,
        "extracurricular": extracurricular,
        "dropout": dropout,
    })
    return df


if __name__ == "__main__":
    df = generate_dataset()
    out_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "students.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} students -> {out_path}")
    print(df["dropout"].value_counts(normalize=True))
