import { motion } from "framer-motion";

/**
 * A thin horizontal progress bar that animates its fill width from 0 to
 * `value` (0-100) once on mount/change.
 */
export default function AnimatedProgress({ value, color, trackColor = "rgba(20,32,43,0.08)", height = 6, delay = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: trackColor }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color || "var(--color-brand)" }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
