import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMetricValue(
  value: number | null | undefined,
  units?: string,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }

  // Handle percentages
  if (units === "%" || units === "percent" || units === "Percent") {
    return `${value.toFixed(decimals)}%`;
  }

  // Handle large currency / quantities
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  return value.toFixed(decimals);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month) return dateString;
    const date = new Date(Date.UTC(year, month - 1, day || 1));
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateString;
  }
}
