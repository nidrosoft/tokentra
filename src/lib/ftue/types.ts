/**
 * FTUE (First-Time User Experience) Types
 */

export type TourType =
  | "dashboard_intro"
  | "usage_intro"
  | "providers_intro"
  | "budgets_intro"
  | "alerts_intro"
  | "optimization_intro"
  | "sdk_setup"
  | "team_setup"
  | "new_feature";

export type TooltipTriggerType =
  | "first_hover"
  | "first_visit"
  | "after_action"
  | "time_delay"
  | "empty_state";

export type CelebrationType = "confetti" | "badge" | "modal" | "toast";

export type FeatureUnlockType = "signup" | "action" | "count" | "time" | "plan";

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  highlightPadding?: number;
  showProgress?: boolean;
  showSkip?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  action?: {
    type: "click" | "wait" | "input";
    target?: string;
    waitFor?: string;
    delay?: number;
  };
}

export interface Tour {
  id: TourType;
  name: string;
  description: string;
  triggerCondition: TourTrigger;
  steps: TourStep[];
}

export type TourTrigger =
  | { type: "first_visit"; page: string }
  | { type: "manual"; buttonId: string }
  | { type: "after_action"; action: string }
  | { type: "feature_unlock"; feature: string };

export interface ContextualTooltip {
  id: string;
  target: string;
  title: string;
  content: string;
  trigger: TooltipTrigger;
  dismissBehavior: "once" | "always" | "action";
  actionToTrack?: string;
  priority: number;
  maxShows?: number;
}

export type TooltipTrigger =
  | { type: "first_hover" }
  | { type: "first_visit"; page: string }
  | { type: "after_action"; action: string }
  | { type: "time_delay"; seconds: number }
  | { type: "empty_state"; selector: string };

export interface Celebration {
  id: string;
  type: CelebrationType;
  trigger: string;
  title: string;
  message: string;
  emoji?: string;
  duration?: number;
  action?: {
    label: string;
    url: string;
  };
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: FeatureUnlockCondition;
  celebrationMessage: string;
  learnMoreUrl?: string;
}

export type FeatureUnlockCondition =
  | { type: "signup" }
  | { type: "action"; action: string }
  | { type: "count"; metric: string; threshold: number }
  | { type: "time"; daysAfterSignup: number }
  | { type: "plan"; minimumPlan: string };

export interface EmptyStateConfig {
  title: string;
  description: string;
  icon: string;
  action: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  url: string;
  keywords: string[];
}

export interface QuickAction {
  label: string;
  icon: string;
  action: "tour" | "article" | "chat" | "video";
  target: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContextualHelp {
  page: string;
  articles: HelpArticle[];
  quickActions: QuickAction[];
  faq: FAQ[];
}

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  expectedAction: "click" | "input" | "select" | "navigate";
  expectedValue?: string;
  hint?: string;
}

export interface Walkthrough {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  steps: WalkthroughStep[];
  reward?: {
    type: "badge" | "celebration" | "feature_unlock";
    value: string;
  };
}
