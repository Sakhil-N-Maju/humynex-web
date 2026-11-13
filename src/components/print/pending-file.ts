"use client";

import { create } from "zustand";

/** Hands a dropped model file from the home page to the /print quoter. */
export const usePendingModel = create<{ file: File | null; set: (f: File | null) => void }>((set) => ({
  file: null,
  set: (file) => set({ file }),
}));
