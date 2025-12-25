"use client";

import type { FC, HTMLAttributes } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import * as Iconsax from "iconsax-react";
import { AnimatePresence, motion } from "motion/react";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { NavItemButton } from "@/components/application/app-navigation/base-components/nav-item-button";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ProgressBarCircle } from "@/components/base/progress-indicators/progress-circles";
import { cx } from "@/utils/cx";

// Create icon components that work with NavItemBase (which expects className prop)
const createIcon = (IconComponent: typeof Iconsax.Activity): FC<HTMLAttributes<HTMLOrSVGElement>> => {
  const WrappedIcon: FC<HTMLAttributes<HTMLOrSVGElement>> = (props) => (
    <IconComponent size={20} color="currentColor" variant="Outline" {...props} />
  );
  return WrappedIcon;
};

// Nav icons
const ChartIcon = createIcon(Iconsax.Chart);
const DollarCircleIcon = createIcon(Iconsax.DollarCircle);
const ActivityIcon = createIcon(Iconsax.Activity);
const CloudIcon = createIcon(Iconsax.Cloud);
const FlashIcon = createIcon(Iconsax.Flash);
const WalletIcon = createIcon(Iconsax.Wallet);
const NotificationIcon = createIcon(Iconsax.Notification);
const DocumentTextIcon = createIcon(Iconsax.DocumentText);
const PeopleIcon = createIcon(Iconsax.People);
const Folder2Icon = createIcon(Iconsax.Folder2);
const KeyIcon = createIcon(Iconsax.Key);
const Setting2Icon = createIcon(Iconsax.Setting2);
const MessageQuestionIcon = createIcon(Iconsax.MessageQuestion);

// Navigation item with optional sub-items for dropdowns
interface NavItemWithSubs extends NavItemType {
  icon: FC<{ className?: string }>;
  subItems?: { label: string; href: string }[];
}

// Icon for Cost Centers
const BuildingIcon = createIcon(Iconsax.Building);

// Grouped navigation sections - simplified without sub-items (sub-pages are tabs inside pages)
const navSections: Array<{ label: string; items: NavItemWithSubs[] }> = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: ChartIcon,
      },
      {
        label: "Cost Analytics",
        href: "/dashboard/costs",
        icon: DollarCircleIcon,
      },
      {
        label: "Usage",
        href: "/dashboard/usage",
        icon: ActivityIcon,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Providers",
        href: "/dashboard/providers",
        icon: CloudIcon,
      },
      {
        label: "Optimization",
        href: "/dashboard/optimization",
        icon: FlashIcon,
        badge: (
          <Badge size="sm" type="pill-color" color="success">
            3
          </Badge>
        ),
      },
      {
        label: "Budgets",
        href: "/dashboard/budgets",
        icon: WalletIcon,
      },
      {
        label: "Alerts",
        href: "/dashboard/alerts",
        icon: NotificationIcon,
      },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: DocumentTextIcon,
      },
      {
        label: "Teams",
        href: "/dashboard/teams",
        icon: PeopleIcon,
      },
      {
        label: "Projects",
        href: "/dashboard/projects",
        icon: Folder2Icon,
      },
      {
        label: "Cost Centers",
        href: "/dashboard/cost-centers",
        icon: BuildingIcon,
      },
    ],
  },
];

// Upgrade Card Component
const UpgradeCard: FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  if (!isExpanded) {
    return (
      <a
        href="/dashboard/settings?tab=billing"
        className="flex size-10 items-center justify-center rounded-lg bg-brand-solid text-white transition-colors hover:bg-brand-solid_hover"
        title="Upgrade to Pro"
      >
        <Iconsax.Crown1 size={20} variant="Bold" />
      </a>
    );
  }

  return (
    <div className="relative flex flex-col rounded-xl bg-secondary p-4">
      <div className="w-16">
        <ProgressBarCircle value={75} size="xxs" />
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md text-fg-quaternary transition-colors hover:bg-tertiary hover:text-fg-secondary"
      >
        <Iconsax.CloseCircle size={16} variant="Outline" />
      </button>

      <div className="mt-3">
        <p className="text-sm font-semibold text-primary">Upgrade to Pro</p>
        <p className="mt-1 text-sm text-tertiary">
          Get advanced analytics, unlimited alerts, and priority support.
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <Button onClick={() => setIsDismissed(true)} color="link-gray" size="sm">
          Dismiss
        </Button>
        <Button href="/dashboard/settings?tab=billing" color="link-color" size="sm">
          Upgrade
        </Button>
      </div>
    </div>
  );
};

