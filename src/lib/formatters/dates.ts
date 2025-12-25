import { format, formatDistanceToNow, formatRelative } from "date-fns";

export function formatDate(
  date: Date | string,
  formatStr: string = "MMM d, yyyy"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatStr);
}

export function formatDateTime(
  date: Date | string,
  formatStr: string = "MMM d, yyyy h:mm a"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatStr);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatRelative(d, new Date());
}

export function formatDateRange(from: Date, to: Date): string {
  const fromStr = format(from, "MMM d");
  const toStr = format(to, "MMM d, yyyy");
  return `${fromStr} - ${toStr}`;
}
