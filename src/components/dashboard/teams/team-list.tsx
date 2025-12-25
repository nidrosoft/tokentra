"use client";

import type { FC } from "react";
import { useState } from "react";
import { SearchNormal1 } from "iconsax-react";
import type { Team } from "@/types";
import { Input } from "@/components/base/input/input";
import { TeamCard } from "./team-card";
import { cx } from "@/utils/cx";

export interface TeamListProps {
  teams: Team[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

const SearchIcon = ({ className }: { className?: string }) => (
  <SearchNormal1 size={20} color="currentColor" className={className} variant="Outline" />
);

export const TeamList: FC<TeamListProps> = ({
  teams,
  onView,
  onEdit,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cx("space-y-4", className)}>
      {/* Search */}
      <Input
        placeholder="Search teams..."
        value={searchQuery}
        onChange={(value) => setSearchQuery(value)}
        icon={SearchIcon}
      />

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onView={onView}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <p className="text-lg font-medium text-secondary">No teams found</p>
          <p className="mt-1 text-sm text-tertiary">
            {searchQuery ? "Try a different search term" : "Create your first team to get started"}
          </p>
        </div>
      )}
    </div>
  );
};
