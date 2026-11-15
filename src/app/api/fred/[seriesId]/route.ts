import { NextRequest, NextResponse } from "next/server";
import { FredApiError, getMetricSummary } from "@/lib/fred/client";
import { FredFetchOptions } from "@/types/fred";
import { ApiResponse } from "@/types/macro";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await context.params;

    if (!seriesId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Series ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const units = searchParams.get("units") as FredFetchOptions["units"] | null;
    const frequency = searchParams.get("frequency") as
      | FredFetchOptions["frequency"]
      | null;
    const observationStart = searchParams.get("observation_start") || undefined;
    const observationEnd = searchParams.get("observation_end") || undefined;

    const summary = await getMetricSummary(seriesId.toUpperCase(), {
      units: units || undefined,
      frequency: frequency || undefined,
      observation_start: observationStart,
      observation_end: observationEnd,
    });

    return NextResponse.json(
      {
        success: true,
        data: summary,
        metadata: {
          timestamp: new Date().toISOString(),
          isMock: summary.isMockData,
          count: summary.history.length,
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

    const message =
      error instanceof FredApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Internal server error";
    const status = error instanceof FredApiError && error.status ? error.status : 500;

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status }
    );
  }
}
