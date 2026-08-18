import { LayoutGrid, Users, Sparkles, Activity, ShieldAlert } from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "students", label: "Students", icon: Users },
  { id: "predict", label: "Predict Risk", icon: Sparkles },
  { id: "performance", label: "Model Performance", icon: Activity },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside
      className="w-64 shrink-0 border-r flex flex-col h-screen sticky top-0"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-brand)" }}
          >
            <ShieldAlert size={17} className="text-white" />
          </span>
          <div className="leading-tight">
            <div className="font-display font-semibold text-[15px]">Early Warning</div>
            <div className="text-[11px]" style={{ color: "var(--color-muted)" }}>
              Student Risk System
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={{
                background: isActive ? "var(--color-brand-tint)" : "transparent",
                color: isActive ? "var(--color-brand-dark)" : "var(--color-ink-soft)",
              }}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mx-3 mb-5 rounded-xl text-xs leading-relaxed" style={{ background: "var(--color-bg)", color: "var(--color-muted)" }}>
        <strong style={{ color: "var(--color-ink-soft)" }}>Responsible use.</strong> Risk estimates
        support early intervention. They should never be the sole basis for decisions about a student.
      </div>
    </aside>
  );
}
