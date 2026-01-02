// User and UserRole are exported from auth.ts to avoid duplicate exports
// Organization and OrganizationMember are exported from organization.ts to avoid duplicate exports
import type { User } from "./auth";

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
