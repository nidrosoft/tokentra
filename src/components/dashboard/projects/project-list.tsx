"use client";

import type { FC } from "react";
import { useState } from "react";
import { SearchNormal1 } from "iconsax-react";
import type { Project } from "@/types";
import { Input } from "@/components/base/input/input";
import { ProjectCard } from "./project-card";
import { cx } from "@/utils/cx";

export interface ProjectListProps {
  projects: Project[];
  teamNameMap?: Record<string, string>;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

type FilterValue = "all" | "active" | "archived";

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const SearchIcon = ({ className }: { className?: string }) => (
  <SearchNormal1 size={20} color="currentColor" className={className} variant="Outline" />
);

export const ProjectList: FC<ProjectListProps> = ({
  projects,
  teamNameMap = {},
  onView,
  onEdit,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filter === "all" || project.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={cx("space-y-4", className)}>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          icon={SearchIcon}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-primary text-primary shadow-sm"
                  : "text-tertiary hover:text-secondary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            teamName={project.teamId ? teamNameMap[project.teamId] : undefined}
            onView={onView}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <p className="text-lg font-medium text-secondary">No projects found</p>
          <p className="mt-1 text-sm text-tertiary">
            {searchQuery || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"}
          </p>
        </div>
      )}
    </div>
  );
};
