"use client";

import type { FC } from "react";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

export interface TeamFormData {
  name: string;
  description: string;
  monthlyBudget: number;
  apiKeyPatterns: string[];
}

export interface TeamFormProps {
  initialData?: Partial<TeamFormData>;
  onSubmit?: (data: TeamFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const TeamForm: FC<TeamFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = useState<TeamFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    monthlyBudget: initialData?.monthlyBudget || 5000,
    apiKeyPatterns: initialData?.apiKeyPatterns || [],
  });

  const [apiKeyPattern, setApiKeyPattern] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Team name is required";
    if (formData.monthlyBudget <= 0) newErrors.monthlyBudget = "Budget must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  const addApiKeyPattern = () => {
    if (apiKeyPattern.trim() && !formData.apiKeyPatterns.includes(apiKeyPattern.trim())) {
      setFormData((prev) => ({
        ...prev,
        apiKeyPatterns: [...prev.apiKeyPatterns, apiKeyPattern.trim()],
      }));
      setApiKeyPattern("");
    }
  };

  const removeApiKeyPattern = (pattern: string) => {
    setFormData((prev) => ({
      ...prev,
      apiKeyPatterns: prev.apiKeyPatterns.filter((p) => p !== pattern),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={cx("space-y-5", className)}>
      {/* Team Name */}
      <Input
        label="Team Name"
        placeholder="e.g., Engineering"
        value={formData.name}
        onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
        isInvalid={!!errors.name}
        hint={errors.name}
        isRequired
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="Brief description of the team"
        value={formData.description}
        onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
      />

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
        <p className="mb-2 text-xs text-tertiary">Patterns to auto-attribute costs to this team (e.g., eng-*, dev-*)</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., team-*"
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
                <button
                  type="button"
                  onClick={() => removeApiKeyPattern(pattern)}
                  className="ml-1 text-tertiary hover:text-primary"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary pt-4">
        {onCancel && (
          <Button type="button" size="md" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="md" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Team"}
        </Button>
      </div>
    </form>
  );
};
