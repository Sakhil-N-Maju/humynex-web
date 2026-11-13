"use client";

import { useLayoutEffect, useRef, useState } from "react";

const FONT_SIZE = 200;

/**
 * A word set as large as the container allows: the SVG viewBox is fitted to
 * the text's real bounds, so it fills the full width at any screen size.
 */
export function Wordmark({ text, className }: { text: string; className?: string }) {
  const ref = useRef<SVGTextElement>(null);
  // Fit width to the real text, height to the capitals only (Inter's cap
  // height is 0.727 em), so there's no empty ascender band above the letters.
  const CAP = Math.round(FONT_SIZE * 0.727);
  const [box, setBox] = useState({ x: 0, w: 960 });

  useLayoutEffect(() => {
    const fit = () => {
      const b = ref.current?.getBBox();
      if (b && b.width) setBox({ x: b.x, w: b.width });
    };
    fit();
    document.fonts?.ready.then(fit);
  }, [text]);

  return (
    <svg viewBox={`${box.x} ${-CAP} ${box.w} ${CAP}`} className={className} role="img" aria-label={text}>
      <text
        ref={ref}
        x="0"
        y="0"
        fill="currentColor"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontVariationSettings: '"opsz" 32', letterSpacing: "-0.04em" }}
        fontSize={FONT_SIZE}
      >
        {text}
      </text>
    </svg>
  );
}
