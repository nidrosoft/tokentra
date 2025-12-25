"use client";

import type { FC } from "react";

export interface HeaderProps {
  className?: string;
}

export const Header: FC<HeaderProps> = ({ className }) => {
  return (
    <header className={className}>
      {/* Header implementation */}
    </header>
  );
};
