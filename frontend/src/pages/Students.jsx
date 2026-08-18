import { useEffect, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { getStudents } from "../api";
import RiskBadge from "../components/RiskBadge";

const RISK_TABS = ["All", "High", "Medium", "Low"];

const COLUMNS = [
  { key: "student_id", label: "Student" },
  { key: "attendance", label: "Attendance" },
  { key: "avg_grade", label: "Grade" },
  { key: "engagement_score", label: "Engagement" },
  { key: "risk_level", label: "Risk" },
  { key: "risk_probability", label: "Probability" },
];

export default function Students({ initialRisk = "All", onSelectStudent }) {
  const [risk, setRisk] = useState(initialRisk);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("risk_probability");
  const [order, setOrder] = useState("desc");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Students</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Search, filter, and drill into any student's risk profile.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student ID…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={{ borderColor: "var(--color-border)", background: "white" }}
          />
        </div>
        <div className="flex gap-1.5 rounded-lg p-1" style={{ background: "var(--color-bg)" }}>
          {RISK_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setRisk(tab)}
              className="px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                background: risk === tab ? "white" : "transparent",
                color: risk === tab ? "var(--color-ink)" : "var(--color-muted)",
                boxShadow: risk === tab ? "0 1px 2px rgba(16,21,31,0.08)" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full text-sm">
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
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center" style={{ color: "var(--color-muted)" }}>
                  Loading students…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center" style={{ color: "var(--color-high)" }}>
                  Couldn't load students: {error}
                </td>
              </tr>
            )}
            {!loading && !error && students.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center" style={{ color: "var(--color-muted)" }}>
                  No students match this search or filter.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              students.map((s) => (
                <tr
                  key={s.student_id}
                  onClick={() => onSelectStudent(s.student_id)}
                  className="border-b last:border-0 cursor-pointer hover:bg-[var(--color-bg)] transition-colors"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <td className="px-5 py-3 font-mono font-medium">{s.student_id}</td>
                  <td className="px-5 py-3 font-mono" style={{ color: "var(--color-ink-soft)" }}>{s.attendance}%</td>
                  <td className="px-5 py-3 font-mono" style={{ color: "var(--color-ink-soft)" }}>{s.avg_grade}%</td>
                  <td className="px-5 py-3 font-mono" style={{ color: "var(--color-ink-soft)" }}>{s.engagement_score}%</td>
                  <td className="px-5 py-3"><RiskBadge level={s.risk_level} size="sm" /></td>
                  <td className="px-5 py-3 font-mono font-semibold">{Math.round(s.risk_probability * 100)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && !error && (
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Showing {students.length} student{students.length === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}
