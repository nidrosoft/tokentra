"use client";

import type { FC, ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  className?: string;
}

export const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  loading,
  className,
}: DataTableProps<T>) => {
  return (
    <div className={className}>
      {/* Data table implementation using TanStack Table */}
    </div>
  );
};
