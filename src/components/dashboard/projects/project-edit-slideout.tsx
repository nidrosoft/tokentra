"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Folder2,
  Trash,
  Add,
  CloseCircle,
} from "iconsax-react";
import type { Project } from "@/types";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";
import { useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { ProjectTeamsManager } from "./project-teams-manager";

interface ProjectEditSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  teamName?: string;
  availableTeams?: { id: string; name: string }[];
  onSave?: (projectId: string, updates: Partial<Project>) => void;
  onDelete?: (projectId: string) => void;
}

const ProjectIcon = ({ className }: { className?: string }) => (
  <Folder2 size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const TrashIcon = ({ className }: { className?: string }) => (
  <Trash size={16} color="currentColor" className={className} variant="Outline" />
);

const mockTeams = [
  { id: "team-1", name: "Engineering" },
  { id: "team-2", name: "Data Science" },
  { id: "team-3", name: "Product" },
  { id: "team-4", name: "Research" },
];

export const ProjectEditSlideout: FC<ProjectEditSlideoutProps> = ({
  isOpen,
  onOpenChange,
  project,
  teamName,
  availableTeams = mockTeams,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [teamId, setTeamId] = useState(project.teamId || "");
  const [status, setStatus] = useState<"active" | "archived">(project.status);
  const [monthlyBudget, setMonthlyBudget] = useState(project.monthlyBudget?.toString() || "");
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [newTag, setNewTag] = useState("");
  const [apiKeyPatterns, setApiKeyPatterns] = useState<string[]>(project.apiKeyPatterns || []);
  const [newPattern, setNewPattern] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  // Reset form when project changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description || "");
    setTeamId(project.teamId || "");
    setStatus(project.status);
    setMonthlyBudget(project.monthlyBudget?.toString() || "");
    setTags(project.tags || []);
    setApiKeyPatterns(project.apiKeyPatterns || []);
    setShowDeleteConfirm(false);
  }, [project]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddPattern = () => {
    if (newPattern.trim() && !apiKeyPatterns.includes(newPattern.trim())) {
      setApiKeyPatterns([...apiKeyPatterns, newPattern.trim()]);
      setNewPattern("");
    }
  };

  const handleRemovePattern = (patternToRemove: string) => {
    setApiKeyPatterns(apiKeyPatterns.filter((p) => p !== patternToRemove));
  };

  const handleSave = async () => {
    try {
      await updateProjectMutation.mutateAsync({
        projectId: project.id,
        data: {
          name,
          description: description || undefined,
          ownerTeamId: teamId || undefined,
          status: status as "active" | "archived",
          tags,
        },
      });

      onSave?.(project.id, { name, description, teamId, status, tags, apiKeyPatterns });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      onDelete?.(project.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const isFormValid = () => {
    return name.trim().length > 0;
  };

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <ProjectIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                Edit Project
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-tertiary">{project.name}</span>
              {teamName && (
                <>
                  <span className="text-sm text-quaternary">•</span>
                  <span className="text-sm text-tertiary">{teamName}</span>
                </>
              )}
            </div>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Project Details</h3>

              <Input
                label="Project Name"
                type="text"
                value={name}
                onChange={(val) => setName(val)}
                placeholder="e.g., Customer Chatbot"
                isRequired
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-secondary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the project..."
                  rows={3}
                  className="flex w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary transition-colors placeholder:text-quaternary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
              </div>

              <Select
                label="Team"
                selectedKey={teamId || null}
                onSelectionChange={(key) => setTeamId(key as string)}
                placeholder="No team assigned"
              >
                {availableTeams.map((team) => (
                  <Select.Item key={team.id} id={team.id} label={team.name} />
                ))}
              </Select>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary">Status</label>
                <div className="flex gap-3">
                  <label
                    className={cx(
                      "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
                      status === "active"
                        ? "border-success-primary bg-success-secondary"
                        : "border-secondary hover:bg-secondary_subtle"
                    )}
                    onClick={() => setStatus("active")}
                  >
                    <div
                      className={cx(
                        "flex size-4 items-center justify-center rounded-full border-2",
                        status === "active"
                          ? "border-success-solid bg-success-solid"
                          : "border-tertiary"
                      )}
                    >
                      {status === "active" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={cx(
                      "text-sm font-medium",
                      status === "active" ? "text-success-primary" : "text-secondary"
                    )}>
                      Active
                    </span>
                  </label>
                  <label
                    className={cx(
                      "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors",
                      status === "archived"
                        ? "border-tertiary bg-secondary"
                        : "border-secondary hover:bg-secondary_subtle"
                    )}
                    onClick={() => setStatus("archived")}
                  >
                    <div
                      className={cx(
                        "flex size-4 items-center justify-center rounded-full border-2",
                        status === "archived"
                          ? "border-quaternary bg-quaternary"
                          : "border-tertiary"
                      )}
                    >
                      {status === "archived" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={cx(
                      "text-sm font-medium",
                      status === "archived" ? "text-secondary" : "text-tertiary"
                    )}>
                      Archived
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Budget Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Budget Settings</h3>

              <Input
                label="Monthly Budget"
                type="number"
                value={monthlyBudget}
                onChange={(val) => setMonthlyBudget(val)}
                placeholder="e.g., 2000"
                hint="Leave empty for no budget limit"
              />
            </div>

            {/* Assigned Teams */}
            <ProjectTeamsManager projectId={project.id} projectName={project.name} />

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-secondary">Tags</h3>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    size="md"
                    color="brand"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:opacity-70"
                    >
                      <CloseCircle size={14} color="currentColor" variant="Bold" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(val) => setNewTag(val)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  size="md"
                  color="secondary"
                  onClick={handleAddTag}
                  isDisabled={!newTag.trim()}
                >
                  <Add size={16} color="currentColor" />
                </Button>
              </div>
            </div>

            {/* API Key Patterns */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-secondary">API Key Patterns</h3>
              <p className="text-xs text-tertiary">
                Define patterns to automatically associate API keys with this project.
              </p>

              <div className="space-y-2">
                {apiKeyPatterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-secondary bg-secondary px-3 py-2"
                  >
                    <code className="text-sm font-mono text-primary">{pattern}</code>
                    <button
                      onClick={() => handleRemovePattern(pattern)}
                      className="text-tertiary hover:text-error-primary"
                    >
                      <CloseCircle size={16} color="currentColor" variant="Outline" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newPattern}
                  onChange={(val) => setNewPattern(val)}
                  placeholder="e.g., sk-prod-*"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPattern();
                    }
                  }}
                />
                <Button
                  size="md"
                  color="secondary"
                  onClick={handleAddPattern}
                  isDisabled={!newPattern.trim()}
                >
                  <Add size={16} color="currentColor" />
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-3 border-t border-secondary pt-6">
              <h3 className="text-sm font-medium text-error-primary">Danger Zone</h3>
              {!showDeleteConfirm ? (
                <Button
                  size="sm"
                  color="secondary"
                  iconLeading={TrashIcon}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-error-primary hover:bg-error-secondary"
                >
                  Delete Project
                </Button>
              ) : (
                <div className="rounded-xl border border-error-primary bg-error-secondary p-4">
                  <p className="text-sm font-medium text-error-primary">
                    Are you sure you want to delete this project?
                  </p>
                  <p className="mt-1 text-sm text-error-tertiary">
                    This action cannot be undone. All project data and cost allocations will be removed.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      color="primary-destructive"
                      onClick={handleDelete}
                    >
                      Yes, Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SlideoutMenu.Content>

        <SlideoutMenu.Footer className="flex w-full justify-between gap-3">
          <Button size="md" color="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleSave}
            isLoading={updateProjectMutation.isPending}
            isDisabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
