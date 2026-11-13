"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

type Toast = { id: number; tone: "ok" | "bad" | "info"; text: string };

const useToasts = create<{ items: Toast[]; push: (t: Omit<Toast, "id">) => void; drop: (id: number) => void }>(
  (set) => ({
    items: [],
    push: (t) => {
      const id = Date.now() + Math.random();
      set((s) => ({ items: [...s.items.slice(-2), { ...t, id }] }));
      setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), 4200);
    },
    drop: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
  }),
);

export const toast = {
  ok: (text: string) => useToasts.getState().push({ tone: "ok", text }),
  bad: (text: string) => useToasts.getState().push({ tone: "bad", text }),
  info: (text: string) => useToasts.getState().push({ tone: "info", text }),
};

export function Toaster() {
  const { items, drop } = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="surface pointer-events-auto flex items-start gap-3 bg-ink-3/95 px-4 py-3 shadow-[0_18px_50px_rgb(2_6_20/0.6)] backdrop-blur"
          >
            {t.tone === "bad" ? (
              <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-bad" />
            ) : (
              <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-volt-hi" />
            )}
            <p className="flex-1 text-sm leading-relaxed text-fg">{t.text}</p>
            <button onClick={() => drop(t.id)} aria-label="Dismiss" className="text-fg-3 hover:text-fg">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
