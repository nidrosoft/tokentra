"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  People,
  Trash,
  Add,
  CloseCircle,
} from "iconsax-react";
import type { Team } from "@/types";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useUpdateTeam, useDeleteTeam } from "@/hooks/use-teams";
import { TeamMembersManager } from "./team-members-manager";

interface TeamEditSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
  onSave?: (teamId: string, updates: Partial<Team>) => void;
  onDelete?: (teamId: string) => void;
}

const TeamIcon = ({ className }: { className?: string }) => (
  <People size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const TrashIcon = ({ className }: { className?: string }) => (
  <Trash size={16} color="currentColor" className={className} variant="Outline" />
);

export const TeamEditSlideout: FC<TeamEditSlideoutProps> = ({
  isOpen,
  onOpenChange,
  team,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [monthlyBudget, setMonthlyBudget] = useState(team.monthlyBudget?.toString() || "");
  const [apiKeyPatterns, setApiKeyPatterns] = useState<string[]>(team.apiKeyPatterns || []);
  const [newPattern, setNewPattern] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  // Reset form when team changes
  useEffect(() => {
    setName(team.name);
    setDescription(team.description || "");
    setMonthlyBudget(team.monthlyBudget?.toString() || "");
    setApiKeyPatterns(team.apiKeyPatterns || []);
    setShowDeleteConfirm(false);
  }, [team]);

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
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: {
          name,
          description: description || undefined,
          metadata: {
            apiKeyPatterns,
            monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
          },
        },
      });

      onSave?.(team.id, { name, description, monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined, apiKeyPatterns });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update team:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTeamMutation.mutateAsync(team.id);
      onDelete?.(team.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  const isFormValid = () => {
    return name.trim().length > 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <TeamIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                Edit Team
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-tertiary">{team.name}</span>
              <span className="text-sm text-quaternary">•</span>
              <span className="text-sm text-tertiary">{team.memberCount} members</span>
            </div>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Team Details</h3>

              <Input
                label="Team Name"
                type="text"
                value={name}
                onChange={(val) => setName(val)}
                placeholder="e.g., Engineering Team"
                isRequired
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-secondary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the team..."
                  rows={3}
                  className="flex w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary transition-colors placeholder:text-quaternary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
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
                placeholder="e.g., 5000"
                hint={team.monthlyBudget ? `Current spend: ${formatCurrency(team.currentMonthSpend)}` : "Leave empty for no budget limit"}
              />
            </div>

            {/* Team Members */}
            <TeamMembersManager teamId={team.id} teamName={team.name} />

            {/* API Key Patterns */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-secondary">API Key Patterns</h3>
              <p className="text-xs text-tertiary">
                Define patterns to automatically associate API keys with this team.
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
                  placeholder="e.g., sk-team-eng-*"
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
                  Delete Team
                </Button>
              ) : (
                <div className="rounded-xl border border-error-primary bg-error-secondary p-4">
                  <p className="text-sm font-medium text-error-primary">
                    Are you sure you want to delete this team?
                  </p>
                  <p className="mt-1 text-sm text-error-tertiary">
                    This action cannot be undone. All team members will be removed from this team.
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
            isLoading={updateTeamMutation.isPending}
            isDisabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
