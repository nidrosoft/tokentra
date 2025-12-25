"use client";

import type { FC } from "react";

export interface AlertChannelsProps {
  channels?: Array<{ type: string; config: Record<string, unknown>; enabled: boolean }>;
  onChange?: (channels: Array<Record<string, unknown>>) => void;
  className?: string;
}

export const AlertChannels: FC<AlertChannelsProps> = ({ className }) => {
  return <div className={className}>{/* Alert channels implementation */}</div>;
};
