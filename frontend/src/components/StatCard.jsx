export default function StatCard({ label, value, sublabel, accent, icon: Icon }) {
  return (
    <div
      className="rounded-2xl bg-white border p-5 flex flex-col gap-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
        {Icon && (
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: accent ? `${accent}1a` : "var(--color-brand-tint)" }}
          >
            <Icon size={16} style={{ color: accent || "var(--color-brand)" }} />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold tracking-tight">{value}</span>
        {sublabel && (
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
