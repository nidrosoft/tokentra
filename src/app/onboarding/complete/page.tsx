"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Check, ArrowRight, Stars01 } from "@untitledui/icons";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {

    // Mark onboarding as complete
    fetch("/api/onboarding/complete", {
      method: "POST",
    });

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="space-y-6 text-center">
      <div className="rounded-xl border border-primary bg-primary p-8 shadow-sm">
        {/* Success Icon */}
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-success-primary flex items-center justify-center">
          <Check className="h-8 w-8 text-success-primary" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-2">
          You&apos;re all set! 🎉
        </h1>
        <p className="text-tertiary mb-8">
          Your TokenTra account is ready. Let&apos;s start tracking your AI costs.
        </p>

        {/* What's Next */}
        <div className="rounded-lg bg-secondary p-6 text-left mb-8">
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <Stars01 className="h-5 w-5" />
            What&apos;s next?
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-brand-secondary">1</span>
              </div>
              <div>
                <div className="font-medium text-primary">View your dashboard</div>
                <div className="text-sm text-tertiary">See your AI spending overview and trends</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-brand-secondary">2</span>
              </div>
              <div>
                <div className="font-medium text-primary">Set up budgets & alerts</div>
                <div className="text-sm text-tertiary">Get notified before costs get out of control</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-brand-secondary">3</span>
              </div>
              <div>
                <div className="font-medium text-primary">Explore optimization insights</div>
                <div className="text-sm text-tertiary">Discover ways to reduce your AI costs</div>
              </div>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          onClick={() => router.push("/dashboard")}
          iconTrailing={ArrowRight}
          className="w-full"
        >
          Go to Dashboard
        </Button>

        <p className="mt-4 text-sm text-tertiary">
          Redirecting in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}
