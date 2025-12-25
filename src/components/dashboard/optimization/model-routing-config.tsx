"use client";

import type { FC } from "react";

export interface ModelRoutingConfigProps {
  config?: Record<string, unknown>;
  onChange?: (config: Record<string, unknown>) => void;
  className?: string;
}

export const ModelRoutingConfig: FC<ModelRoutingConfigProps> = ({ className }) => {
  return <div className={className}>{/* Model routing config implementation */}</div>;
};
