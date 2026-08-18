import { useEffect, useState } from "react";
import { Search, ArrowUpDown, ArrowRight } from "lucide-react";
import { getStudents, getStats } from "../api";
import RiskBadge from "../components/RiskBadge";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassTabs from "../components/GlassTabs";
import PageHeader from "../components/PageHeader";
import AnimatedProgress from "../components/AnimatedProgress";
import { RISK_COLORS } from "../components/RiskRing";

const RISK_TABS = ["All", "High", "Medium", "Low"];

const COLUMNS = [
  { key: "student_id", label: "Student" },
  { key: "attendance", label: "Attendance" },
  { key: "avg_grade", label: "Grade" },
  { key: "engagement_score", label: "Engagement" },
  { key: "risk_level", label: "Risk" },
  { key: "risk_probability", label: "Probability" },
];

function RowSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
          <td colSpan={7} className="px-5 py-3.5">
            <div className="skeleton h-5 w-full rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function Students({ initialRisk = "All", onSelectStudent }) {
  const [risk, setRisk] = useState(initialRisk);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("risk_probability");
  const [order, setOrder] = useState("desc");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getStats().then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      getStudents({ search, risk, sortBy, order })
        .then((data) => {
          setStudents(data);
          setError(null);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 200); // debounce search typing
    return () => clearTimeout(handle);
  }, [search, risk, sortBy, order]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setOrder("desc");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Students" subtitle="Search, filter, and understand individual student risk." />

      {summary && (
        <div className="flex flex-wrap gap-3">
          <SummaryPill label="Total" value={summary.total_students} />
          <SummaryPill label="High Risk" value={summary.high_risk} color="var(--color-high)" />
          <SummaryPill label="Medium Risk" value={summary.medium_risk} color="var(--color-medium)" />
          <SummaryPill label="Low Risk" value={summary.low_risk} color="var(--color-low)" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <GlassInput
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student ID..."
          className="w-full sm:w-72"
        />
        <GlassTabs options={RISK_TABS} value={risk} onChange={setRisk} />
      </div>

      <GlassCard reveal={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="text-left px-5 py-3 font-medium select-none" style={{ color: "var(--color-muted)" }}>
                    <button className="flex items-center gap-1 hover:text-inherit" onClick={() => toggleSort(col.key)}>
                      {col.label}
                      <ArrowUpDown size={12} className={sortBy === col.key ? "opacity-100" : "opacity-30"} />
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <RowSkeleton />}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ color: "var(--color-high)" }}>
                    Couldn't load students: {error}
                  </td>
                </tr>
              )}
              {!loading && !error && students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ color: "var(--color-muted)" }}>
                    No students match this search or filter.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                students.map((s, i) => (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s.student_id)}
                    className="border-b last:border-0 cursor-pointer transition-colors duration-150 hover:bg-white/60"
                    style={{ borderColor: "var(--color-border)", animation: `fade-in-up 350ms both ${Math.min(i, 8) * 40}ms` }}
                  >
                    <td className="px-5 py-3 font-mono font-medium">{s.student_id}</td>
                    <td className="px-5 py-3 font-mono" style={{ color: "var(--color-ink-soft)" }}>{s.attendance}%</td>
                    <td className="px-5 py-3 font-mono" style={{ color: "var(--color-ink-soft)" }}>{s.avg_grade}%</td>
                    <td className="px-5 py-3 font-mono" style={{ color: "var(--color-ink-soft)" }}>{s.engagement_score}%</td>
                    <td className="px-5 py-3"><RiskBadge level={s.risk_level} size="sm" /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 w-28">
                        <span className="font-mono font-semibold text-xs w-9 shrink-0">{Math.round(s.risk_probability * 100)}%</span>
                        <AnimatedProgress
                          value={s.risk_probability * 100}
                          color={RISK_COLORS[s.risk_level]}
                          height={5}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-brand-dark)" }}>
                        View <ArrowRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      {!loading && !error && (
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Showing {students.length} student{students.length === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}

function SummaryPill({ label, value, color }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 glass-secondary">
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>{label}</span>
      <span className="text-sm font-semibold font-mono" style={{ color: "var(--color-ink)" }}>{value.toLocaleString()}</span>
    </div>
  );
}
