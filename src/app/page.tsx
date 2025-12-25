import type { Metadata } from "next";
import { AuthForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "TokenTRA - AI Cost Management Platform",
  description: "Sign in or create your TokenTRA account to start tracking AI costs",
};

export default function AuthPage() {
  return <AuthForm defaultTab="signup" />;
}
