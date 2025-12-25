"use client";

import type { FC } from "react";

export interface AnthropicConnectProps {
  onConnect?: (credentials: { apiKey: string }) => void;
  className?: string;
}

export const AnthropicConnect: FC<AnthropicConnectProps> = ({ className }) => {
  return <div className={className}>{/* Anthropic connect form */}</div>;
};
