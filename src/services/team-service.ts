import type { Team, TeamMember, TeamCostSummary } from "@/types";

export class TeamService {
  async getTeams(organizationId: string): Promise<Team[]> {
    // TODO: Implement with Supabase
    return [];
  }

  async getTeam(teamId: string): Promise<Team | null> {
    // TODO: Implement with Supabase
    return null;
  }

  async createTeam(data: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
    // TODO: Implement with Supabase
    return {} as Team;
  }

  async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
    // TODO: Implement with Supabase
    return {} as Team;
  }

  async deleteTeam(teamId: string): Promise<void> {
    // TODO: Implement with Supabase
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    // TODO: Implement with Supabase
    return [];
  }

  async addTeamMember(teamId: string, userId: string, role: string): Promise<TeamMember> {
    // TODO: Implement with Supabase
    return {} as TeamMember;
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    // TODO: Implement with Supabase
  }

  async getTeamCostSummary(teamId: string): Promise<TeamCostSummary> {
    // TODO: Implement with Supabase
    return {} as TeamCostSummary;
  }
}

export const teamService = new TeamService();
