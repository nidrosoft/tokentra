"use client";

import type { FC } from "react";

export interface AWSConnectProps {
  onConnect?: (credentials: { accessKeyId: string; secretAccessKey: string; region: string }) => void;
  className?: string;
}

export const AWSConnect: FC<AWSConnectProps> = ({ className }) => {
  return <div className={className}>{/* AWS connect form */}</div>;
};
