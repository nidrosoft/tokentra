"use client";

import type { FC, ReactNode } from "react";

export interface MobileNavProps {
  children?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MobileNav: FC<MobileNavProps> = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <nav className="fixed inset-y-0 left-0 w-72 bg-background">
        {children}
      </nav>
    </div>
  );
};
