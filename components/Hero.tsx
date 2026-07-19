"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  };

  const item = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      <motion.div variants={item} className="font-mono text-xs text-muted">
        ~/matthew
      </motion.div>
      <motion.h1 variants={item} className="mt-2 font-display text-4xl font-bold text-ink">
        Matthew.
      </motion.h1>
      <motion.p variants={item} className="mt-2 font-mono text-sm text-muted">
        builds things. breaks things. writes it down.
      </motion.p>
    </motion.div>
  );
}
