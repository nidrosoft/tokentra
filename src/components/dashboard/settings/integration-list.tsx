"use client";

import type { FC } from "react";

export interface IntegrationListProps {
  integrations?: Array<{ id: string; name: string; type: string; connected: boolean }>;
  className?: string;
}

export const IntegrationList: FC<IntegrationListProps> = ({ className }) => {
  return <div className={className}>{/* Integration list implementation */}</div>;
};
