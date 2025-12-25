import type { User, Organization } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner",
    organizationId: "org_1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "admin",
    organizationId: "org_1",
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
  {
    id: "user_3",
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "member",
    organizationId: "org_1",
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
];

export const mockOrganizations: Organization[] = [
  {
    id: "org_1",
    name: "Acme Corp",
    slug: "acme-corp",
    plan: "professional",
    ownerId: "user_1",
    settings: {
      defaultCurrency: "USD",
      timezone: "America/New_York",
      fiscalYearStart: 1,
      alertsEnabled: true,
      weeklyReportEnabled: true,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
];
