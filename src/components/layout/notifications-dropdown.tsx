"use client";

import type { FC } from "react";

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: Date;
}

export interface NotificationsDropdownProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

export const NotificationsDropdown: FC<NotificationsDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}) => {
  return (
    <div className={className}>
      {/* Notifications dropdown implementation */}
    </div>
  );
};
