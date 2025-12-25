"use client";

import { useState, useCallback } from "react";

export interface DateRange {
  from: Date;
  to: Date;
  preset?: string;
}

const presets = {
  today: () => ({ from: new Date(), to: new Date() }),
  yesterday: () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return { from: d, to: d };
  },
  last7d: () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return { from, to };
  },
  last30d: () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  },
  thisMonth: () => {
    const now = new Date();
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  },
  lastMonth: () => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0),
    };
  },
};

export function useDateRange(defaultPreset: keyof typeof presets = "last30d") {
  const [dateRange, setDateRange] = useState<DateRange>({
    ...presets[defaultPreset](),
    preset: defaultPreset,
  });

  const setPreset = useCallback((preset: keyof typeof presets) => {
    setDateRange({ ...presets[preset](), preset });
  }, []);

  const setCustomRange = useCallback((from: Date, to: Date) => {
    setDateRange({ from, to, preset: undefined });
  }, []);

  return { dateRange, setDateRange, setPreset, setCustomRange, presets: Object.keys(presets) };
}
