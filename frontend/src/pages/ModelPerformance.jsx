import { useEffect, useState } from "react";
import { getModelPerformance } from "../api";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import GlassBadge from "../components/GlassBadge";
import PageHeader from "../components/PageHeader";
import SectionReveal from "../components/SectionReveal";
import { Target, Crosshair, Radar, Gauge, Cpu, Database, FlaskConical, ListChecks } from "lucide-react";

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getModelPerformance().then(setMetrics).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-6 rounded-2xl border" style={{ borderColor: "var(--color-high)", background: "var(--color-high-tint)" }}>
        Couldn't load model performance: {error}
      </div>
    );
  }
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-16 w-2/3 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const [[tn, fp], [fn, tp]] = metrics.confusion_matrix;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Model Performance"
        subtitle="Understand how accurately the model identifies students at risk."
        badge={<GlassBadge>Prototype Model</GlassBadge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Accuracy" value={Math.round(metrics.accuracy * 100)} formatter={(n) => `${Math.round(n)}%`} icon={Target} accent="#2f6f6d" delay={0} />
        <StatCard label="Precision" value={Math.round(metrics.precision * 100)} formatter={(n) => `${Math.round(n)}%`} icon={Crosshair} accent="#2f6f6d" delay={0.06} />
        <StatCard label="Recall" value={Math.round(metrics.recall * 100)} formatter={(n) => `${Math.round(n)}%`} icon={Radar} accent="#2f6f6d" delay={0.12} />
        <StatCard label="F1 Score" value={Math.round(metrics.f1 * 100)} formatter={(n) => `${Math.round(n)}%`} icon={Gauge} accent="#2f6f6d" delay={0.18} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionReveal>
          <GlassCard reveal={false} className="p-6 h-full">
            <h2 className="font-display font-semibold text-[16px] mb-1">Confusion Matrix</h2>
            <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
              Evaluated on {metrics.test_size} held-out students ({metrics.train_size} used for training).
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <MatrixCell label="True Negative" value={tn} note="Predicted low risk, stayed enrolled" tone="low" delay={0} />
              <MatrixCell label="False Positive" value={fp} note="Predicted at-risk, actually stayed" tone="medium" delay={0.06} />
              <MatrixCell label="False Negative" value={fn} note="Predicted low risk, actually dropped" tone="high" delay={0.12} />
              <MatrixCell label="True Positive" value={tp} note="Predicted at-risk, correctly flagged" tone="low" delay={0.18} />
            </div>
          </GlassCard>
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <GlassCard reveal={false} className="p-6 h-full">
            <h2 className="font-display font-semibold text-[16px] mb-4">How this model works</h2>
            <div className="space-y-3.5">
              <InfoRow icon={Cpu} label="Model Type" value="Random Forest" />
              <InfoRow icon={Database} label="Training Data" value={`${metrics.train_size.toLocaleString()} synthetic student records`} />
              <InfoRow icon={FlaskConical} label="Test Set" value={`${metrics.test_size.toLocaleString()} held-out students`} />
              <InfoRow icon={ListChecks} label="Features" value="Attendance, grades, engagement, behavioral signals" />
            </div>
            <p className="text-sm mt-4" style={{ color: "var(--color-ink-soft)" }}>
              About {Math.round(metrics.dropout_rate * 100)}% of students in the dataset are labeled as having
              dropped out, so the model was trained with class balancing to avoid ignoring the at-risk minority.
              Every prediction is paired with a SHAP-based explanation, showing exactly which factors pushed
              that student's risk score up or down.
            </p>
            <div className="mt-4 rounded-xl p-4 text-xs glass-secondary" style={{ color: "var(--color-muted)" }}>
              This model is a prototype trained on synthetic data. It is not clinically or academically
              authoritative, and should support — not replace — professional judgment.
            </div>
          </GlassCard>
        </SectionReveal>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-brand-tint)" }}>
        <Icon size={15} style={{ color: "var(--color-brand)" }} />
      </span>
      <div>
        <div className="text-xs" style={{ color: "var(--color-muted)" }}>{label}</div>
        <div className="text-sm font-medium mt-0.5" style={{ color: "var(--color-ink)" }}>{value}</div>
      </div>
    </div>
  );
}

function MatrixCell({ label, value, note, tone, delay = 0 }) {
  const colors = {
    low: { bg: "var(--color-low-tint)", fg: "var(--color-low)" },
    medium: { bg: "var(--color-medium-tint)", fg: "var(--color-medium)" },
    high: { bg: "var(--color-high-tint)", fg: "var(--color-high)" },
  }[tone];
  return (
    <div
      className="rounded-xl p-4 glass-hoverable"
      style={{ background: colors.bg, animation: `fade-in-up 400ms both ${delay}s` }}
    >
      <div className="font-mono text-2xl font-semibold" style={{ color: colors.fg }}>{value}</div>
      <div className="text-xs font-medium mt-1" style={{ color: colors.fg }}>{label}</div>
      <div className="text-[11px] mt-1" style={{ color: "var(--color-muted)" }}>{note}</div>
    </div>
  );
}
