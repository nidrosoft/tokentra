"use client";

import { useState, useCallback } from "react";

export interface Filters {
  providers: string[];
  models: string[];
  teams: string[];
  projects: string[];
}

const defaultFilters: Filters = {
  providers: [],
  models: [],
  teams: [],
  projects: [],
};

export function useFilters(initial: Partial<Filters> = {}) {
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters, ...initial });

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0);

  return { filters, setFilters, updateFilter, resetFilters, hasActiveFilters };
}
