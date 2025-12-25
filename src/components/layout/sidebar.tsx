"use client";

import type { FC, ReactNode } from "react";

export interface SidebarProps {
  children?: ReactNode;
  className?: string;
}

export const Sidebar: FC<SidebarProps> = ({ children, className }) => {
  return (
    <aside className={className}>
      {children}
    </aside>
  );
};
