"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import * as Iconsax from "iconsax-react";
import {
  Button as AriaButton,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { NavAccountMenu } from "@/components/application/app-navigation/base-components/nav-account-card";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

// Map routes to page titles
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/costs": "Cost Analytics",
  "/dashboard/usage": "Usage",
  "/dashboard/providers": "Providers",
  "/dashboard/optimization": "Optimization",
  "/dashboard/budgets": "Budgets",
  "/dashboard/alerts": "Alerts",
  "/dashboard/reports": "Reports",
  "/dashboard/teams": "Teams",
  "/dashboard/projects": "Projects",
  "/dashboard/cost-centers": "Cost Centers",
  "/dashboard/settings": "Settings",
  "/dashboard/support": "Support",
};

// Map notification categories/priorities to UI types
const getNotificationType = (category: string, priority: string): "warning" | "info" | "success" => {
  if (priority === "urgent" || priority === "high") return "warning";
  if (category === "optimization" || category === "report") return "success";
  return "info";
};

export const DashboardHeader: FC = () => {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Use real notifications from API
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const notificationCount = unreadCount.total;

  // Transform notifications for display
  const displayNotifications = useMemo(() => {
    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.body,
      time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
      read: !!n.readAt,
      type: getNotificationType(n.category, n.priority),
      actionUrl: n.primaryActionUrl,
    }));
  }, [notifications]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-secondary bg-primary px-6">
        {/* Left: Search */}
        <div className="flex items-center gap-3">
          <button
            className="flex h-9 w-64 items-center gap-2 rounded-lg border border-secondary bg-secondary_subtle px-3 text-sm text-tertiary transition-colors hover:border-tertiary hover:text-secondary"
            onClick={() => {
              // TODO: Implement command palette
            }}
          >
            <Iconsax.SearchNormal1 size={16} variant="Outline" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="rounded bg-tertiary px-1.5 py-0.5 text-xs font-medium text-primary">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative flex size-9 items-center justify-center rounded-full border border-secondary bg-secondary_subtle transition-colors hover:border-tertiary hover:bg-secondary"
          >
            <Iconsax.Notification size={20} variant="Outline" color="currentColor" className="text-fg-secondary" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-error-solid text-[10px] font-medium text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-secondary" />

        {/* User Account */}
        <AriaDialogTrigger>
          <AriaButton
            className={({ isPressed, isFocused }) =>
              cx(
                "group relative inline-flex items-center gap-2 rounded-full",
                (isPressed || isFocused) && "outline-2 outline-offset-2 outline-focus-ring"
              )
            }
          >
            <Avatar
              status="online"
              src="https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"
              size="sm"
              alt="User"
            />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-primary">Olivia Rhye</p>
            </div>
            <Iconsax.ArrowDown2
              size={16}
              variant="Outline"
              className="hidden text-fg-quaternary sm:block"
            />
          </AriaButton>
          <AriaPopover
            placement="bottom end"
            offset={8}
            className={({ isEntering, isExiting }) =>
              cx(
                "will-change-transform",
                isEntering &&
                  "duration-300 ease-out animate-in fade-in slide-in-from-top-2",
                isExiting &&
                  "duration-150 ease-in animate-out fade-out slide-out-to-top-2"
              )
            }
          >
            <NavAccountMenu />
          </AriaPopover>
        </AriaDialogTrigger>
        </div>
      </header>

      {/* Notification Slideout Menu */}
      <SlideoutMenu.Trigger isOpen={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
        <SlideoutMenu isDismissable>
          <SlideoutMenu.Header onClose={() => setIsNotificationOpen(false)}>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold text-primary">Notifications</h1>
              <p className="text-sm text-tertiary">
                You have {notificationCount} unread notification{notificationCount !== 1 ? "s" : ""}.
              </p>
            </div>
          </SlideoutMenu.Header>
          <SlideoutMenu.Content>
            <div className="flex flex-col gap-1">
              {displayNotifications.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Iconsax.Notification size={48} variant="Outline" className="text-fg-quaternary mb-3" />
                  <p className="text-sm text-tertiary">No notifications yet</p>
                  <p className="text-xs text-quaternary mt-1">We&apos;ll notify you when something important happens</p>
                </div>
              )}
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cx(
                    "flex gap-3 rounded-lg p-3 transition-colors hover:bg-secondary",
                    !notification.read && "bg-secondary_subtle"
                  )}
                >
                  <div className="flex-shrink-0 pt-0.5">
                    {notification.type === "warning" && (
                      <div className="flex size-8 items-center justify-center rounded-full bg-warning-secondary">
                        <Iconsax.Warning2 size={16} color="#DC6803" variant="Bold" />
                      </div>
                    )}
                    {notification.type === "info" && (
                      <div className="flex size-8 items-center justify-center rounded-full bg-brand-secondary">
                        <Iconsax.InfoCircle size={16} color="#7F56D9" variant="Bold" />
                      </div>
                    )}
                    {notification.type === "success" && (
                      <div className="flex size-8 items-center justify-center rounded-full bg-success-secondary">
                        <Iconsax.TickCircle size={16} color="#079455" variant="Bold" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cx(
                        "text-sm text-primary",
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([notification.id]);
                          }}
                          className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-brand-solid hover:bg-brand-solid_hover transition-colors"
                          title="Mark as read"
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-tertiary line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-xs text-quaternary">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </SlideoutMenu.Content>
          <SlideoutMenu.Footer className="flex w-full items-center justify-between gap-3">
            {notificationCount > 0 && (
              <Button size="md" color="link-gray" onClick={() => markAllAsRead()}>
                Mark all as read
              </Button>
            )}
            <Button size="md" color="link-gray" href="/dashboard/alerts">
              View all alerts
            </Button>
            <Button size="md" color="secondary" onClick={() => setIsNotificationOpen(false)}>
              Close
            </Button>
          </SlideoutMenu.Footer>
        </SlideoutMenu>
      </SlideoutMenu.Trigger>
    </>
  );
};
