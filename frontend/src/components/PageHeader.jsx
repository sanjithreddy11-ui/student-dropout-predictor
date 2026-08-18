export default function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 className="font-display text-[28px] sm:text-[32px] font-semibold tracking-tight" style={{ color: "var(--color-ink)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-[15px]" style={{ color: "var(--color-ink-soft)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {(badge || actions) && (
        <div className="flex items-center gap-2 shrink-0">
          {badge}
          {actions}
        </div>
      )}
    </div>
  );
}
