"use client";

import type { FC } from "react";
import { Flash, TickCircle, CloseCircle, ExportSquare } from "iconsax-react";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  savings: string;
  impact: "high" | "medium" | "low";
  category: string;
  effort: "easy" | "moderate" | "complex";
  status?: "pending" | "applied" | "dismissed";
}

interface OptimizationSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: Recommendation[];
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

const DismissIcon = ({ className }: { className?: string }) => (
  <CloseCircle size={16} color="currentColor" className={className} variant="Outline" />
);

const ApplyIcon = ({ className }: { className?: string }) => (
  <TickCircle size={16} color="currentColor" className={className} variant="Outline" />
);

export const OptimizationSlideout: FC<OptimizationSlideoutProps> = ({
  isOpen,
  onOpenChange,
  recommendations,
  onApply,
  onDismiss,
}) => {
  const totalSavings = recommendations.reduce((sum, r) => {
    const amount = parseFloat(r.savings.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const pendingCount = recommendations.filter((r) => r.status !== "applied" && r.status !== "dismissed").length;

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-success-50">
            <Flash size={24} color="#12B76A" variant="Bulk" />
          </div>
          <section className="flex flex-col gap-0.5">
            <h1 className="text-md font-semibold text-primary md:text-lg">
              Optimization Opportunities
            </h1>
            <p className="text-sm text-tertiary">
              {pendingCount} recommendations • Up to ${totalSavings.toLocaleString()}/mo savings
            </p>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={cx(
                  "flex flex-col gap-4 rounded-xl border bg-primary p-4 shadow-xs",
                  rec.status === "applied"
                    ? "border-success-primary bg-success-secondary/20"
                    : rec.status === "dismissed"
                      ? "border-secondary opacity-60"
                      : "border-secondary"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cx(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      rec.impact === "high" ? "bg-utility-success-50" : 
                      rec.impact === "medium" ? "bg-utility-warning-50" : 
                      "bg-utility-gray-100"
                    )}
                  >
                    <Flash 
                      size={20} 
                      color={
                        rec.impact === "high" ? "#12B76A" : 
                        rec.impact === "medium" ? "#F79009" : 
                        "#667085"
                      }
                      variant="Bold" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-primary">
                      {rec.title}
                    </span>
                    <span className="text-sm text-tertiary">
                      {rec.description}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    size="sm"
                    type="pill-color"
                    color={
                      rec.impact === "high"
                        ? "success"
                        : rec.impact === "medium"
                          ? "warning"
                          : "gray"
                    }
                  >
                    {rec.impact} impact
                  </Badge>
                  <Badge size="sm" type="pill-color" color="brand">
                    {rec.category}
                  </Badge>
                  <Badge
                    size="sm"
                    type="pill-color"
                    color={
                      rec.effort === "easy"
                        ? "success"
                        : rec.effort === "moderate"
                          ? "warning"
                          : "error"
                    }
                  >
                    {rec.effort} effort
                  </Badge>
                  {rec.status === "applied" && (
                    <Badge size="sm" type="pill-color" color="success">
                      Applied
                    </Badge>
                  )}
                  {rec.status === "dismissed" && (
                    <Badge size="sm" type="pill-color" color="gray">
                      Dismissed
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-secondary pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Estimated Savings</span>
                    <span className="text-lg font-semibold text-success-primary">
                      {rec.savings}
                    </span>
                  </div>
                  {rec.status !== "applied" && rec.status !== "dismissed" && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => onDismiss?.(rec.id)}
                        iconLeading={DismissIcon}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => onApply?.(rec.id)}
                        iconLeading={ApplyIcon}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
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
