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

/**
 * Formats a specific calendar date with weekday (e.g., "Tue, Nov 17, 2026").
 */
export function formatSpecificDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month) return dateString;
    const date = new Date(Date.UTC(year, month - 1, day || 1));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateString;
  }
}

export interface CalendarEventFormattedDateTime {
  specificDate: string;
  timeString: string;
  secondaryTime: string;
  fullDisplay: string;
}

/**
 * Converts a US Eastern scheduled release date and time into UTC+7 (or ET) with specific day of week.
 */
export function formatCalendarEventDateTime(
  releaseDate: string,
  releaseTime: string,
  timezone: "UTC+7" | "ET" = "UTC+7"
): CalendarEventFormattedDateTime {
  if (!releaseDate) {
    return {
      specificDate: "",
      timeString: "",
      secondaryTime: "",
      fullDisplay: "",
    };
  }

  try {
    const [year, month, day] = releaseDate.split("-").map(Number);
    const timeParts = (releaseTime || "08:30:00").split(":").map(Number);
    const hour = timeParts[0] || 0;
    const min = timeParts[1] || 0;

    // US releases are in Eastern Time (America/New_York)
    // Find exact UTC timestamp accounting for US Daylight Saving Time (EST vs EDT):
    const utcGuess = new Date(Date.UTC(year, month - 1, day, hour + 5, min));
    const nyHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        hourCycle: "h23",
      }).format(utcGuess)
    );
    const offsetHours = 5 + (hour - nyHour);
    const exactUtcMs = Date.UTC(year, month - 1, day, hour + offsetHours, min);
    const dateObj = new Date(exactUtcMs);

    const targetTz = timezone === "UTC+7" ? "Asia/Bangkok" : "America/New_York";
    const specificDate = dateObj.toLocaleDateString("en-US", {
      timeZone: targetTz,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeStr = dateObj.toLocaleTimeString("en-US", {
      timeZone: targetTz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const altTz = timezone === "UTC+7" ? "America/New_York" : "Asia/Bangkok";
    const altTimeStr = dateObj.toLocaleTimeString("en-US", {
      timeZone: altTz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const timeLabel = timezone === "UTC+7" ? "UTC+7" : "ET";
    const altLabel = timezone === "UTC+7" ? "ET" : "UTC+7";

    return {
      specificDate,
      timeString: `${timeStr} ${timeLabel}`,
      secondaryTime: `${altTimeStr} ${altLabel}`,
      fullDisplay: `${specificDate} • ${timeStr} ${timeLabel} (${altTimeStr} ${altLabel})`,
    };
  } catch {
    return {
      specificDate: releaseDate,
      timeString: `${releaseTime} ET`,
      secondaryTime: "",
      fullDisplay: `${releaseDate} • ${releaseTime} ET`,
    };
  }
}
