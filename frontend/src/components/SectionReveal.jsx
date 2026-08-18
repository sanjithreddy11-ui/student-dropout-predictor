import { motion } from "framer-motion";

/**
 * Reveals its children once, when they enter the viewport. Used for
 * below-the-fold sections/charts so the app doesn't animate everything on
 * load at once.
 */
export default function SectionReveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
