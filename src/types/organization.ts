export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  ownerId: string;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanTier = "free" | "starter" | "professional" | "enterprise";

export interface OrganizationSettings {
  defaultCurrency: string;
  timezone: string;
  fiscalYearStart: number;
  alertsEnabled: boolean;
  weeklyReportEnabled: boolean;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: Date;
}

export interface OrganizationInvite {
  id: string;
  email: string;
  organizationId: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
}
