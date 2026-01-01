"use client";

import type { FC } from "react";
import { Cloud, TrendUp, TrendDown, ExportSquare } from "iconsax-react";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface Provider {
  name: string;
  spend: number;
  percentage: number;
  color: string;
  requests: number;
  tokens: string;
  trend: string;
  status: "connected" | "pending" | "error";
}

interface ProvidersSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  providers: Provider[];
}

const CloudIcon = (props: { className?: string }) => (
  <Cloud size={20} color="currentColor" className={props.className} variant="Bulk" />
);

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

export const ProvidersSlideout: FC<ProvidersSlideoutProps> = ({
  isOpen,
  onOpenChange,
  providers,
}) => {
  const totalSpend = providers.reduce((sum, p) => sum + p.spend, 0);

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <Cloud size={24} color="#7F56D9" variant="Bulk" />
          </div>
          <section className="flex flex-col gap-0.5">
            <h1 className="text-md font-semibold text-primary md:text-lg">
              Spend by Provider
            </h1>
            <p className="text-sm text-tertiary">
              Total spend: ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-4">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cx(
                        "flex size-10 items-center justify-center rounded-lg",
                        provider.name === "OpenAI" ? "bg-utility-success-50" :
                        provider.name === "Anthropic" ? "bg-utility-brand-50" :
                        provider.name === "Google AI" ? "bg-utility-warning-50" :
                        "bg-utility-error-50"
                      )}
                    >
                      <Cloud 
                        size={20} 
                        color={
                          provider.name === "OpenAI" ? "#12B76A" :
                          provider.name === "Anthropic" ? "#7F56D9" :
                          provider.name === "Google AI" ? "#F79009" :
                          "#F04438"
                        }
                        variant="Bold" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-primary">
                        {provider.name}
                      </span>
                      <Badge
                        size="sm"
                        type="pill-color"
                        color={
                          provider.status === "connected"
                            ? "success"
                            : provider.status === "pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {provider.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-semibold text-primary">
                      ${provider.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-tertiary">
                      {provider.percentage}% of total
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cx("h-full rounded-full", provider.color)}
                    style={{ width: `${provider.percentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-secondary pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Requests</span>
                    <span className="text-sm font-medium text-primary">
                      {provider.requests.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Tokens</span>
                    <span className="text-sm font-medium text-primary">
                      {provider.tokens}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Trend</span>
                    <div className="flex items-center gap-1">
                      {provider.trend.startsWith("+") ? (
                        <TrendUp size={14} className="text-fg-success-primary" variant="Outline" />
                      ) : (
                        <TrendDown size={14} className="text-fg-error-primary" variant="Outline" />
                      )}
                      <span
                        className={cx(
                          "text-sm font-medium",
                          provider.trend.startsWith("+")
                            ? "text-success-primary"
                            : "text-error-primary"
                        )}
                      >
                        {provider.trend}
                      </span>
                    </div>
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
