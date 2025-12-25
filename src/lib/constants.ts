export const APP_NAME = "TokenTRA";
export const APP_DESCRIPTION = "Unified AI Cost Intelligence Platform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const PROVIDERS = {
  openai: {
    id: "openai",
    name: "OpenAI",
    color: "#10A37F",
    logo: "/images/providers/openai.svg",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    color: "#D4A574",
    logo: "/images/providers/anthropic.svg",
  },
  azure: {
    id: "azure",
    name: "Azure OpenAI",
    color: "#0078D4",
    logo: "/images/providers/azure.svg",
  },
  google: {
    id: "google",
    name: "Google Vertex AI",
    color: "#4285F4",
    logo: "/images/providers/google.svg",
  },
  aws: {
    id: "aws",
    name: "AWS Bedrock",
    color: "#FF9900",
    logo: "/images/providers/aws.svg",
  },
} as const;

export const DATE_PRESETS = {
  today: "Today",
  yesterday: "Yesterday",
  last7d: "Last 7 days",
  last30d: "Last 30 days",
  last90d: "Last 90 days",
  thisMonth: "This month",
  lastMonth: "Last month",
  custom: "Custom range",
} as const;

export const GRANULARITY_OPTIONS = {
  hour: "Hourly",
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
} as const;

export const BUDGET_PERIODS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
} as const;

export const ALERT_TYPES = {
  spend_threshold: "Spend Threshold",
  spend_anomaly: "Spend Anomaly",
  budget_threshold: "Budget Threshold",
  forecast_exceeded: "Forecast Exceeded",
  provider_error: "Provider Error",
  usage_spike: "Usage Spike",
} as const;

export const USER_ROLES = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
} as const;

export const PLAN_TIERS = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
} as const;
