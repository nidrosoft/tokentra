"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Trash, User, Profile2User } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import {
  useTeamMembers,
  useAddTeamMember,
  useRemoveTeamMember,
} from "@/hooks/use-teams";
import type { TeamRole } from "@/lib/organization/types";

interface TeamMembersManagerProps {
  teamId: string;
  teamName: string;
}

const roleColors: Record<TeamRole, "brand" | "success" | "gray"> = {
  owner: "brand",
  admin: "success",
  member: "gray",
  viewer: "gray",
};

const roleLabels: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const TeamMembersManager: FC<TeamMembersManagerProps> = ({
  teamId,
  teamName,
}) => {
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<TeamRole>("member");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: members, isLoading } = useTeamMembers(teamId);
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const handleAddMember = async () => {
    if (!newUserId.trim()) return;

    try {
      await addMemberMutation.mutateAsync({
        teamId,
        data: { user_id: newUserId.trim(), role: newRole },
      });
      setNewUserId("");
      setNewRole("member");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ teamId, userId });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-secondary">Team Members</h3>
        <div className="flex items-center justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-secondary">Team Members</h3>
        <span className="text-xs text-tertiary">
          {members?.length || 0} member{members?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Members List */}
      {members && members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-secondary bg-secondary px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-tertiary">
                  <User size={16} color="currentColor" variant="Bold" className="text-quaternary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-primary">
                    {member.user?.name || member.user?.email || "Unknown User"}
                  </span>
                  {member.user?.email && member.user?.name && (
                    <span className="text-xs text-tertiary">{member.user.email}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge size="sm" color={roleColors[member.role]}>
                  {roleLabels[member.role]}
                </Badge>
                {member.role !== "owner" && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={removeMemberMutation.isPending}
                    className="rounded p-1 text-tertiary transition-colors hover:bg-error-secondary hover:text-error-primary disabled:opacity-50"
                  >
                    <Trash size={14} color="currentColor" variant="Outline" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-secondary bg-secondary_subtle py-6">
          <Profile2User size={24} color="#98A2B3" variant="Bulk" />
          <p className="mt-2 text-sm text-tertiary">No members yet</p>
          <p className="text-xs text-quaternary">Add members to this team</p>
        </div>
      )}

      {/* Add Member Form */}
      {showAddForm ? (
        <div className="space-y-3 rounded-lg border border-secondary bg-secondary_subtle p-3">
          <Input
            label="User ID"
            type="text"
            value={newUserId}
            onChange={(val) => setNewUserId(val)}
            placeholder="Enter user ID (UUID)"
            hint="The unique identifier of the user to add"
          />
          <Select
            label="Role"
            selectedKey={newRole}
            onSelectionChange={(key) => setNewRole(key as TeamRole)}
          >
            <Select.Item key="member" id="member" label="Member" />
            <Select.Item key="admin" id="admin" label="Admin" />
          </Select>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                setShowAddForm(false);
                setNewUserId("");
                setNewRole("member");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddMember}
              isLoading={addMemberMutation.isPending}
              isDisabled={!newUserId.trim()}
            >
              Add Member
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          color="secondary"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Add size={16} color="currentColor" />
          <span className="ml-1">Add Member</span>
        </Button>
      )}
    </div>
  );
};
