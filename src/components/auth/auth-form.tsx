"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layer, TickCircle } from "iconsax-react";
import { TabList, Tabs, Tab } from "@/components/application/tabs/tabs";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { cx } from "@/utils/cx";

const tabs = [
  { id: "signup", label: "Sign up" },
  { id: "login", label: "Log in" },
];

interface AuthFormProps {
  defaultTab?: "signup" | "login";
}

export const AuthForm = ({ defaultTab = "signup" }: AuthFormProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = activeTab === "signup";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      if (isSignup) {
        // TODO: Implement signup with Supabase Auth
        router.push("/dashboard");
      } else {
        // TODO: Implement login with NextAuth
        router.push("/dashboard");
      }
    } catch {
      // Auth error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth with NextAuth
    } catch {
      // Google auth error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen overflow-hidden bg-primary px-4 py-12 md:px-8 md:pt-24">
      <div className="mx-auto flex w-full flex-col gap-8 sm:max-w-[360px]">
        {/* Header with Logo and Title */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <BackgroundPattern
              pattern="grid"
              className="absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 md:block"
            />
            <BackgroundPattern
              pattern="grid"
              size="md"
              className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 md:hidden"
            />
            {/* TokenTRA Logo */}
            <div className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-brand-solid shadow-lg max-md:size-10">
              <Layer size={28} color="#ffffff" variant="Bold" className="max-md:size-6" />
            </div>
          </div>

          <div className="z-10 flex flex-col gap-2 md:gap-3">
            <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">
              {isSignup ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-md text-tertiary">
              {isSignup
                ? "Start tracking your AI costs today."
                : "Sign in to your TokenTRA account."}
            </p>
          </div>

          {/* Tab Switcher */}
          <Tabs
            className="z-10 w-full"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <TabList size="sm" fullWidth type="button-minimal" items={tabs}>
              {(item) => <Tab key={item.id} id={item.id}>{item.label}</Tab>}
            </TabList>
          </Tabs>
        </div>

        {/* Auth Form */}
        <Form onSubmit={handleSubmit} className="z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            {/* Name field - only for signup */}
            {isSignup && (
              <Input
                isRequired
                hideRequiredIndicator
                label="Name"
                type="text"
                name="name"
                placeholder="Enter your name"
                size="md"
              />
            )}

            {/* Email field */}
            <Input
              isRequired
              hideRequiredIndicator
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              size="md"
            />

            {/* Password field */}
            <Input
              isRequired
              hideRequiredIndicator
              label="Password"
              type="password"
              name="password"
              size="md"
              placeholder={isSignup ? "Create a password" : "Enter your password"}
              onChange={setPassword}
              minLength={8}
              pattern={isSignup ? '.*[!@#$%^&*(),.?":{}|<>].*' : undefined}
            />

            {/* Password requirements - only for signup */}
            {isSignup && (
              <div className="flex flex-col gap-3">
                <span className="flex items-center gap-2">
                  <TickCircle
                    size={20}
                    variant={password.length >= 8 ? "Bold" : "Outline"}
                    className={cx(
                      "transition duration-150 ease-in-out",
                      password.length >= 8 ? "text-fg-success-primary" : "text-fg-disabled_subtle"
                    )}
                  />
                  <p className="text-sm text-tertiary">Must be at least 8 characters</p>
                </span>
                <span className="flex items-center gap-2">
                  <TickCircle
                    size={20}
                    variant={password.match(/[!@#$%^&*(),.?":{}|<>]/) ? "Bold" : "Outline"}
                    className={cx(
                      "transition duration-150 ease-in-out",
                      password.match(/[!@#$%^&*(),.?":{}|<>]/)
                        ? "text-fg-success-primary"
                        : "text-fg-disabled_subtle"
                    )}
                  />
                  <p className="text-sm text-tertiary">Must contain one special character</p>
                </span>
              </div>
            )}

            {/* Forgot password link - only for login */}
            {!isSignup && (
              <div className="flex justify-end">
                <Button href="/forgot-password" color="link-color" size="sm">
                  Forgot password?
                </Button>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="z-10 flex flex-col gap-4">
            <Button type="submit" size="lg" isLoading={isLoading}>
              {isSignup ? "Get started" : "Sign in"}
            </Button>
            <SocialButton
              social="google"
              theme="color"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              {isSignup ? "Sign up with Google" : "Sign in with Google"}
            </SocialButton>
          </div>
        </Form>

        {/* Footer link */}
        <div className="flex justify-center gap-1 text-center">
          <span className="text-sm text-tertiary">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
          </span>
          <Button
            color="link-color"
            size="md"
            onClick={() => setActiveTab(isSignup ? "login" : "signup")}
          >
            {isSignup ? "Log in" : "Sign up"}
          </Button>
        </div>
      </div>
    </section>
  );
};
