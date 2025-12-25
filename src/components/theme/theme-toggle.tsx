"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon01, Sun } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ThemeToggle = ({ size = "md", className }: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cx(
          "flex items-center justify-center rounded-md bg-secondary",
          size === "sm" && "size-8",
          size === "md" && "size-9",
          size === "lg" && "size-10",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cx(
        "flex items-center justify-center rounded-md text-fg-quaternary transition-colors hover:bg-secondary hover:text-fg-secondary",
        size === "sm" && "size-8",
        size === "md" && "size-9",
        size === "lg" && "size-10",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className={cx(size === "sm" ? "size-4" : size === "md" ? "size-5" : "size-6")} />
      ) : (
        <Moon01 className={cx(size === "sm" ? "size-4" : size === "md" ? "size-5" : "size-6")} />
      )}
    </button>
  );
};

export const ThemeToggleSwitch = ({ className }: { className?: string }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cx("flex h-9 w-[72px] rounded-lg bg-secondary", className)} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cx(
        "relative flex h-9 w-[72px] items-center rounded-lg bg-secondary p-1",
        className
      )}
    >
      <div
        className={cx(
          "absolute h-7 w-8 rounded-md bg-primary shadow-sm transition-transform duration-200",
          isDark ? "translate-x-8" : "translate-x-0"
        )}
      />
      <button
        onClick={() => setTheme("light")}
        className={cx(
          "relative z-10 flex h-7 w-8 items-center justify-center rounded-md transition-colors",
          !isDark ? "text-fg-secondary" : "text-fg-quaternary hover:text-fg-tertiary"
        )}
        aria-label="Light mode"
      >
        <Sun className="size-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cx(
          "relative z-10 flex h-7 w-8 items-center justify-center rounded-md transition-colors",
          isDark ? "text-fg-secondary" : "text-fg-quaternary hover:text-fg-tertiary"
        )}
        aria-label="Dark mode"
      >
        <Moon01 className="size-4" />
      </button>
    </div>
  );
};
