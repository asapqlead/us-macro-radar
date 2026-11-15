import { NextResponse } from "next/server";
import { generateCalendarEvents } from "@/lib/macro/calendar-data";
import { generateWeeklyBrief } from "@/lib/macro/brief-generator";
import { ApiResponse, WeeklyBrief } from "@/types/macro";

export async function GET() {
  try {
    const calendarEvents = generateCalendarEvents();

    const regime = {
      type: "goldilocks" as const,
      title: "Goldilocks Regime",
      assessment:
        "Resilient growth paired with ongoing disinflation creates a supportive environment for equities and corporate debt.",
    };

    const brief = generateWeeklyBrief(regime, calendarEvents);

    return NextResponse.json<ApiResponse<WeeklyBrief>>(
      {
        success: true,
        data: brief,
        metadata: {
          timestamp: brief.lastUpdated,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_")
    ) {
      throw error;
    }

    console.error("Weekly Brief API error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate weekly brief",
      },
      { status: 500 }
    );
  }
}
