"use client";

import type { FC } from "react";

export interface SearchCommandProps {
  className?: string;
  placeholder?: string;
}

export const SearchCommand: FC<SearchCommandProps> = ({
  className,
  placeholder = "Search...",
}) => {
  return (
    <div className={className}>
      {/* Command palette / search implementation */}
    </div>
  );
};
