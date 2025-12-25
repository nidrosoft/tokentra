"use client";

import { create } from "zustand";

interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
}

interface DashboardState {
  widgets: DashboardWidget[];
  isEditing: boolean;
  selectedWidgetId: string | null;
  setWidgets: (widgets: DashboardWidget[]) => void;
  addWidget: (widget: DashboardWidget) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  setSelectedWidgetId: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  widgets: [],
  isEditing: false,
  selectedWidgetId: null,
  setWidgets: (widgets) => set({ widgets }),
  addWidget: (widget) =>
    set((state) => ({ widgets: [...state.widgets, widget] })),
  updateWidget: (id, updates) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),
  removeWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    })),
  setIsEditing: (isEditing) => set({ isEditing }),
  setSelectedWidgetId: (selectedWidgetId) => set({ selectedWidgetId }),
}));
