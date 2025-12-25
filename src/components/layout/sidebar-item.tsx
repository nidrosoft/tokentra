"use client";

import type { FC, ReactNode } from "react";
import Link from "next/link";

export interface SidebarItemProps {
  href: string;
  icon?: ReactNode;
  label: string;
  isActive?: boolean;
  className?: string;
}

export const SidebarItem: FC<SidebarItemProps> = ({
  href,
  icon,
  label,
  isActive,
  className,
}) => {
  return (
    <Link href={href} className={className} data-active={isActive}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};
