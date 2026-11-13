"use client";

import { motion, useReducedMotion } from "motion/react";

/** Fade-and-rise on first entry into the viewport. Used to pace long pages. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as = "div",
  theme,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  /** Sets data-theme so the dock reads this surface correctly. */
  theme?: "light" | "dark";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      data-theme={theme}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}
