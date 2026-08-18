import GlassCard from "./GlassCard";
import AnimatedNumber from "./AnimatedNumber";

/**
 * Premium KPI card. `value` may be a number (animated count-up) or a
 * pre-formatted string (rendered as-is, e.g. "83%").
 */
export default function StatCard({ label, value, sublabel, accent, icon: Icon, delay = 0, formatter }) {
  const isNumeric = typeof value === "number";
  const glow = accent ? `${accent}14` : "var(--color-brand-tint)";

  return (
    <GlassCard hoverable delay={delay} className="p-5 flex flex-col gap-3 relative overflow-hidden">
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: glow, filter: "blur(20px)" }}
      />
      <div className="flex items-center justify-between relative">
        <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
        {Icon && (
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: accent ? `${accent}1a` : "var(--color-brand-tint)" }}
          >
            <Icon size={16} style={{ color: accent || "var(--color-brand)" }} />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 relative">
        <span className="font-display text-3xl font-semibold tracking-tight">
          {isNumeric ? <AnimatedNumber value={value} formatter={formatter} /> : value}
        </span>
        {sublabel && (
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {sublabel}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
