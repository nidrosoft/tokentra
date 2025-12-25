"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  dateRange: {
    from: Date;
    to: Date;
    preset: string;
  };
  filters: {
    providers: string[];
    models: string[];
    teams: string[];
    projects: string[];
  };
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setDateRange: (range: { from: Date; to: Date; preset: string }) => void;
  setFilters: (filters: Partial<AppState["filters"]>) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  providers: [],
  models: [],
  teams: [],
  projects: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: "system",
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
        preset: "last30d",
      },
      filters: defaultFilters,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
      setDateRange: (dateRange) => set({ dateRange }),
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: "tokentra-app-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
