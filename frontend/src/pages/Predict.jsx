import { useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { predictStudent } from "../api";
import RiskRing from "../components/RiskRing";
import RiskBadge from "../components/RiskBadge";

const DEFAULT_FORM = {
  attendance: 75,
  avg_grade: 70,
  assignment_completion: 78,
  engagement_score: 68,
  participation_score: 65,
  study_hours: 10,
  previous_failures: 0,
  absences: 6,
  family_support: 3,
  extracurricular: 0,
};

const FIELDS = [
  { key: "attendance", label: "Attendance", unit: "%", min: 0, max: 100, step: 1 },
  { key: "avg_grade", label: "Average Grade", unit: "%", min: 0, max: 100, step: 1 },
  { key: "assignment_completion", label: "Assignment Completion", unit: "%", min: 0, max: 100, step: 1 },
  { key: "engagement_score", label: "Engagement", unit: "%", min: 0, max: 100, step: 1 },
  { key: "participation_score", label: "Participation", unit: "%", min: 0, max: 100, step: 1 },
  { key: "study_hours", label: "Study Hours / week", unit: "h", min: 0, max: 40, step: 1 },
  { key: "previous_failures", label: "Previous Failures", unit: "", min: 0, max: 8, step: 1 },
  { key: "absences", label: "Absences", unit: "", min: 0, max: 60, step: 1 },
];

const PRESETS = {
  "At-risk profile": { attendance: 42, avg_grade: 48, assignment_completion: 40, engagement_score: 32, participation_score: 35, study_hours: 3, previous_failures: 3, absences: 24, family_support: 2, extracurricular: 0 },
  "Steady student": { attendance: 88, avg_grade: 82, assignment_completion: 90, engagement_score: 80, participation_score: 76, study_hours: 14, previous_failures: 0, absences: 3, family_support: 4, extracurricular: 1 },
};

export default function Predict() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: Number(value) }));

  const applyPreset = (name) => {
    setForm(PRESETS[name]);
    setResult(null);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictStudent(form);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Predict Student Risk</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Enter a student's profile — real or hypothetical — and get a real-time prediction from the model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 rounded-2xl bg-white border p-6" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-sm">Student Profile</h2>
            <div className="flex gap-2">
              {Object.keys(PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg border hover:bg-[var(--color-bg)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink-soft)" }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium" style={{ color: "var(--color-ink-soft)" }}>{field.label}</label>
                  <span className="font-mono text-xs font-semibold">
                    {form[field.key]}
                    {field.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  className="w-full accent-[#0e6e6a]"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--color-ink-soft)" }}>Family Support (1-5)</label>
              <select
                value={form.family_support}
                onChange={(e) => update("family_support", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border)" }}
              >
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--color-ink-soft)" }}>Extracurricular Activity</label>
              <select
                value={form.extracurricular}
                onChange={(e) => update("extracurricular", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border)" }}
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 font-medium text-sm py-3 rounded-xl text-white transition-opacity disabled:opacity-60"
            style={{ background: "var(--color-brand)" }}
          >
            <Sparkles size={16} />
            {loading ? "Predicting…" : "Predict Dropout Risk"}
          </button>
          {error && <p className="mt-3 text-sm" style={{ color: "var(--color-high)" }}>Prediction failed: {error}</p>}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!result && (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm h-full flex items-center justify-center" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
              Set the profile and click "Predict Dropout Risk" to see the result here.
            </div>
          )}
          {result && (
            <>
              <div className="rounded-2xl bg-white border p-6 flex items-center gap-4" style={{ borderColor: "var(--color-border)" }}>
                <RiskRing probability={result.risk_probability} level={result.risk_level} size={76} strokeWidth={7} />
                <div>
                  <RiskBadge level={result.risk_level} />
                  <p className="mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                    {result.risk_level === "High" && "Predicted high risk — this student may require early intervention."}
                    {result.risk_level === "Medium" && "Predicted moderate risk — worth monitoring."}
                    {result.risk_level === "Low" && "Predicted low risk of dropout."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border p-5" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="font-display font-semibold text-sm mb-3">Key Contributing Factors</h3>
                <div className="space-y-2">
                  {result.top_factors.slice(0, 3).map((f, i) => (
                    <div key={f.feature} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-xs font-semibold w-5" style={{ color: "var(--color-muted)" }}>{i + 1}</span>
                      <span className="flex-1 font-medium">{f.label}</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: f.direction === "increases_risk" ? "var(--color-high)" : "var(--color-low)" }}>
                        {f.direction === "increases_risk" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {f.direction === "increases_risk" ? "Raises risk" : "Lowers risk"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "var(--color-brand-tint)" }}>
                <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: "var(--color-brand-dark)" }}>
                  <Lightbulb size={15} />
                  Suggested next steps
                </h3>
                <div className="space-y-2 text-sm">
                  {result.recommendations.map((r) => (
                    <div key={r.factor} style={{ color: "var(--color-ink-soft)" }}>
                      <span className="font-medium" style={{ color: "var(--color-brand-dark)" }}>{r.factor}: </span>
                      {r.suggestion}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
