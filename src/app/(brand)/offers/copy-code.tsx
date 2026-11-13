"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {}
      }}
      className="flex h-12 items-center gap-3 rounded-full border border-dashed border-[#1E90FF] bg-[#1E90FF]/[0.06] px-5 font-mono text-lg tracking-wider text-[#050816] transition-colors hover:bg-[#1E90FF]/15"
      aria-label={`Copy code ${code}`}
    >
      {code}
      {copied ? <Check size={18} weight="bold" className="text-[#16a34a]" /> : <Copy size={18} className="text-[#050816]/45" />}
    </button>
  );
}
