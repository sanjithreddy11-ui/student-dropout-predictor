import { useEffect, useRef, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Lightbulb, Loader2, Gauge } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { predictStudent } from "../api";
import RiskRing from "../components/RiskRing";
import RiskBadge from "../components/RiskBadge";
import GlassCard from "../components/GlassCard";
import GlassBadge from "../components/GlassBadge";
import PageHeader from "../components/PageHeader";
import AnimatedNumber from "../components/AnimatedNumber";

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

function useSmoothForm(initial) {
  const [form, setForm] = useState(initial);
  const rafRef = useRef(null);

  const set = (updater) => setForm(updater);

  const animateTo = (target) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = { ...form };
    const t0 = performance.now();
    const duration = 500;

    const tick = (now) => {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = {};
      for (const key of Object.keys(target)) {
        const from = Number(start[key] ?? target[key]);
        const to = Number(target[key]);
        next[key] = Math.round(from + (to - from) * eased);
      }
      setForm((f) => ({ ...f, ...next }));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), []);

  return [form, set, animateTo];
}

export default function Predict() {
  const [form, setForm, animateFormTo] = useSmoothForm(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: Number(value) }));

  const applyPreset = (name) => {
    animateFormTo(PRESETS[name]);
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
      <PageHeader
        title="Predict Student Risk"
        subtitle="Adjust the student profile and see how risk changes."
        badge={<GlassBadge dot dotColor="var(--color-brand)"><Sparkles size={12} className="inline -mt-0.5 mr-0.5" />AI Risk Assessment</GlassBadge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <GlassCard reveal className="lg:col-span-3 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="font-display font-semibold text-[15px]">Student Profile</h2>
            <div className="flex gap-2">
              {Object.keys(PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className="btn-press text-xs font-medium px-3 py-1.5 rounded-lg glass-secondary"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: "var(--color-ink-soft)" }}>{field.label}</label>
                  <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "var(--color-brand-tint)", color: "var(--color-brand-dark)" }}>
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
                  className="premium-slider"
                  style={{ "--fill": `${((form[field.key] - field.min) / (field.max - field.min)) * 100}%` }}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--color-ink-soft)" }}>Family Support (1-5)</label>
              <select
                value={form.family_support}
                onChange={(e) => update("family_support", e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus-glow outline-none"
                style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.6)" }}
              >
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--color-ink-soft)" }}>Extracurricular Activity</label>
              <select
                value={form.extracurricular}
                onChange={(e) => update("extracurricular", e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus-glow outline-none"
                style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.6)" }}
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="btn-press mt-6 w-full flex items-center justify-center gap-2 font-medium text-sm py-3.5 rounded-xl text-white disabled:opacity-70"
            style={{ background: "var(--color-brand)", boxShadow: "0 8px 20px -8px rgba(47,111,109,0.5)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Predicting…" : "Predict Dropout Risk"}
          </button>
          {error && <p className="mt-3 text-sm" style={{ color: "var(--color-high)" }}>Prediction failed: {error}</p>}
        </GlassCard>

        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed p-8 text-center text-sm h-full flex flex-col items-center justify-center gap-3 glass-secondary"
                style={{ borderColor: "var(--color-border-strong)", minHeight: 320 }}
              >
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--color-brand-tint)" }}>
                  <Gauge size={22} style={{ color: "var(--color-brand)" }} />
                </span>
                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--color-ink)" }}>AI Risk Assessment</h3>
                <p style={{ color: "var(--color-muted)" }}>
                  Adjust the student profile and run the prediction to see the risk assessment.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="skeleton rounded-2xl" style={{ height: 108 }} />
                <div className="skeleton rounded-2xl" style={{ height: 140 }} />
                <div className="skeleton rounded-2xl" style={{ height: 100 }} />
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <GlassCard reveal={false} className="p-6 flex items-center gap-5">
                  <RiskRing probability={result.risk_probability} level={result.risk_level} size={84} strokeWidth={7} />
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "var(--color-muted)" }}>Risk Score</div>
                    <div className="font-display text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
                      <AnimatedNumber value={Math.round(result.risk_probability * 100)} duration={900} /> / 100
                    </div>
                    <div className="mt-2"><RiskBadge level={result.risk_level} pulse /></div>
                  </div>
                </GlassCard>

                <GlassCard reveal={false} delay={0.05} className="p-5">
                  <p className="text-sm mb-4" style={{ color: "var(--color-ink-soft)" }}>
                    {result.risk_level === "High" && "Predicted high risk — this student may require early intervention."}
                    {result.risk_level === "Medium" && "Predicted moderate risk — worth monitoring."}
                    {result.risk_level === "Low" && "Predicted low risk of dropout."}
                  </p>
                  <h3 className="font-display font-semibold text-sm mb-3">Top Risk Factors</h3>
                  <div className="space-y-2">
                    {result.top_factors.slice(0, 3).map((f, i) => (
                      <div key={f.feature} className="flex items-center gap-3 text-sm" style={{ animation: `fade-in-up 350ms both ${i * 70}ms` }}>
                        <span className="font-mono text-xs font-semibold w-5" style={{ color: "var(--color-muted)" }}>{i + 1}</span>
                        <span className="flex-1 font-medium">{f.label}</span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{
                          color: f.direction === "increases_risk" ? "var(--color-high)" : "var(--color-low)",
                          background: f.direction === "increases_risk" ? "var(--color-high-tint)" : "var(--color-low-tint)",
                        }}>
                          {f.direction === "increases_risk" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {f.direction === "increases_risk" ? "Raises risk" : "Lowers risk"}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard reveal={false} delay={0.1} className="p-5" style={{ background: "var(--color-brand-tint)", border: "1px solid rgba(47,111,109,0.18)" }}>
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
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
