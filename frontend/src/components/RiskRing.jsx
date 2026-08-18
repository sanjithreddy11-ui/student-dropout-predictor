const RISK_COLORS = {
  Low: "var(--color-low)",
  Medium: "var(--color-medium)",
  High: "var(--color-high)",
};

/**
 * Signature visual for the product: a probability ring that recurs across
 * the dashboard, the student table, and the detail/predict views so risk
 * is always read the same way at a glance.
 */
export default function RiskRing({ probability, level, size = 56, strokeWidth = 6, showLabel = true }) {
  const pct = Math.round(probability * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - probability);
  const color = RISK_COLORS[level] || "var(--color-muted)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-mono font-semibold"
          style={{ fontSize: size * 0.26, color: "var(--color-ink)" }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}

export { RISK_COLORS };