// Expandable Nav Item Component
const ExpandableNavItem: FC<{
  item: NavItemWithSubs;
  pathname: string;
  isExpanded: boolean;
  onMobileClose?: () => void;
}> = ({ item, pathname, isExpanded, onMobileClose }) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = pathname === item.href || item.subItems?.some(sub => pathname === sub.href);
  const [isOpen, setIsOpen] = useState(isActive);

  if (!hasSubItems) {
    return (
      <NavItemBase
        current={pathname === item.href}
        href={item.href}
        icon={item.icon}
        badge={item.badge}
        type="link"
        onClick={onMobileClose}
      >
        {item.label}
      </NavItemBase>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cx(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-active text-fg-primary"
            : "text-fg-secondary hover:bg-secondary hover:text-fg-primary"
        )}
      >
        <item.icon className="size-5 shrink-0" />
        {isExpanded && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <Iconsax.ArrowDown2
              size={16}
              variant="Outline"
              className={cx("transition-transform", isOpen && "rotate-180")}
            />
          </>
        )}
      </button>
      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-8 mt-1 flex flex-col gap-0.5 overflow-hidden border-l border-secondary pl-3"
          >
            {item.subItems?.map((subItem) => (
              <li key={subItem.href}>
                <a
                  href={subItem.href}
                  onClick={onMobileClose}
                  className={cx(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    pathname === subItem.href
                      ? "font-medium text-brand-primary"
                      : "text-fg-tertiary hover:text-fg-primary"
                  )}
                >
                  {subItem.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SLIM_WIDTH = 68;
  const EXPANDED_WIDTH = 280;

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  // Flatten all nav items for slim view
  const allNavItems = navSections.flatMap((section) => section.items);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 flex size-10 items-center justify-center rounded-lg bg-primary shadow-md ring-1 ring-secondary lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <Iconsax.CloseCircle size={20} variant="Outline" /> : <Iconsax.HambergerMenu size={20} variant="Outline" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobile}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -EXPANDED_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: -EXPANDED_WIDTH }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-primary shadow-xl lg:hidden"
          >
            <div className="flex h-full flex-col overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center gap-3 px-5 pt-6 pb-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-solid">
                  <Iconsax.Layer size={24} color="#ffffff" variant="Bold" />
                </div>
                <span className="text-lg font-semibold text-primary">TokenTRA</span>
              </div>

              {/* Nav Sections */}
              <nav className="flex-1 overflow-y-auto">
                {navSections.map((section) => (
                  <div key={section.label} className="px-3 py-2">
                    <p className="mb-2 px-3 text-xs font-semibold uppercase text-quaternary">
                      {section.label}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {section.items.map((item) => (
                        <li key={item.label}>
                          <ExpandableNavItem
                            item={item}
                            pathname={pathname}
                            isExpanded={true}
                            onMobileClose={() => setIsMobileOpen(false)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              {/* Upgrade Card */}
              <div className="border-t border-secondary px-3 py-4">
                <UpgradeCard isExpanded={true} />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? EXPANDED_WIDTH : SLIM_WIDTH }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="relative hidden h-screen flex-col border-r border-secondary bg-primary lg:flex"
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div className={cx(
            "flex h-16 items-center border-b border-secondary px-3",
            isExpanded ? "gap-3" : "justify-center"
          )}>
            <div className={cx(
              "flex items-center justify-center rounded-lg bg-brand-solid",
              isExpanded ? "size-9" : "size-10"
            )}>
              <Iconsax.Layer size={isExpanded ? 20 : 24} color="#ffffff" variant="Bold" />
            </div>
            {isExpanded && (
              <span className="text-md font-semibold text-primary">TokenTRA</span>
            )}
          </div>

          {/* Nav Sections */}
          <nav className="flex-1 overflow-y-auto py-2">
            {isExpanded ? (
              // Expanded view with sections and dropdowns
              navSections.map((section) => (
                <div key={section.label} className="px-3 py-2">
                  <p className="mb-2 px-3 text-xs font-semibold uppercase text-quaternary">
                    {section.label}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <ExpandableNavItem
                          item={item}
                          pathname={pathname}
                          isExpanded={isExpanded}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              // Slim view - icons only
              <ul className="flex flex-col gap-1 px-3">
                {allNavItems.map((item) => (
                  <li key={item.label}>
                    <NavItemButton
                      size="md"
                      current={pathname === item.href || item.subItems?.some(sub => pathname === sub.href)}
                      href={item.href}
                      label={item.label || ""}
                      icon={item.icon}
                    />
                  </li>
                ))}
              </ul>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-secondary px-3 py-4">
            {/* Upgrade Card */}
            <UpgradeCard isExpanded={isExpanded} />

            {/* Collapse Button */}
            <div className={cx(
              "mt-4 flex items-center rounded-lg",
              isExpanded ? "justify-end" : "justify-center"
            )}>
              <button
                onClick={toggleSidebar}
                className="flex size-8 items-center justify-center rounded-md text-fg-quaternary transition-colors hover:bg-secondary hover:text-fg-secondary"
                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isExpanded ? (
                  <Iconsax.SidebarLeft size={20} variant="Outline" />
                ) : (
                  <Iconsax.SidebarRight size={20} variant="Outline" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
