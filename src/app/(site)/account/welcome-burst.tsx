"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Gear } from "@phosphor-icons/react";

/** One-time welcome after signup: the bonus points "drop in" as gears. */
export function WelcomeBurst({ points }: { points: number }) {
  const [show, setShow] = useState(true);
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4200);
    window.history.replaceState(null, "", "/account");
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 backdrop-blur-sm"
          onClick={() => setShow(false)}
          role="status"
        >
          {!reduce &&
            Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-volt-hi"
                initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
                animate={{
                  x: Math.cos((i / 14) * Math.PI * 2) * (180 + (i % 3) * 60),
                  y: Math.sin((i / 14) * Math.PI * 2) * (140 + (i % 4) * 40),
                  opacity: [0, 1, 0],
                  rotate: 220,
                  scale: 1,
                }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                <Gear size={18 + (i % 3) * 8} weight="duotone" />
              </motion.span>
            ))}
          <motion.div
            initial={{ scale: 0.85, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="text-center"
          >
            <p className="text-fg-2">Account created</p>
            <p className="display-wide mt-2 text-6xl text-volt-hi">+{points}</p>
            <p className="mt-2 text-lg">points, ready to spend</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
