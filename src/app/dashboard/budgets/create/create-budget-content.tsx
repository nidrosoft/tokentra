"use client";

import type { FC } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { BudgetForm, type BudgetFormData } from "@/components/dashboard/budgets";

const BackIcon = ({ className }: { className?: string }) => (
  <ArrowLeft size={20} color="currentColor" className={className} variant="Outline" />
);

export const CreateBudgetPageContent: FC = () => {
  const router = useRouter();

  const handleSubmit = (data: BudgetFormData) => {
    // TODO: Call budget creation API
    router.push("/dashboard/budgets");
  };

  const handleCancel = () => {
    router.push("/dashboard/budgets");
  };

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Button
          size="sm"
          color="tertiary"
          iconLeading={BackIcon}
          onClick={handleCancel}
          className="w-fit"
        >
          Back to Budgets
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Create Budget
          </h1>
          <p className="text-md text-tertiary">
            Set up a new spending limit for your organization, team, or project.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mx-auto w-full max-w-lg rounded-xl border border-secondary bg-primary p-6 shadow-xs">
        <BudgetForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
};
