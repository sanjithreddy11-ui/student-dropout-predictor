import { useEffect, useState } from "react";
import { getModelPerformance } from "../api";
import StatCard from "../components/StatCard";
import { Target, Crosshair, Radar, Gauge } from "lucide-react";

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getModelPerformance().then(setMetrics).catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "var(--color-high)" }}>Couldn't load model performance: {error}</p>;
  if (!metrics) return <p style={{ color: "var(--color-muted)" }}>Loading model performance…</p>;

  const [[tn, fp], [fn, tp]] = metrics.confusion_matrix;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Model Performance</h1>
        <p className="mt-1 text-sm max-w-2xl" style={{ color: "var(--color-ink-soft)" }}>
          The model learns patterns from historical synthetic student data and estimates whether a new
          student may be at risk of dropping out. These are its actual measured results on a held-out
          20% test set — not illustrative numbers.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Accuracy" value={`${Math.round(metrics.accuracy * 100)}%`} icon={Target} accent="#0e6e6a" />
        <StatCard label="Precision" value={`${Math.round(metrics.precision * 100)}%`} icon={Crosshair} accent="#0e6e6a" />
        <StatCard label="Recall" value={`${Math.round(metrics.recall * 100)}%`} icon={Radar} accent="#0e6e6a" />
        <StatCard label="F1 Score" value={`${Math.round(metrics.f1 * 100)}%`} icon={Gauge} accent="#0e6e6a" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border p-6" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-display font-semibold text-sm mb-1">Confusion Matrix</h2>
          <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
            Evaluated on {metrics.test_size} held-out students ({metrics.train_size} used for training).
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <MatrixCell label="True Negative" value={tn} note="Predicted low risk, stayed enrolled" tone="low" />
            <MatrixCell label="False Positive" value={fp} note="Predicted at-risk, actually stayed" tone="medium" />
            <MatrixCell label="False Negative" value={fn} note="Predicted low risk, actually dropped" tone="high" />
            <MatrixCell label="True Positive" value={tp} note="Predicted at-risk, correctly flagged" tone="low" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border p-6" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-display font-semibold text-sm mb-3">How this model works</h2>
          <div className="space-y-3 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            <p>
              A Random Forest classifier was trained on {metrics.train_size + metrics.test_size} synthetic
              student records, using attendance, grades, engagement, and related behavioral signals as inputs.
            </p>
            <p>
              About {Math.round(metrics.dropout_rate * 100)}% of students in the dataset are labeled as having
              dropped out, so the model was trained with class balancing to avoid ignoring the at-risk minority.
            </p>
            <p>
              Every prediction is paired with a SHAP-based explanation, showing exactly which factors pushed
              that student's risk score up or down — not just the model's overall accuracy.
            </p>
          </div>
          <div className="mt-4 rounded-xl p-4 text-xs" style={{ background: "var(--color-bg)", color: "var(--color-muted)" }}>
            This model is a prototype trained on synthetic data. It is not clinically or academically
            authoritative, and should support — not replace — professional judgment.
          </div>
        </div>
      </div>
    </div>
  );
}

function MatrixCell({ label, value, note, tone }) {
  const colors = {
    low: { bg: "var(--color-low-tint)", fg: "var(--color-low)" },
    medium: { bg: "var(--color-medium-tint)", fg: "var(--color-medium)" },
    high: { bg: "var(--color-high-tint)", fg: "var(--color-high)" },
  }[tone];
  return (
    <div className="rounded-xl p-4" style={{ background: colors.bg }}>
      <div className="font-mono text-2xl font-semibold" style={{ color: colors.fg }}>{value}</div>
      <div className="text-xs font-medium mt-1" style={{ color: colors.fg }}>{label}</div>
      <div className="text-[11px] mt-1" style={{ color: "var(--color-muted)" }}>{note}</div>
    </div>
  );
}
