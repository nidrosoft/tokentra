import type { Metadata } from "next";
import { ProjectsOverview } from "@/components/dashboard/projects";

export const metadata: Metadata = {
  title: "Projects - TokenTRA",
  description: "Manage your projects",
};

export default function ProjectsPage() {
  return <ProjectsOverview />;
}
