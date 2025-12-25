"use client";

import type { FC } from "react";

export interface TeamMembersProps {
  members?: Array<{ id: string; name: string; email: string; role: string }>;
  onAddMember?: () => void;
  onRemoveMember?: (id: string) => void;
  className?: string;
}

export const TeamMembers: FC<TeamMembersProps> = ({ className }) => {
  return <div className={className}>{/* Team members implementation */}</div>;
};
