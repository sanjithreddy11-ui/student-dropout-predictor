import { useEffect, useState } from "react";
import { X, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { getStudent } from "../api";
import RiskRing from "../components/RiskRing";
import RiskBadge from "../components/RiskBadge";

const METRIC_FIELDS = [
  { key: "attendance", label: "Attendance", unit: "%" },
  { key: "avg_grade", label: "Average Grade", unit: "%" },
  { key: "engagement_score", label: "Engagement", unit: "%" },
  { key: "assignment_completion", label: "Assignment Completion", unit: "%" },
  { key: "participation_score", label: "Participation", unit: "%" },
  { key: "study_hours", label: "Study Hours / wk", unit: "h" },
  { key: "previous_failures", label: "Previous Failures", unit: "" },
  { key: "absences", label: "Absences", unit: "" },
];

export default function StudentDetail({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    getStudent(studentId).then(setData).catch((e) => setError(e.message));
  }, [studentId]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <div className="text-xs" style={{ color: "var(--color-muted)" }}>Student Profile</div>
            <div className="font-display font-semibold text-lg font-mono">{studentId}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-bg)]">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-6 text-sm" style={{ color: "var(--color-high)" }}>
            Couldn't load this student: {error}
          </div>
        )}

        {!error && !data && (
          <div className="p-6 text-sm" style={{ color: "var(--color-muted)" }}>Loading profile…</div>
        )}

        {data && (
          <div className="p-6 space-y-7">
            <div className="flex items-center gap-4 rounded-2xl p-5" style={{ background: "var(--color-bg)" }}>
              <RiskRing probability={data.risk_probability} level={data.risk_level} size={72} strokeWidth={7} />
              <div>
                <RiskBadge level={data.risk_level} />
                <p className="mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  {data.risk_level === "High" && "This student has a high predicted risk and may require early intervention."}
                  {data.risk_level === "Medium" && "This student shows moderate risk signals worth monitoring."}
                  {data.risk_level === "Low" && "This student currently shows a low predicted dropout risk."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-3">Student Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                {METRIC_FIELDS.map((m) => (
                  <div key={m.key} className="rounded-xl border p-3.5" style={{ borderColor: "var(--color-border)" }}>
                    <div className="text-xs" style={{ color: "var(--color-muted)" }}>{m.label}</div>
                    <div className="font-mono font-semibold text-lg mt-0.5">
                      {data[m.key]}
                      {m.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-1">Why is this student at risk?</h3>
              <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>
                Top contributing factors from the model's explanation for this student.
              </p>
              <div className="space-y-2">
                {data.top_factors.map((f, i) => (
                  <div key={f.feature} className="flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: "var(--color-border)" }}>
                    <span className="font-mono text-xs font-semibold w-6 pt-0.5" style={{ color: "var(--color-muted)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{f.label}</span>
                        <span className="font-mono text-sm" style={{ color: "var(--color-ink-soft)" }}>{f.value}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: f.direction === "increases_risk" ? "var(--color-high)" : "var(--color-low)" }}>
                        {f.direction === "increases_risk" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {f.direction === "increases_risk" ? "Increases predicted risk" : "Lowers predicted risk"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb size={15} style={{ color: "var(--color-brand)" }} />
                Suggested next steps
              </h3>
              <div className="space-y-2">
                {data.recommendations.map((r) => (
                  <div key={r.factor} className="rounded-xl p-3.5 text-sm" style={{ background: "var(--color-brand-tint)" }}>
                    <span className="font-medium" style={{ color: "var(--color-brand-dark)" }}>{r.factor}: </span>
                    <span style={{ color: "var(--color-ink-soft)" }}>{r.suggestion}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-3" style={{ color: "var(--color-muted)" }}>
                Suggestions only — not automated decisions. Use professional judgment alongside this data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
