import { NextResponse } from "next/server";
import { generateCalendarEvents } from "@/lib/macro/calendar-data";
import { calendarResponseSchema } from "@/types/schemas";
import { ApiResponse, CalendarResponse } from "@/types/macro";

export async function GET() {
  try {
    const events = generateCalendarEvents();

    const responseData: CalendarResponse = {
      events,
      lastUpdated: new Date().toISOString(),
    };

    const validation = calendarResponseSchema.safeParse(responseData);
    if (!validation.success) {
      console.warn("Calendar Zod validation warning:", validation.error.format());
    }

    return NextResponse.json<ApiResponse<CalendarResponse>>(
      {
        success: true,
        data: responseData,
        metadata: {
          timestamp: responseData.lastUpdated,
          count: events.length,
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

    console.error("Calendar API route error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate economic calendar",
      },
      { status: 500 }
    );
  }
}
