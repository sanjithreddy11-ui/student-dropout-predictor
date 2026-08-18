export default function GlassBadge({ children, dot = false, dotColor = "var(--color-brand)", pulse = false }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium glass-secondary"
      style={{ color: "var(--color-ink-soft)" }}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${pulse ? "pulse-dot" : ""}`}
          style={{ background: dotColor }}
        />
      )}
      {children}
    </span>
  );
}
