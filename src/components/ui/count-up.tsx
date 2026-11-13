"use client";

// CountUp, modelled on the React Bits component API (to, from, direction,
// delay, duration, separator, startWhen, onStart, onEnd). Spring-driven, starts
// once it scrolls into view, and writes straight to the DOM so React doesn't
// re-render every frame. Renders the final number without JavaScript.

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

type Props = {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number; // seconds
  duration?: number; // seconds, roughly how long the count takes
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
};

export function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const start = direction === "down" ? to : from;
  const end = direction === "down" ? from : to;
  const value = useMotionValue(start);
  // same spring tuning React Bits uses: duration sets stiffness and damping
  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const spring = useSpring(value, { damping, stiffness });
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const decimals = Math.max(
    ...[from, to].map((n) => (String(n).includes(".") ? String(n).split(".")[1].length : 0)),
  );
  const format = (n: number) => {
    const s = Intl.NumberFormat("en-IN", {
      useGrouping: !!separator,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);
    return separator ? s.replace(/,/g, separator) : s;
  };

  // Show the start value once mounted, so the count is visible when it begins.
  useEffect(() => {
    if (ref.current && !reduce) ref.current.textContent = format(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView || !startWhen) return;
    if (reduce) {
      if (ref.current) ref.current.textContent = format(end);
      return;
    }
    onStart?.();
    const t1 = setTimeout(() => value.set(end), delay * 1000);
    const t2 = setTimeout(() => onEnd?.(), (delay + duration) * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, startWhen, reduce]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = format(v);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spring],
  );

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {format(end)}
    </span>
  );
}
