import { useEffect, useState } from "react";
import { Users, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { getStats } from "../api";
import StatCard from "../components/StatCard";

const COLORS = { Low: "#1f9d55", Medium: "#c07a12", High: "#c23b32" };

export default function Dashboard({ onGoToStudents }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-6 rounded-xl border" style={{ borderColor: "var(--color-high)", background: "var(--color-high-tint)" }}>
        Couldn't load dashboard data. Is the backend running at the configured API URL? ({error})
      </div>
    );
  }

  if (!stats) {
    return <div className="text-sm" style={{ color: "var(--color-muted)" }}>Loading dashboard…</div>;
  }

  const pieData = stats.risk_distribution;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight">Student Early Warning System</h1>
        <p className="mt-1 text-[15px]" style={{ color: "var(--color-ink-soft)" }}>
          Identify students at risk early. Understand why. Take action sooner.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.total_students.toLocaleString()} sublabel="analyzed" icon={Users} accent="#0e6e6a" />
        <StatCard label="High Risk" value={stats.high_risk.toLocaleString()} sublabel={`${Math.round((stats.high_risk / stats.total_students) * 100)}% of students`} icon={AlertTriangle} accent="#c23b32" />
        <StatCard label="Medium Risk" value={stats.medium_risk.toLocaleString()} sublabel={`${Math.round((stats.medium_risk / stats.total_students) * 100)}% of students`} icon={AlertCircle} accent="#c07a12" />
        <StatCard label="Low Risk" value={stats.low_risk.toLocaleString()} sublabel={`${Math.round((stats.low_risk / stats.total_students) * 100)}% of students`} icon={ShieldCheck} accent="#1f9d55" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border p-6" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-display font-semibold text-[15px] mb-1">Risk Distribution</h2>
          <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>Share of the student body in each risk band.</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={85} paddingAngle={3}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} students`, n]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
          <button
            onClick={() => onGoToStudents("High")}
            className="mt-2 w-full text-sm font-medium py-2.5 rounded-lg transition-colors"
            style={{ background: "var(--color-high-tint)", color: "var(--color-high)" }}
          >
            View {stats.high_risk} high-risk students →
          </button>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-white border p-6" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-display font-semibold text-[15px] mb-1">What drives the model</h2>
          <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
            Global feature importance across all predictions — attendance, grades and engagement lead.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.global_feature_importance} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fontSize: 11, fill: "#7d8798" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 12, fill: "#4b5566" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}% importance`} />
              <Bar dataKey="importance" fill="#0e6e6a" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
