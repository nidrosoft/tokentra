/**
 * Attribution Resolver
 * Resolves team/project/cost_center names to IDs for SDK events
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface AttributionInput {
  feature?: string;
  team?: string;
  project?: string;
  costCenter?: string;
  userId?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
}

export interface ResolvedAttribution {
  feature?: string;
  team_id?: string;
  project_id?: string;
  cost_center_id?: string;
  user_id?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
}

// In-memory cache for entity resolution
const entityCache = new Map<string, { id: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class AttributionResolver {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Resolve attribution names to IDs
   */
  async resolve(orgId: string, input: AttributionInput): Promise<ResolvedAttribution> {
    const result: ResolvedAttribution = {
      feature: input.feature,
      environment: input.environment || "production",
      metadata: input.metadata || {},
      user_id: input.userId,
    };

    // Resolve team name to ID
    if (input.team) {
      result.team_id = await this.resolveTeam(orgId, input.team);
    }

    // Resolve project name to ID
    if (input.project) {
      result.project_id = await this.resolveProject(orgId, input.project);
    }

    // Resolve cost center name to ID
    if (input.costCenter) {
      result.cost_center_id = await this.resolveCostCenter(orgId, input.costCenter);
    }

    return result;
  }

  /**
   * Resolve team name to ID
   */
  private async resolveTeam(orgId: string, teamName: string): Promise<string | undefined> {
    // Check if it's already a UUID
    if (this.isUUID(teamName)) {
      return teamName;
    }

    const cacheKey = `team:${orgId}:${teamName.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { data } = await this.supabase
      .from("teams")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", teamName)
      .limit(1)
      .single();

    if (data?.id) {
      this.setCache(cacheKey, data.id);
      return data.id;
    }

    return undefined;
  }

  /**
   * Resolve project name to ID
   */
  private async resolveProject(orgId: string, projectName: string): Promise<string | undefined> {
    if (this.isUUID(projectName)) {
      return projectName;
    }

    const cacheKey = `project:${orgId}:${projectName.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { data } = await this.supabase
      .from("projects")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", projectName)
      .limit(1)
      .single();

    if (data?.id) {
      this.setCache(cacheKey, data.id);
      return data.id;
    }

    return undefined;
  }

  /**
   * Resolve cost center name to ID
   */
  private async resolveCostCenter(orgId: string, costCenterName: string): Promise<string | undefined> {
    if (this.isUUID(costCenterName)) {
      return costCenterName;
    }

    const cacheKey = `cost_center:${orgId}:${costCenterName.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { data } = await this.supabase
      .from("cost_centers")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", costCenterName)
      .limit(1)
      .single();

    if (data?.id) {
      this.setCache(cacheKey, data.id);
      return data.id;
    }

    return undefined;
  }

  /**
   * Check if string is a valid UUID
   */
  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): string | undefined {
    const cached = entityCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.id;
    }
    if (cached) {
      entityCache.delete(key);
    }
    return undefined;
  }

  /**
   * Set cache
   */
  private setCache(key: string, id: string): void {
    entityCache.set(key, {
      id,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    entityCache.clear();
  }
}

// Singleton instance
let instance: AttributionResolver | null = null;

export function getAttributionResolver(): AttributionResolver {
  if (!instance) {
    instance = new AttributionResolver();
  }
  return instance;
}
