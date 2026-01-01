"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useFTUEStore } from "@/lib/ftue/store";
import { getTourForPage, getTour } from "@/lib/ftue/tours";
import { getCelebrationForTrigger } from "@/lib/ftue/celebrations";
import type { Tour, Celebration } from "@/lib/ftue/types";
import { ProductTour } from "./ProductTour";
import { CelebrationManager } from "./Celebration";
import { HelpWidget } from "./HelpWidget";

interface FTUEContextValue {
  startTour: (tourId: string) => void;
  triggerCelebration: (trigger: string) => void;
  completeAction: (action: string) => void;
  isNewUser: boolean;
}

const FTUEContext = createContext<FTUEContextValue | null>(null);

export function useFTUE() {
  const context = useContext(FTUEContext);
  if (!context) {
    throw new Error("useFTUE must be used within FTUEProvider");
  }
  return context;
}

interface FTUEProviderProps {
  children: ReactNode;
}

export function FTUEProvider({ children }: FTUEProviderProps) {
  const pathname = usePathname();
  
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [activeCelebration, setActiveCelebration] = useState<Celebration | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Track which pages we've already processed to avoid duplicate visits
  const processedPages = useRef<Set<string>>(new Set());
  const hasCheckedTour = useRef(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for first visit tours - only run once on mount
  useEffect(() => {
    if (!mounted) return;
    if (hasCheckedTour.current) return;
    hasCheckedTour.current = true;

    // Check if this page has a tour and user hasn't seen it
    const pageTour = getTourForPage(pathname);
    if (pageTour) {
      const state = useFTUEStore.getState();
      if (!state.completedTours.includes(pageTour.id) && !state.skippedTours.includes(pageTour.id)) {
        // Small delay to let page render
        const timer = setTimeout(() => {
          setActiveTour(pageTour);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, mounted]);

  // Track page visits separately
  useEffect(() => {
    if (!mounted) return;
    if (processedPages.current.has(pathname)) return;
    processedPages.current.add(pathname);
    
    const state = useFTUEStore.getState();
    if (!state.visitedPages.includes(pathname)) {
      useFTUEStore.getState().visitPage(pathname);
    }
  }, [pathname, mounted]);

  const startTour = useCallback((tourId: string) => {
    const tour = getTour(tourId);
    if (tour) {
      setActiveTour(tour);
      useFTUEStore.getState().startTour(tourId);
    }
  }, []);

  const handleTourComplete = useCallback(() => {
    if (activeTour) {
      useFTUEStore.getState().completeTour(activeTour.id);
      setActiveTour(null);
    }
  }, [activeTour]);

  const handleTourSkip = useCallback(() => {
    if (activeTour) {
      useFTUEStore.getState().skipTour(activeTour.id);
      setActiveTour(null);
    }
  }, [activeTour]);

  const triggerCelebration = useCallback((trigger: string) => {
    const celebration = getCelebrationForTrigger(trigger);
    const state = useFTUEStore.getState();
    if (celebration && !state.celebratedFeatures.includes(celebration.id)) {
      setActiveCelebration(celebration);
      state.celebrateFeature(celebration.id);
    }
  }, []);

  const handleCelebrationComplete = useCallback(() => {
    setActiveCelebration(null);
  }, []);

  const completeAction = useCallback((action: string) => {
    useFTUEStore.getState().completeAction(action);
    triggerCelebration(action);
  }, [triggerCelebration]);

  const handleRestartOnboarding = useCallback(() => {
    useFTUEStore.getState().reset();
    window.location.href = "/onboarding";
  }, []);

  const isNewUser = useFTUEStore.getState().visitedPages.length < 3;

  const contextValue: FTUEContextValue = {
    startTour,
    triggerCelebration,
    completeAction,
    isNewUser,
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <FTUEContext.Provider value={contextValue}>
      {children}

      {/* Product Tour */}
      {activeTour && (
        <ProductTour
          tour={activeTour}
          isOpen={true}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      {/* Celebrations */}
      <CelebrationManager
        celebration={activeCelebration}
        onComplete={handleCelebrationComplete}
      />

      {/* Help Widget */}
      <HelpWidget
        currentPage={pathname}
        onStartTour={startTour}
        onRestartOnboarding={handleRestartOnboarding}
      />
    </FTUEContext.Provider>
  );
}
