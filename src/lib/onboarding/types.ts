/**
 * Onboarding System Types
 */

export type OnboardingStatus = "not_started" | "in_progress" | "completed" | "skipped";

export type OnboardingStep = 
  | "welcome"
  | "company_profile"
  | "provider_setup"
  | "sdk_setup"
  | "team_invite"
  | "complete";

export type UserSegment = 
  | "solo_developer"
  | "startup_team"
  | "growth_company"
  | "enterprise";

export type UserRole = 
  | "developer"
  | "engineering_manager"
  | "product_manager"
  | "finance"
  | "executive"
  | "other";

export type CompanySize = 
  | "1"
  | "2-10"
  | "11-50"
  | "51-200"
  | "201-1000"
  | "1000+";

export type MonthlyAISpend = 
  | "under_100"
  | "100_500"
  | "500_2000"
  | "2000_10000"
  | "over_10000";

export type AIProvider = 
  | "openai"
  | "anthropic"
  | "google"
  | "azure"
  | "aws_bedrock"
  | "cohere"
  | "other";

export type UseCase = 
  | "chatbot"
  | "content_generation"
  | "code_assistant"
  | "data_analysis"
  | "customer_support"
  | "search"
  | "other";

export type OnboardingGoal = 
  | "track_costs"
  | "set_budgets"
  | "optimize_spend"
  | "team_visibility"
  | "compliance"
  | "forecasting";

export interface OnboardingProfile {
  id: string;
  user_id: string;
  organization_id?: string;
  onboarding_status: OnboardingStatus;
  onboarding_step?: OnboardingStep;
  onboarding_completed_at?: string;
  onboarding_skipped_steps: string[];
  onboarding_metadata: Record<string, unknown>;
  user_role?: UserRole;
  company_name?: string;
  company_size?: CompanySize;
  company_website?: string;
  industry?: string;
  monthly_ai_spend?: MonthlyAISpend;
  ai_providers: AIProvider[];
  use_cases: UseCase[];
  goals: OnboardingGoal[];
  user_segment?: UserSegment;
  recommended_path?: string;
  profile_completed: boolean;
  completed_at?: string;
  skipped_steps: string[];
  created_at: string;
  updated_at: string;
}

export interface OnboardingEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface OnboardingProfileInput {
  userRole?: UserRole;
  companyName?: string;
  companySize?: CompanySize;
  companyWebsite?: string;
  industry?: string;
  monthlyAiSpend?: MonthlyAISpend;
  aiProviders?: AIProvider[];
  useCases?: UseCase[];
  goals?: OnboardingGoal[];
  teamInvites?: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  completionEvent: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: number;
  category: "setup" | "optimize" | "team";
}

export interface OnboardingChecklist {
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  percentComplete: number;
}
