"use client";

import type { FC } from "react";

export interface AzureConnectProps {
  onConnect?: (credentials: { apiKey: string; endpoint: string; deploymentId: string }) => void;
  className?: string;
}

export const AzureConnect: FC<AzureConnectProps> = ({ className }) => {
  return <div className={className}>{/* Azure connect form */}</div>;
};
