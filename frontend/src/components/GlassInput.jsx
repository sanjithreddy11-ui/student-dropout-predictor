export default function GlassInput({ icon: Icon, className = "", ...rest }) {
  return (
    <div className={`relative focus-glow rounded-xl border transition-all duration-200 ${className}`} style={{ borderColor: "var(--color-border)" }}>
      {Icon && (
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-muted)" }} />
      )}
      <input
        className="w-full bg-transparent outline-none text-sm py-2.5"
        style={{ paddingLeft: Icon ? 36 : 14, paddingRight: 14, color: "var(--color-ink)" }}
        {...rest}
      />
    </div>
  );
}
