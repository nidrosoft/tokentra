"use client";

import type { FC } from "react";

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput: FC<CurrencyInputProps> = ({
  value,
  onChange,
  currency = "USD",
  placeholder,
  className,
}) => {
  return (
    <div className={className}>
      {/* Currency input implementation */}
    </div>
  );
};
