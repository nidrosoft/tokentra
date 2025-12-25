import type { Project, ProjectCostSummary } from "@/types";

export class ProjectService {
  async getProjects(organizationId: string): Promise<Project[]> {
    // TODO: Implement with Supabase
    return [];
  }

  async getProject(projectId: string): Promise<Project | null> {
    // TODO: Implement with Supabase
    return null;
  }

  async createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    // TODO: Implement with Supabase
    return {} as Project;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    // TODO: Implement with Supabase
    return {} as Project;
  }

  async deleteProject(projectId: string): Promise<void> {
    // TODO: Implement with Supabase
  }

  async getProjectCosts(projectId: string): Promise<ProjectCostSummary> {
    // TODO: Implement with Supabase
    return {} as ProjectCostSummary;
  }
}

export const projectService = new ProjectService();
