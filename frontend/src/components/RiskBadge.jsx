const STYLES = {
  Low: { bg: "var(--color-low-tint)", fg: "var(--color-low)" },
  Medium: { bg: "var(--color-medium-tint)", fg: "var(--color-medium)" },
  High: { bg: "var(--color-high-tint)", fg: "var(--color-high)" },
};

export default function RiskBadge({ level, size = "md", pulse = false }) {
  const s = STYLES[level] || STYLES.Low;
  const pad = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${pad}`}
      style={{ background: s.bg, color: s.fg, borderColor: `${s.fg}26` }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${pulse && level === "High" ? "pulse-dot" : ""}`}
        style={{ background: s.fg }}
      />
      {level} Risk
    </span>
  );
}
