"use client";

import type { FC } from "react";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { Toggle } from "@/components/base/toggle/toggle";
import { cx } from "@/utils/cx";

export interface ProjectFormData {
  name: string;
  description: string;
  teamId?: string;
  tags: string[];
  monthlyBudget: number;
  apiKeyPatterns: string[];
  status: "active" | "archived";
}

export interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  teams?: { id: string; name: string }[];
  onSubmit?: (data: ProjectFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const defaultTeams: SelectItemType[] = [
  { id: "", label: "No team (Organization-level)" },
  { id: "team_1", label: "Engineering" },
  { id: "team_2", label: "Data Science" },
  { id: "team_3", label: "Product" },
  { id: "team_4", label: "Customer Success" },
  { id: "team_5", label: "Research" },
];

export const ProjectForm: FC<ProjectFormProps> = ({
  initialData,
  teams,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    teamId: initialData?.teamId || "",
    tags: initialData?.tags || [],
    monthlyBudget: initialData?.monthlyBudget || 1000,
    apiKeyPatterns: initialData?.apiKeyPatterns || [],
    status: initialData?.status || "active",
  });

  const [tagInput, setTagInput] = useState("");
  const [apiKeyPattern, setApiKeyPattern] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const teamItems: SelectItemType[] = teams
    ? [{ id: "", label: "No team (Organization-level)" }, ...teams.map((t) => ({ id: t.id, label: t.name }))]
    : defaultTeams;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (formData.monthlyBudget < 0) newErrors.monthlyBudget = "Budget cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const addApiKeyPattern = () => {
    if (apiKeyPattern.trim() && !formData.apiKeyPatterns.includes(apiKeyPattern.trim())) {
      setFormData((prev) => ({ ...prev, apiKeyPatterns: [...prev.apiKeyPatterns, apiKeyPattern.trim()] }));
      setApiKeyPattern("");
    }
  };

  const removeApiKeyPattern = (pattern: string) => {
    setFormData((prev) => ({ ...prev, apiKeyPatterns: prev.apiKeyPatterns.filter((p) => p !== pattern) }));
  };

  return (
    <form onSubmit={handleSubmit} className={cx("space-y-5", className)}>
      {/* Project Name */}
      <Input
        label="Project Name"
        placeholder="e.g., Customer Chatbot"
        value={formData.name}
        onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
        isInvalid={!!errors.name}
        hint={errors.name}
        isRequired
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="Brief description of the project"
        value={formData.description}
        onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
      />

      {/* Team Selection */}
      <Select
        label="Team"
        placeholder="Select a team"
        selectedKey={formData.teamId || null}
        onSelectionChange={(key) => setFormData((prev) => ({ ...prev, teamId: key as string }))}
        items={teamItems}
      >
        {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
      </Select>

      {/* Tags */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-secondary">Tags</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., production, ml"
            value={tagInput}
            onChange={(value) => setTagInput(value)}
            className="flex-1"
          />
          <Button type="button" size="md" color="secondary" onClick={addTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-brand-secondary px-2 py-1 text-xs font-medium text-brand-primary"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-brand-tertiary">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Budget */}
      <Input
        label="Monthly Budget (USD)"
        type="number"
        value={formData.monthlyBudget.toString()}
        onChange={(value) => setFormData((prev) => ({ ...prev, monthlyBudget: Number(value) }))}
        isInvalid={!!errors.monthlyBudget}
        hint={errors.monthlyBudget}
      />

      {/* API Key Patterns */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-secondary">API Key Patterns</p>
        <p className="mb-2 text-xs text-tertiary">Patterns to auto-attribute costs (e.g., chatbot-*, proj-*)</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., project-*"
            value={apiKeyPattern}
            onChange={(value) => setApiKeyPattern(value)}
            className="flex-1"
          />
          <Button type="button" size="md" color="secondary" onClick={addApiKeyPattern}>
            Add
          </Button>
        </div>
        {formData.apiKeyPatterns.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.apiKeyPatterns.map((pattern) => (
              <span
                key={pattern}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary"
              >
                {pattern}
                <button type="button" onClick={() => removeApiKeyPattern(pattern)} className="ml-1 text-tertiary hover:text-primary">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/50 p-4">
        <div>
          <p className="text-sm font-medium text-primary">Active Project</p>
          <p className="text-xs text-tertiary">Archived projects are hidden from main views</p>
        </div>
        <Toggle
          isSelected={formData.status === "active"}
          onChange={(isSelected) => setFormData((prev) => ({ ...prev, status: isSelected ? "active" : "archived" }))}
          size="sm"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary pt-4">
        {onCancel && (
          <Button type="button" size="md" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="md" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
};
