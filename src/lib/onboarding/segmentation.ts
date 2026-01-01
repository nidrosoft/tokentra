/**
 * User Segmentation Logic
 * Determines user segment and recommended onboarding path
 */

import type { 
  UserSegment, 
  CompanySize, 
  MonthlyAISpend, 
  OnboardingProfileInput 
} from "./types";

/**
 * Compute user segment based on profile data
 */
export function computeUserSegment(data: OnboardingProfileInput): UserSegment {
  const { companySize, monthlyAiSpend } = data;

  // Solo developer: 1 person, low spend
  if (companySize === "1") {
    return "solo_developer";
  }

  // Enterprise: 200+ employees or high spend
  if (
    companySize === "201-1000" ||
    companySize === "1000+" ||
    monthlyAiSpend === "over_10000"
  ) {
    return "enterprise";
  }

  // Growth company: 51-200 employees or medium-high spend
  if (
    companySize === "51-200" ||
    monthlyAiSpend === "2000_10000"
  ) {
    return "growth_company";
  }

  // Startup team: 2-50 employees
  return "startup_team";
}

/**
 * Get recommended onboarding path based on segment and spend
 */
export function getRecommendedPath(
  segment: UserSegment,
  monthlyAiSpend?: MonthlyAISpend
): string {
  // High spenders should connect providers first
  if (
    monthlyAiSpend === "2000_10000" ||
    monthlyAiSpend === "over_10000"
  ) {
    return "provider_first";
  }

  // Developers should set up SDK first
  if (segment === "solo_developer") {
    return "sdk_first";
  }

  // Enterprise needs team setup
  if (segment === "enterprise") {
    return "team_first";
  }

  // Default path: provider connection
  return "provider_first";
}

/**
 * Get onboarding steps based on recommended path
 */
export function getOnboardingSteps(recommendedPath: string): string[] {
  switch (recommendedPath) {
    case "sdk_first":
      return ["company_profile", "sdk_setup", "provider_setup", "complete"];
    case "team_first":
      return ["company_profile", "team_invite", "provider_setup", "sdk_setup", "complete"];
    case "provider_first":
    default:
      return ["company_profile", "provider_setup", "sdk_setup", "complete"];
  }
}

/**
 * Get next step URL based on current step and path
 */
export function getNextStepUrl(
  currentStep: string,
  recommendedPath: string
): string {
  const steps = getOnboardingSteps(recommendedPath);
  const currentIndex = steps.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex >= steps.length - 1) {
    return "/dashboard";
  }

  const nextStep = steps[currentIndex + 1];
  
  if (nextStep === "complete") {
    return "/onboarding/complete";
  }

  return `/onboarding/${nextStep.replace("_", "-")}`;
}

/**
 * Calculate onboarding progress percentage
 */
export function calculateProgress(
  completedSteps: string[],
  recommendedPath: string
): number {
  const steps = getOnboardingSteps(recommendedPath);
  const totalSteps = steps.length - 1; // Exclude "complete"
  const completed = completedSteps.filter(s => steps.includes(s)).length;
  return Math.round((completed / totalSteps) * 100);
}

/**
 * Get segment display info
 */
export function getSegmentInfo(segment: UserSegment): {
  label: string;
  description: string;
  features: string[];
} {
  const segmentInfo: Record<UserSegment, { label: string; description: string; features: string[] }> = {
    solo_developer: {
      label: "Solo Developer",
      description: "Individual developer tracking AI costs",
      features: ["SDK integration", "Personal dashboards", "Cost alerts"],
    },
    startup_team: {
      label: "Startup Team",
      description: "Small team managing AI spend",
      features: ["Team dashboards", "Budget management", "Provider sync"],
    },
    growth_company: {
      label: "Growth Company",
      description: "Scaling team with significant AI usage",
      features: ["Advanced analytics", "Cost attribution", "Optimization insights"],
    },
    enterprise: {
      label: "Enterprise",
      description: "Large organization with complex AI infrastructure",
      features: ["Multi-team management", "Custom integrations", "Compliance reporting"],
    },
  };

  return segmentInfo[segment];
}
