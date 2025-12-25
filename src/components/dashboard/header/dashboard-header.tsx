"use client";

import type { FC } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
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

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    title: "Budget Alert: GPT-4 Usage",
    description: "GPT-4 spending has reached 85% of monthly budget ($8,500 of $10,000).",
    time: "5 minutes ago",
    read: false,
    type: "warning" as const,
  },
  {
    id: "2",
    title: "New Team Member Added",
    description: "Sarah Chen was added to the Engineering team by Admin.",
    time: "1 hour ago",
    read: false,
    type: "info" as const,
  },
  {
    id: "3",
    title: "Cost Optimization Available",
    description: "Switch to Claude 3 Haiku for 40% cost savings on classification tasks.",
    time: "3 hours ago",
    read: true,
    type: "success" as const,
  },
  {
    id: "4",
    title: "API Key Expiring Soon",
    description: "Your OpenAI API key will expire in 7 days. Please rotate it.",
    time: "1 day ago",
    read: true,
    type: "warning" as const,
  },
];

export const DashboardHeader: FC = () => {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Mock notification count - in real app this would come from state/API
  const notificationCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-secondary bg-primary px-6">
        {/* Left: Page Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-primary">{pageTitle}</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search / Command */}
          <button
            className="flex h-9 items-center gap-2 rounded-lg border border-secondary bg-secondary_subtle px-3 text-sm text-tertiary transition-colors hover:border-tertiary hover:text-secondary"
            onClick={() => {
              // TODO: Implement command palette
            }}
          >
            <Iconsax.SearchNormal1 size={16} variant="Outline" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden rounded bg-tertiary px-1.5 py-0.5 text-xs font-medium text-primary sm:inline">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative flex size-9 items-center justify-center rounded-lg border border-secondary bg-secondary_subtle transition-colors hover:border-tertiary hover:bg-secondary"
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
              {mockNotifications.map((notification) => (
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
                        <span className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-brand-solid" />
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
