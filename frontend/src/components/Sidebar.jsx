import { LayoutGrid, Users, Sparkles, Activity, ShieldAlert, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "students", label: "Students", icon: Users },
  { id: "predict", label: "Predict Risk", icon: Sparkles },
  { id: "performance", label: "Model Performance", icon: Activity },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "var(--color-brand)" }}
      >
        <ShieldAlert size={17} className="text-white" />
      </span>
      <div className="leading-tight">
        <div className="font-display font-semibold text-[15px]" style={{ color: "var(--color-ink)" }}>
          Early Warning
        </div>
        <div className="text-[11px]" style={{ color: "var(--color-muted)" }}>
          Student Risk System
        </div>
      </div>
    </div>
  );
}

function NavList({ active, onNavigate }) {
  return (
    <nav className="flex-1 px-3 space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors duration-200"
            style={{ color: isActive ? "var(--color-brand-dark)" : "var(--color-ink-soft)" }}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "var(--color-brand-tint)",
                  border: "1px solid rgba(47,111,109,0.22)",
                  boxShadow: "0 4px 14px -6px rgba(47,111,109,0.28)",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon size={17} className="relative z-10" />
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ResponsibleUseNote() {
  return (
    <div
      className="p-4 mx-3 mb-5 rounded-xl text-xs leading-relaxed glass-secondary"
      style={{ color: "var(--color-muted)" }}
    >
      <strong style={{ color: "var(--color-ink-soft)" }}>Responsible use.</strong> Risk estimates
      support early intervention. They should never be the sole basis for decisions about a student.
    </div>
  );
}

export default function Sidebar({ active, onNavigate, mobileOpen, onCloseMobile }) {
  const handleNavigate = (id) => {
    onNavigate(id);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 z-20"
        style={{ borderRight: "1px solid var(--color-border)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)" }}
      >
        <div className="px-6 pt-7 pb-6">
          <Brand />
        </div>
        <NavList active={active} onNavigate={handleNavigate} />
        <ResponsibleUseNote />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 w-72 flex flex-col lg:hidden"
              style={{ background: "#ffffff" }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-6 pt-7 pb-6 flex items-center justify-between">
                <Brand />
                <button onClick={onCloseMobile} className="p-2 rounded-lg" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <NavList active={active} onNavigate={handleNavigate} />
              <ResponsibleUseNote />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2.5 rounded-xl glass-secondary"
      aria-label="Open menu"
    >
      <Menu size={18} />
    </button>
  );
}
