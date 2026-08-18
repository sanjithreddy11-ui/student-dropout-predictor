import { useEffect, useState } from "react";
import { Users, AlertTriangle, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { getStats, getStudents } from "../api";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import GlassBadge from "../components/GlassBadge";
import PageHeader from "../components/PageHeader";
import RiskBadge from "../components/RiskBadge";
import SectionReveal from "../components/SectionReveal";

const COLORS = { Low: "#4f9b68", Medium: "#c58a2b", High: "#c94c4c" };

const TREND_RANGES = {
  "7D": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30D": ["W1", "W2", "W3", "W4"],
  "8W": ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
};

// Deterministic, clearly-labeled illustrative series (no real historical
// trend endpoint exists yet). Shaped around the current snapshot so the
// chart is proportionate to real totals rather than arbitrary numbers.
function buildDemoTrend(stats, range) {
  const labels = TREND_RANGES[range];
  const total = stats.total_students || 1;
  const targets = {
    High: stats.high_risk,
    Medium: stats.medium_risk,
    Low: stats.low_risk,
  };
  return labels.map((label, i) => {
    const progress = (i + 1) / labels.length;
    const wobble = Math.sin(i * 1.3) * 0.03 * total;
    const point = { label };
    for (const level of ["High", "Medium", "Low"]) {
      const settle = targets[level] * (0.82 + 0.18 * progress);
      point[level] = Math.max(0, Math.round(settle + wobble * (level === "High" ? 1 : -0.6)));
    }
    return point;
  });
}

function TableSkeleton() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-11 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function Dashboard({ onGoToStudents }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [attention, setAttention] = useState(null);
  const [attentionError, setAttentionError] = useState(null);
  const [range, setRange] = useState("7D");

  useEffect(() => {
    getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    getStudents({ risk: "High", sortBy: "risk_probability", order: "desc" })
      .then((data) => setAttention(data.slice(0, 5)))
      .catch((e) => setAttentionError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-6 rounded-2xl border" style={{ borderColor: "var(--color-high)", background: "var(--color-high-tint)" }}>
        Couldn't load dashboard data. Is the backend running at the configured API URL? ({error})
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8">
        <div className="skeleton h-16 w-2/3 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const pieData = stats.risk_distribution;
  const trendData = buildDemoTrend(stats, range);
  const topDriver = [...stats.global_feature_importance].sort((a, b) => b.importance - a.importance)[0];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Student Risk Overview"
        subtitle="Monitor student risk, understand key factors, and take action early."
        badge={<GlassBadge dot pulse dotColor="var(--color-brand)">Model updated recently</GlassBadge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={stats.total_students}
          sublabel="Analyzed"
          icon={Users}
          accent="#2f6f6d"
          delay={0}
        />
        <StatCard
          label="High Risk"
          value={stats.high_risk}
          sublabel={`${Math.round((stats.high_risk / stats.total_students) * 100)}% of students`}
          icon={AlertTriangle}
          accent="#c94c4c"
          delay={0.06}
        />
        <StatCard
          label="Medium Risk"
          value={stats.medium_risk}
          sublabel={`${Math.round((stats.medium_risk / stats.total_students) * 100)}% of students`}
          icon={AlertCircle}
          accent="#c58a2b"
          delay={0.12}
        />
        <StatCard
          label="Low Risk"
          value={stats.low_risk}
          sublabel={`${Math.round((stats.low_risk / stats.total_students) * 100)}% of students`}
          icon={ShieldCheck}
          accent="#4f9b68"
          delay={0.18}
        />
      </div>

      {/* Attention Required */}
      <SectionReveal>
        <GlassCard reveal={false} className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-[17px]" style={{ color: "var(--color-ink)" }}>
              Attention Required
            </h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
            Students who may need intervention.
          </p>

          {attentionError && (
            <p className="text-sm py-4" style={{ color: "var(--color-high)" }}>
              Couldn't load student list: {attentionError}
            </p>
          )}
          {!attentionError && !attention && <TableSkeleton />}
          {attention && attention.length === 0 && (
            <p className="text-sm py-6 text-center" style={{ color: "var(--color-muted)" }}>
              No high-risk students right now.
            </p>
          )}
          {attention && attention.length > 0 && (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {attention.map((s, i) => (
                <div
                  key={s.student_id}
                  className="flex items-center gap-4 py-3 px-2 -mx-2 rounded-xl transition-colors duration-200 hover:bg-white/60"
                  style={{ borderColor: "var(--color-border)", animation: `fade-in-up 400ms both ${i * 60}ms` }}
                >
                  <span className="font-mono text-sm font-semibold w-24 shrink-0" style={{ color: "var(--color-ink)" }}>
                    {s.student_id}
                  </span>
                  <div className="w-28 shrink-0">
                    <RiskBadge level={s.risk_level} size="sm" pulse={s.risk_level === "High"} />
                  </div>
                  <span className="flex-1 text-sm truncate" style={{ color: "var(--color-ink-soft)" }}>
                    {mainFactorFromStudent(s)}
                  </span>
                  <button
                    onClick={() => onGoToStudents(s.risk_level)}
                    className="btn-press flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg shrink-0"
                    style={{ color: "var(--color-brand-dark)", background: "var(--color-brand-tint)" }}
                  >
                    View <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </SectionReveal>

      {/* Risk Trend */}
      <SectionReveal delay={0.05}>
        <GlassCard reveal={false} className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
            <div>
              <h2 className="font-display font-semibold text-[17px]" style={{ color: "var(--color-ink)" }}>Risk Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Student risk movement over time</p>
            </div>
            <div className="inline-flex gap-1 rounded-xl p-1 glass-secondary self-start">
              {Object.keys(TREND_RANGES).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
                  style={{
                    background: range === r ? "#fff" : "transparent",
                    color: range === r ? "var(--color-brand-dark)" : "var(--color-muted)",
                    boxShadow: range === r ? "var(--shadow-glass-sm)" : "none",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] mb-3" style={{ color: "var(--color-muted)" }}>
            Illustrative demo data shaped from current totals — no historical trend endpoint exists yet.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ left: -12, right: 12, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7c8ba0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7c8ba0" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="High" stroke={COLORS.High} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={800} />
              <Line type="monotone" dataKey="Medium" stroke={COLORS.Medium} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={800} />
              <Line type="monotone" dataKey="Low" stroke={COLORS.Low} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </SectionReveal>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <SectionReveal className="lg:col-span-2" delay={0.05}>
          <GlassCard reveal={false} className="p-6 h-full flex flex-col">
            <h2 className="font-display font-semibold text-[17px] mb-1" style={{ color: "var(--color-ink)" }}>Risk Distribution</h2>
            <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>Share of the student body in each risk band.</p>
            <div className="relative flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={85} paddingAngle={3} animationDuration={800}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} students`, n]} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: -18 }}>
                <span className="font-display text-2xl font-semibold" style={{ color: "var(--color-high)" }}>{stats.high_risk}</span>
                <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>High Risk</span>
              </div>
            </div>
            <button
              onClick={() => onGoToStudents("High")}
              className="btn-press mt-2 w-full text-sm font-medium py-2.5 rounded-xl"
              style={{ background: "var(--color-high-tint)", color: "var(--color-high)" }}
            >
              View {stats.high_risk} high-risk students →
            </button>
          </GlassCard>
        </SectionReveal>

        <SectionReveal className="lg:col-span-3" delay={0.1}>
          <GlassCard reveal={false} className="p-6 h-full">
            <h2 className="font-display font-semibold text-[17px] mb-1" style={{ color: "var(--color-ink)" }}>What drives the model</h2>
            <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
              Global feature importance across all predictions.
            </p>
            {topDriver && (
              <p className="text-xs mb-3 font-medium" style={{ color: "var(--color-brand-dark)" }}>
                {topDriver.feature} is currently the strongest model driver.
              </p>
            )}
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.global_feature_importance} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fontSize: 11, fill: "#7c8ba0" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 12, fill: "#526375" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}% importance`} />
                <Bar dataKey="importance" fill="var(--color-brand)" radius={[0, 6, 6, 0]} barSize={14} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </SectionReveal>
      </div>
    </div>
  );
}

function mainFactorFromStudent(s) {
  // Derive a readable "main factor" label purely from existing metrics when
  // the API doesn't provide one directly — no invented data, just a
  // presentation-layer summary of fields already returned by /api/students.
  const candidates = [
    { label: "Low Attendance", check: s.attendance !== undefined && s.attendance < 60 },
    { label: "Low Engagement", check: s.engagement_score !== undefined && s.engagement_score < 50 },
    { label: "Low Grades", check: s.avg_grade !== undefined && s.avg_grade < 60 },
  ];
  const hit = candidates.find((c) => c.check);
  return hit ? hit.label : "Elevated Risk Score";
}
