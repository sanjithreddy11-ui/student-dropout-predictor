import { motion } from "framer-motion";

/**
 * Wraps a page's content with a subtle, fast entrance animation.
 * Use with a `key` on the page component (e.g. the active route id) so it
 * replays on navigation.
 */
export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
