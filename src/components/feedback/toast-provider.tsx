"use client";

import type { FC, ReactNode } from "react";

export interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      {/* Toast container implementation */}
    </>
  );
};
