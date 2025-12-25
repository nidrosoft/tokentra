"use client";

import type { FC } from "react";

export interface OpenAIConnectProps {
  onConnect?: (credentials: { apiKey: string; organizationId?: string }) => void;
  className?: string;
}

export const OpenAIConnect: FC<OpenAIConnectProps> = ({ className }) => {
  return <div className={className}>{/* OpenAI connect form */}</div>;
};
