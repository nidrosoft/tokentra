"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ArrowRight, Building02, Users01, CurrencyDollar, Target04 } from "@untitledui/icons";

const COMPANY_SIZES = [
  { value: "1", label: "Just me" },
  { value: "2-10", label: "2-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-1000", label: "201-1000" },
  { value: "1000+", label: "1000+" },
];

const MONTHLY_SPEND = [
  { value: "under_100", label: "Under $100" },
  { value: "100_500", label: "$100 - $500" },
  { value: "500_2000", label: "$500 - $2,000" },
  { value: "2000_10000", label: "$2,000 - $10,000" },
  { value: "over_10000", label: "Over $10,000" },
];

const USER_ROLES = [
  { value: "developer", label: "Developer / Engineer" },
  { value: "engineering_manager", label: "Engineering Manager" },
  { value: "product_manager", label: "Product Manager" },
  { value: "finance", label: "Finance / Operations" },
  { value: "executive", label: "Executive / Founder" },
  { value: "other", label: "Other" },
];

const GOALS = [
  { value: "track_costs", label: "Track AI costs", icon: "📊" },
  { value: "set_budgets", label: "Set budgets & alerts", icon: "💰" },
  { value: "optimize_spend", label: "Optimize spending", icon: "📉" },
  { value: "team_visibility", label: "Team visibility", icon: "👥" },
  { value: "compliance", label: "Compliance reporting", icon: "📋" },
  { value: "forecasting", label: "Cost forecasting", icon: "🔮" },
];

export default function CompanyProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companySize: "",
    userRole: "",
    monthlyAiSpend: "",
    goals: [] as string[],
  });

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(data.nextStep || "/onboarding/provider-setup");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue = formData.companySize && formData.userRole;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 text-sm text-tertiary">
        <span className="font-medium text-primary">Step 1 of 3</span>
        <span>•</span>
        <span>Company Profile</span>
      </div>

      <div className="rounded-xl border border-primary bg-primary p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
            <Building02 className="h-5 w-5" />
            Tell us about your company
          </h2>
          <p className="mt-1 text-sm text-tertiary">
            This helps us personalize your TokenTra experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <Input
            label="Company Name (optional)"
            placeholder="Acme Inc."
            value={formData.companyName}
            onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
          />

          {/* Company Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary">
              <Users01 className="h-4 w-4" />
              Company Size *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMPANY_SIZES.map(size => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, companySize: size.value }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    formData.companySize === size.value
                      ? "border-brand bg-brand-primary text-brand-secondary"
                      : "border-secondary hover:border-primary"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Your Role *</label>
            <div className="grid grid-cols-2 gap-2">
              {USER_ROLES.map(role => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userRole: role.value }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                    formData.userRole === role.value
                      ? "border-brand bg-brand-primary text-brand-secondary"
                      : "border-secondary hover:border-primary"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly AI Spend */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary">
              <CurrencyDollar className="h-4 w-4" />
              Monthly AI Spend (optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MONTHLY_SPEND.map(spend => (
                <button
                  key={spend.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, monthlyAiSpend: spend.value }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    formData.monthlyAiSpend === spend.value
                      ? "border-brand bg-brand-primary text-brand-secondary"
                      : "border-secondary hover:border-primary"
                  }`}
                >
                  {spend.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary">
              <Target04 className="h-4 w-4" />
              What are your goals? (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(goal => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => handleGoalToggle(goal.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left flex items-center gap-2 ${
                    formData.goals.includes(goal.value)
                      ? "border-brand bg-brand-primary text-brand-secondary"
                      : "border-secondary hover:border-primary"
                  }`}
                >
                  <span>{goal.icon}</span>
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              color="tertiary"
              onClick={() => router.push("/dashboard")}
            >
              Skip for now
            </Button>
            <Button 
              type="submit" 
              isDisabled={!canContinue || isSubmitting}
              isLoading={isSubmitting}
              iconTrailing={ArrowRight}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
