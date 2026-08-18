# Student Early Warning System — Dropout Risk Predictor

> Don't wait for students to drop out. Identify the warning signs early.

A working prototype built for **Round 1** of the coding competition, addressing the problem:
*"Schools and colleges often notice at-risk students too late."*

---

## 1. Problem Statement

Build a system that takes **attendance, grades, and engagement data** and flags students at risk
of dropping out, with the **key contributing factors clearly shown** — an early-warning system that
helps faculty identify students who may need intervention before they drop out.

## 2. Solution

A full early-warning workflow: **Identify → Understand → Intervene**.

```
Student Data → Data Processing → ML Model → Dropout Risk Prediction
            → Risk Probability → Explainable Factors → Recommended Intervention
```

Faculty/admin users can:
- See a live dashboard of overall risk statistics across the student body
- Search, filter, and sort the full student list by risk level
- Click into any student to see their attendance/grades/engagement and a **plain-language
  explanation** of exactly why the model flagged them
- Enter a new or hypothetical student's data and get a **real-time prediction** with explanation
- Review the model's actual measured accuracy, precision, recall, F1 and confusion matrix

## 3. Features

- 1,200-row synthetic student dataset with realistic, noisy (non-trivial) relationships
- Real RandomForestClassifier trained with an 80/20 train/test split
- SHAP-based per-student explainability (not hardcoded/fake explanations)
- Dynamic dashboard: total students, risk counts, risk distribution chart, global feature importance
- Searchable/filterable/sortable student risk table
- Student detail panel with top contributing factors and suggested (not automated) interventions
- "Predict Student Risk" page for live what-if predictions, with quick presets
- Model Performance page with real, measured metrics and a confusion matrix
- Responsible-AI disclaimer surfaced in the UI
- No chatbot — the whole app is focused on risk visualization and explanation

## 4. Technology Stack

**Frontend:** React + Vite, Tailwind CSS v4, Recharts, Lucide React icons
**Backend / ML:** Python, FastAPI, pandas, NumPy, scikit-learn, SHAP, joblib

Architecture is intentionally simple: one FastAPI service serves a pre-trained model and
pre-scored dataset over a small REST API; the React app is a pure client that calls it.

## 5. Dataset

`backend/generate_dataset.py` creates 1,200 synthetic students with:

`student_id, age, attendance, avg_grade, assignment_completion, engagement_score,
participation_score, study_hours, previous_failures, absences, family_support,
extracurricular, dropout`

The dropout label is generated from a **weighted combination of many features plus random
noise** (a logistic function of attendance, grades, engagement, failures, study hours,
participation, family support, and extracurricular activity) — not a single hardcoded rule —
so the model has to learn genuine multi-factor patterns instead of memorizing one threshold.
No real student data is used anywhere.

## 6. ML Model

- **RandomForestClassifier** (scikit-learn), 300 trees, `class_weight="balanced"`
- 80% train / 20% test split, stratified by outcome
- Evaluated with accuracy, precision, recall, F1, and a confusion matrix — all computed from
  the actual held-out test set and served as-is (see `/api/model/performance`)
- Typical run: ~82% accuracy, ~71% precision, ~75% recall on the held-out set

## 7. Explainability

Every prediction — for existing students and for new/hypothetical ones — is explained with
**SHAP** (`TreeExplainer`), which attributes the prediction to each input feature. The top
5 factors are ranked by absolute contribution and labeled as increasing or decreasing risk,
matching the exact values the model actually used (no invented percentages).

Risk is bucketed for readability:

| Probability | Level  |
|-------------|--------|
| 0 – 30%     | Low    |
| 31 – 60%    | Medium |
| 61 – 100%   | High   |

The UI always frames this as a **predicted risk**, e.g. *"High Risk — 82% predicted dropout
probability. This student may require early intervention."* — never as a certainty.

## 8. How to Install

**Requirements:** Python 3.10+, Node.js 18+

```bash
# from the project root
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

## 9. How to Run

The dataset and a trained model are already included in `backend/data/` and `backend/model/`,
so you can start the app immediately. To regenerate them from scratch (optional):

```bash
cd backend
python3 generate_dataset.py   # writes backend/data/students.csv
python3 train_model.py        # trains the model, writes backend/model/*
```

Start both servers (two terminals), or use the helper script from the project root:

```bash
./run.sh
```

...which is equivalent to:

```bash
# Terminal 1
cd backend
python3 -m uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser. The frontend expects the API at
`http://localhost:8000` (configurable via `frontend/.env` → `VITE_API_BASE`).

## 10. Demo Flow (under 3 minutes)

1. **Dashboard** — "1,200 students analyzed", risk distribution, and what drives the model.
2. Click **"View high-risk students"** to jump into the filtered student table.
3. Click a **high-risk student** to open their profile.
4. See their **risk probability** and the **top contributing factors**, each labeled as raising
   or lowering risk.
5. Review the **suggested next steps** (faculty follow-up, tutoring, counselling, etc.).
6. Go to **Predict Student Risk**, apply the "At-risk profile" preset (or enter your own values),
   and click **Predict Dropout Risk**.
7. See the live prediction, explanation, and recommendations update instantly.
8. Open **Model Performance** to show the real accuracy/precision/recall/F1 and confusion matrix.

## 11. Future Improvements

- Persist faculty notes/interventions taken per student (currently read-only demo)
- Track a student's risk trend over time instead of a single snapshot
- Role-based access (faculty vs. admin views) and per-cohort/class filtering
- Swap the synthetic dataset for anonymized real institutional data with proper consent/governance
- Add configurable risk thresholds per institution
- Batch CSV upload for "Predict" to score an entire new cohort at once

## 12. Responsible AI

> **Important:** This system provides risk estimates based on available student data. It is
> intended to support early intervention and should not be used as the sole basis for decisions
> about students.

This is a prototype trained on **synthetic data only** and is not clinically or academically
authoritative.

---

## Project Structure

```
student-dropout-predictor/
├── backend/
│   ├── main.py                 # FastAPI app (stats, students, predict, performance)
│   ├── generate_dataset.py     # synthetic dataset generator
│   ├── train_model.py          # trains RandomForest + SHAP explanations, saves artifacts
│   ├── requirements.txt
│   ├── data/students.csv       # generated dataset
│   └── model/                  # trained model, metrics, scored students
├── frontend/
│   ├── src/
│   │   ├── api.js              # backend API client
│   │   ├── App.jsx             # app shell / navigation
│   │   ├── components/         # RiskRing, RiskBadge, StatCard, Sidebar
│   │   └── pages/               # Dashboard, Students, StudentDetail, Predict, ModelPerformance
│   └── package.json
├── run.sh                      # convenience launcher for both servers
└── README.md
```
