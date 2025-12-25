"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  currency: string;
  locale: string;
  timezone: string;
  compactNumbers: boolean;
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
  setTimezone: (timezone: string) => void;
  setCompactNumbers: (compact: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: "USD",
      locale: "en-US",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      compactNumbers: true,
      setCurrency: (currency) => set({ currency }),
      setLocale: (locale) => set({ locale }),
      setTimezone: (timezone) => set({ timezone }),
      setCompactNumbers: (compactNumbers) => set({ compactNumbers }),
    }),
    { name: "tokentra-preferences-store" }
  )
);
