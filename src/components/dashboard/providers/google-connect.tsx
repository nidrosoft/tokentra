"use client";

import type { FC } from "react";

export interface GoogleConnectProps {
  onConnect?: (credentials: { projectId: string; location: string; credentials: string }) => void;
  className?: string;
}

export const GoogleConnect: FC<GoogleConnectProps> = ({ className }) => {
  return <div className={className}>{/* Google connect form */}</div>;
};
