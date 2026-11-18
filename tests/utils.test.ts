import { describe, it, expect } from "vitest";
import { formatCalendarEventDateTime, formatSpecificDate } from "@/lib/utils";

describe("Calendar Date & UTC+7 Time Formatting", () => {
  it("should format specific date with weekday correctly", () => {
    const formatted = formatSpecificDate("2026-11-17");
    expect(formatted).toContain("Nov 17, 2026");
    expect(formatted).toContain("Tue");
  });

  it("should convert US Eastern 08:30:00 to 20:30 UTC+7 on the same calendar day", () => {
    const res = formatCalendarEventDateTime("2026-11-17", "08:30:00", "UTC+7");
    expect(res.specificDate).toContain("Nov 17, 2026");
    expect(res.specificDate).toContain("Tue");
    expect(res.timeString).toBe("20:30 UTC+7");
    expect(res.secondaryTime).toBe("08:30 ET");
    expect(res.fullDisplay).toContain("Tue, Nov 17, 2026 • 20:30 UTC+7 (08:30 ET)");
  });

  it("should properly roll over FOMC 14:00:00 ET to 02:00 UTC+7 on the NEXT day", () => {
    // FOMC is Wednesday 14:00:00 ET -> in UTC+7 it is 02:00:00 Thursday morning!
    const res = formatCalendarEventDateTime("2026-11-18", "14:00:00", "UTC+7");
    expect(res.specificDate).toContain("Nov 19, 2026");
    expect(res.specificDate).toContain("Thu");
    expect(res.timeString).toBe("02:00 UTC+7");
    expect(res.secondaryTime).toBe("14:00 ET");
  });

  it("should format with ET as primary when timezone is set to ET", () => {
    const res = formatCalendarEventDateTime("2026-11-17", "08:30:00", "ET");
    expect(res.timeString).toBe("08:30 ET");
    expect(res.secondaryTime).toBe("20:30 UTC+7");
  });
});
