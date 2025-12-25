"use client";

import type { FC } from "react";
import { TickCircle, Crown } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

export interface BillingSettingsProps {
  className?: string;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "For individuals getting started",
    features: ["Up to 3 team members", "1,000 tracked requests/month", "7-day data retention", "Email support"],
    current: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    description: "For growing teams",
    features: ["Up to 20 team members", "100,000 tracked requests/month", "90-day data retention", "Priority support", "Custom alerts"],
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    description: "For large organizations",
    features: ["Unlimited team members", "Unlimited requests", "Unlimited data retention", "Dedicated support", "SSO & SAML", "Custom integrations"],
    current: false,
  },
];

export const BillingSettings: FC<BillingSettingsProps> = ({ className }) => {
  const currentPlan = plans.find((p) => p.current);

  return (
    <div className={cx("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">Billing & Plans</h2>
        <p className="text-sm text-tertiary">Manage your subscription and billing information.</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-brand-primary bg-brand-secondary/20 p-5">
        <div className="flex items-center gap-2">
          <Crown size={20} color="#7F56D9" variant="Bold" />
          <span className="font-semibold text-primary">Current Plan: {currentPlan?.name}</span>
          <Badge size="sm" color="brand">Active</Badge>
        </div>
        <p className="mt-2 text-sm text-tertiary">
          Your next billing date is <span className="font-medium text-secondary">April 1, 2024</span>
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cx(
              "flex flex-col rounded-xl border p-5",
              plan.current ? "border-brand-primary bg-brand-secondary/10" : "border-secondary bg-primary"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">{plan.name}</h3>
              {plan.current && <Badge size="sm" color="brand">Current</Badge>}
            </div>
            <p className="mt-1 text-sm text-tertiary">{plan.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-primary">${plan.price}</span>
              <span className="text-sm text-tertiary">/month</span>
            </div>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-secondary">
                  <TickCircle size={16} color="#17B26A" variant="Bold" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              size="md"
              color={plan.current ? "secondary" : "primary"}
              className="mt-5 w-full"
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="rounded-xl border border-secondary p-5">
        <h3 className="font-semibold text-primary">Payment Method</h3>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
              <span className="text-sm font-bold text-secondary">VISA</span>
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Visa ending in 4242</p>
              <p className="text-xs text-tertiary">Expires 12/2025</p>
            </div>
          </div>
          <Button size="sm" color="secondary">Update</Button>
        </div>
      </div>
    </div>
  );
};
