"use client";

import type { FC } from "react";

export interface UserMenuProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  className?: string;
}

export const UserMenu: FC<UserMenuProps> = ({ user, className }) => {
  return (
    <div className={className}>
      {/* User menu dropdown implementation */}
    </div>
  );
};
