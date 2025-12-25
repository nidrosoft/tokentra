"use client";

import type { FC } from "react";

export interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput: FC<TagInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  return (
    <div className={className}>
      {/* Tag input implementation */}
    </div>
  );
};
