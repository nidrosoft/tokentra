import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - TokenTRA",
  description: "Sign in or create an account to access TokenTRA",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}
