/**
 * FTUE Analytics & Event Tracking
 */

export const FTUE_EVENTS = {
  // Tour events
  TOUR_STARTED: "ftue_tour_started",
  TOUR_STEP_VIEWED: "ftue_tour_step_viewed",
  TOUR_COMPLETED: "ftue_tour_completed",
  TOUR_SKIPPED: "ftue_tour_skipped",

  // Tooltip events
  TOOLTIP_SHOWN: "ftue_tooltip_shown",
  TOOLTIP_DISMISSED: "ftue_tooltip_dismissed",
  TOOLTIP_ACTION: "ftue_tooltip_action",

  // Walkthrough events
  WALKTHROUGH_STARTED: "ftue_walkthrough_started",
  WALKTHROUGH_STEP_COMPLETED: "ftue_walkthrough_step_completed",
  WALKTHROUGH_COMPLETED: "ftue_walkthrough_completed",
  WALKTHROUGH_ABANDONED: "ftue_walkthrough_abandoned",

  // Feature discovery
  FEATURE_UNLOCKED: "ftue_feature_unlocked",
  FEATURE_CELEBRATED: "ftue_feature_celebrated",

  // Help
  HELP_OPENED: "ftue_help_opened",
  HELP_ARTICLE_VIEWED: "ftue_help_article_viewed",
  HELP_SEARCH: "ftue_help_search",

  // Empty states
  EMPTY_STATE_VIEWED: "ftue_empty_state_viewed",
  EMPTY_STATE_ACTION: "ftue_empty_state_action",

  // Celebrations
  CELEBRATION_SHOWN: "ftue_celebration_shown",
  CELEBRATION_DISMISSED: "ftue_celebration_dismissed",
} as const;

export type FTUEEventType = (typeof FTUE_EVENTS)[keyof typeof FTUE_EVENTS];

export interface FTUEEventProperties {
  tourId?: string;
  stepId?: string;
  stepIndex?: number;
  totalSteps?: number;
  tooltipId?: string;
  walkthroughId?: string;
  featureId?: string;
  celebrationId?: string;
  page?: string;
  searchQuery?: string;
  articleId?: string;
  emptyStateId?: string;
  action?: string;
}

/**
 * Track FTUE event
 */
export function trackFTUEEvent(
  event: FTUEEventType,
  properties?: FTUEEventProperties
): void {
  const eventData = {
    ...properties,
    timestamp: new Date().toISOString(),
  };

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[FTUE]", event, eventData);
  }

  // Track with analytics provider if available
  if (typeof window !== "undefined") {
    // Generic analytics tracking
    const analytics = (window as unknown as { analytics?: { track: (event: string, data: unknown) => void } }).analytics;
    if (analytics?.track) {
      analytics.track(event, eventData);
    }

    // Also send to our backend for FTUE metrics
    fetch("/api/analytics/ftue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...eventData }),
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
    });
  }
}

/**
 * Track tour started
 */
export function trackTourStarted(tourId: string, totalSteps: number): void {
  trackFTUEEvent(FTUE_EVENTS.TOUR_STARTED, { tourId, totalSteps });
}

/**
 * Track tour step viewed
 */
export function trackTourStepViewed(
  tourId: string,
  stepId: string,
  stepIndex: number,
  totalSteps: number
): void {
  trackFTUEEvent(FTUE_EVENTS.TOUR_STEP_VIEWED, {
    tourId,
    stepId,
    stepIndex,
    totalSteps,
  });
}

/**
 * Track tour completed
 */
export function trackTourCompleted(tourId: string): void {
  trackFTUEEvent(FTUE_EVENTS.TOUR_COMPLETED, { tourId });
}

/**
 * Track tour skipped
 */
export function trackTourSkipped(tourId: string, stepIndex: number): void {
  trackFTUEEvent(FTUE_EVENTS.TOUR_SKIPPED, { tourId, stepIndex });
}

/**
 * Track tooltip shown
 */
export function trackTooltipShown(tooltipId: string): void {
  trackFTUEEvent(FTUE_EVENTS.TOOLTIP_SHOWN, { tooltipId });
}

/**
 * Track celebration shown
 */
export function trackCelebrationShown(celebrationId: string): void {
  trackFTUEEvent(FTUE_EVENTS.CELEBRATION_SHOWN, { celebrationId });
}
