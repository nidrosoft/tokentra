"use client";

import type { FC } from "react";
import { People, TrendUp, TrendDown, ExportSquare } from "iconsax-react";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { cx } from "@/utils/cx";

interface Consumer {
  id: string;
  name: string;
  type: "Team" | "Project" | "User";
  spend: number;
  tokens: string;
  trend: string;
  avatar: string;
  requests?: number;
  avgCostPerRequest?: string;
}

interface TopConsumersSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  consumers: Consumer[];
}

const PeopleIcon = (props: { className?: string }) => (
  <People size={20} color="currentColor" className={props.className} variant="Bulk" />
);

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

export const TopConsumersSlideout: FC<TopConsumersSlideoutProps> = ({
  isOpen,
  onOpenChange,
  consumers,
}) => {
  const totalSpend = consumers.reduce((sum, c) => sum + c.spend, 0);

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <People size={24} color="#7F56D9" variant="Bulk" />
          </div>
          <section className="flex flex-col gap-0.5">
            <h1 className="text-md font-semibold text-primary md:text-lg">
              Top Consumers
            </h1>
            <p className="text-sm text-tertiary">
              Total spend: ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-3">
            {consumers.map((consumer, index) => (
              <div
                key={consumer.id}
                className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar src={consumer.avatar} alt={consumer.name} size="md" />
                      <div className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-primary">
                        {consumer.name}
                      </span>
                      <Badge
                        size="sm"
                        type="pill-color"
                        color={
                          consumer.type === "Team"
                            ? "brand"
                            : consumer.type === "Project"
                              ? "purple"
                              : "gray"
                        }
                      >
                        {consumer.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-semibold text-primary">
                      ${consumer.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center gap-1">
                      {consumer.trend.startsWith("+") ? (
                        <TrendUp size={14} className="text-fg-success-primary" variant="Outline" />
                      ) : (
                        <TrendDown size={14} className="text-fg-error-primary" variant="Outline" />
                      )}
                      <span
                        className={cx(
                          "text-sm font-medium",
                          consumer.trend.startsWith("+")
                            ? "text-success-primary"
                            : "text-error-primary"
                        )}
                      >
                        {consumer.trend}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-secondary pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Tokens Used</span>
                    <span className="text-sm font-medium text-primary">
                      {consumer.tokens}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Requests</span>
                    <span className="text-sm font-medium text-primary">
                      {consumer.requests?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Avg Cost/Req</span>
                    <span className="text-sm font-medium text-primary">
                      {consumer.avgCostPerRequest || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SlideoutMenu.Content>

        <SlideoutMenu.Footer className="flex w-full justify-between gap-3">
          <Button size="md" color="secondary" iconLeading={ExportIcon}>
            Export Report
          </Button>
          <Button size="md" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
