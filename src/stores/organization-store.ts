"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
  id: string;
  name: string;
  slug?: string;
}

interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      currentOrganization: null,
      organizations: [],
      setCurrentOrganization: (org) => set({ currentOrganization: org }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
    }),
    { name: "tokentra-org-store" }
  )
);
