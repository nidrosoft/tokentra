"use client";

import { create } from "zustand";

interface FilterState {
  providers: string[];
  models: string[];
  teams: string[];
  projects: string[];
  dateRange: { from: Date; to: Date };
  setProviders: (providers: string[]) => void;
  setModels: (models: string[]) => void;
  setTeams: (teams: string[]) => void;
  setProjects: (projects: string[]) => void;
  setDateRange: (range: { from: Date; to: Date }) => void;
  resetFilters: () => void;
}

const defaultDateRange = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  to: new Date(),
};

export const useFilterStore = create<FilterState>((set) => ({
  providers: [],
  models: [],
  teams: [],
  projects: [],
  dateRange: defaultDateRange,
  setProviders: (providers) => set({ providers }),
  setModels: (models) => set({ models }),
  setTeams: (teams) => set({ teams }),
  setProjects: (projects) => set({ projects }),
  setDateRange: (dateRange) => set({ dateRange }),
  resetFilters: () =>
    set({ providers: [], models: [], teams: [], projects: [], dateRange: defaultDateRange }),
}));
