import { motion } from "framer-motion";

export default function GlassTabs({ options, value, onChange, layoutId = "glass-tabs-indicator" }) {
  return (
    <div className="inline-flex gap-1 rounded-xl p-1 glass-secondary" role="tablist">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className="relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
            style={{ color: active ? "var(--color-brand-dark)" : "var(--color-muted)" }}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(47,111,109,0.22)",
                  boxShadow: "var(--shadow-glass-sm)",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
