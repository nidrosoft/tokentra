export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  user: User;
  joinedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  billingEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanTier = "free" | "starter" | "pro" | "business" | "enterprise";

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}
