"use client";

import type { FC, ReactNode } from "react";

export interface SidebarNavProps {
  children?: ReactNode;
  className?: string;
}

export const SidebarNav: FC<SidebarNavProps> = ({ children, className }) => {
  return (
    <nav className={className}>
      {children}
    </nav>
  );
};
