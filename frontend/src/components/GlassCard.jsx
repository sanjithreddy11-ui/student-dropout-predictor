import { motion } from "framer-motion";

const LEVELS = {
  primary: "glass-primary",
  secondary: "glass-secondary",
  float: "glass-float",
};

/**
 * Base glass surface used across the app. Wraps children in a translucent,
 * blurred panel with a consistent border/shadow language.
 *
 * level: "primary" | "secondary" | "float" — controls opacity/blur depth.
 * hoverable: adds the lift + shadow + border-highlight interaction.
 * delay: entrance stagger delay in seconds (used with reveal).
 * reveal: if true, animates in on mount (opacity/translateY).
 */
export default function GlassCard({
  children,
  className = "",
  level = "primary",
  hoverable = false,
  reveal = true,
  delay = 0,
  as: Component = motion.div,
  ...rest
}) {
  const base = LEVELS[level] || LEVELS.primary;
  const hoverClass = hoverable ? "glass-hoverable" : "";

  return (
    <Component
      className={`rounded-2xl ${base} ${hoverClass} ${className}`}
      initial={reveal ? { opacity: 0, y: 12 } : false}
      animate={reveal ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
