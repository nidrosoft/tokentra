/**
 * FTUE State Management Store
 * Uses Zustand with persistence
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FTUEState {
  // Tour state
  activeTour: string | null;
  completedTours: string[];
  skippedTours: string[];

  // Tooltip state
  dismissedTooltips: string[];
  tooltipShowCounts: Record<string, number>;

  // Walkthrough state
  activeWalkthrough: string | null;
  completedWalkthroughs: string[];

  // Feature discovery
  unlockedFeatures: string[];
  celebratedFeatures: string[];

  // Page visit tracking
  visitedPages: string[];

  // Actions completed
  completedActions: string[];

  // Actions
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  skipTour: (tourId: string) => void;

  dismissTooltip: (tooltipId: string) => void;
  incrementTooltipShow: (tooltipId: string) => void;

  startWalkthrough: (walkthroughId: string) => void;
  completeWalkthrough: (walkthroughId: string) => void;

  unlockFeature: (featureId: string) => void;
  celebrateFeature: (featureId: string) => void;

  visitPage: (page: string) => void;
  completeAction: (action: string) => void;

  hasVisitedPage: (page: string) => boolean;
  hasCompletedAction: (action: string) => boolean;
  hasCompletedTour: (tourId: string) => boolean;
  hasDismissedTooltip: (tooltipId: string) => boolean;

  reset: () => void;
}

const initialState = {
  activeTour: null,
  completedTours: [],
  skippedTours: [],
  dismissedTooltips: [],
  tooltipShowCounts: {},
  activeWalkthrough: null,
  completedWalkthroughs: [],
  unlockedFeatures: ["basic_dashboard"],
  celebratedFeatures: [],
  visitedPages: [],
  completedActions: [],
};

export const useFTUEStore = create<FTUEState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Tour actions
      startTour: (tourId) => set({ activeTour: tourId }),
      completeTour: (tourId) =>
        set((state) => ({
          activeTour: null,
          completedTours: [...new Set([...state.completedTours, tourId])],
        })),
      skipTour: (tourId) =>
        set((state) => ({
          activeTour: null,
          skippedTours: [...new Set([...state.skippedTours, tourId])],
        })),

      // Tooltip actions
      dismissTooltip: (tooltipId) =>
        set((state) => ({
          dismissedTooltips: [...new Set([...state.dismissedTooltips, tooltipId])],
        })),
      incrementTooltipShow: (tooltipId) =>
        set((state) => ({
          tooltipShowCounts: {
            ...state.tooltipShowCounts,
            [tooltipId]: (state.tooltipShowCounts[tooltipId] || 0) + 1,
          },
        })),

      // Walkthrough actions
      startWalkthrough: (walkthroughId) => set({ activeWalkthrough: walkthroughId }),
      completeWalkthrough: (walkthroughId) =>
        set((state) => ({
          activeWalkthrough: null,
          completedWalkthroughs: [...new Set([...state.completedWalkthroughs, walkthroughId])],
        })),

      // Feature actions
      unlockFeature: (featureId) =>
        set((state) => ({
          unlockedFeatures: [...new Set([...state.unlockedFeatures, featureId])],
        })),
      celebrateFeature: (featureId) =>
        set((state) => ({
          celebratedFeatures: [...new Set([...state.celebratedFeatures, featureId])],
        })),

      // Page visit tracking
      visitPage: (page) =>
        set((state) => ({
          visitedPages: [...new Set([...state.visitedPages, page])],
        })),

      // Action tracking
      completeAction: (action) =>
        set((state) => ({
          completedActions: [...new Set([...state.completedActions, action])],
        })),

      // Getters
      hasVisitedPage: (page) => get().visitedPages.includes(page),
      hasCompletedAction: (action) => get().completedActions.includes(action),
      hasCompletedTour: (tourId) => get().completedTours.includes(tourId),
      hasDismissedTooltip: (tooltipId) => get().dismissedTooltips.includes(tooltipId),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "tokentra-ftue",
    }
  )
);
