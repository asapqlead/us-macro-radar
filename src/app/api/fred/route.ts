import { NextRequest, NextResponse } from "next/server";
import {
  FredApiError,
  fetchFredObservations,
  fetchFredSeriesInfo,
  getMetricSummary,
} from "@/lib/fred/client";
import { FredFetchOptions } from "@/types/fred";
import { ApiResponse } from "@/types/macro";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("series_id");
    const seriesIdsParam = searchParams.get("series_ids");
    const mode = searchParams.get("mode") || "summary"; // 'summary' | 'observations' | 'metadata'
    const units = searchParams.get("units") as FredFetchOptions["units"] | null;
    const frequency = searchParams.get("frequency") as
      | FredFetchOptions["frequency"]
      | null;
    const observationStart = searchParams.get("observation_start") || undefined;
    const observationEnd = searchParams.get("observation_end") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    const options: FredFetchOptions = {
      units: units || undefined,
      frequency: frequency || undefined,
      observation_start: observationStart,
      observation_end: observationEnd,
      limit,
    };

    // Case 1: Batch request with comma-separated IDs
    if (seriesIdsParam) {
      const ids = seriesIdsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      if (ids.length === 0) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "Parameter 'series_ids' must contain at least one valid series ID.",
          },
          { status: 400 }
        );
      }

      // Fetch all concurrently
      const summaries = await Promise.all(
        ids.map(async (id) => {
          try {
            return await getMetricSummary(id, options);
          } catch (err) {
            console.error(`Error fetching series ${id}:`, err);
            return null;
          }
        })
      );

      const validSummaries = summaries.filter(Boolean);

      return NextResponse.json(
        {
          success: true,
          data: validSummaries,
          metadata: {
            timestamp: new Date().toISOString(),
            count: validSummaries.length,
            isMock: validSummaries.some((s) => s?.isMockData),
          },
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    // Case 2: Single Series ID
    if (!seriesId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            "Missing required parameter: 'series_id' or 'series_ids'. Example: /api/fred?series_id=T10Y2Y",
        },
        { status: 400 }
      );
    }

    const cleanSeriesId = seriesId.trim().toUpperCase();

    if (mode === "metadata") {
      const info = await fetchFredSeriesInfo(cleanSeriesId);
      if (!info) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: `Series metadata not found for ID: ${cleanSeriesId}`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: info,
        metadata: { timestamp: new Date().toISOString() },
      });
    }

    if (mode === "observations") {
      const result = await fetchFredObservations(cleanSeriesId, options);
      return NextResponse.json(
        {
          success: true,
          data: result.observations,
          metadata: {
            timestamp: new Date().toISOString(),
            isMock: result.isMock,
            count: result.observations.length,
          },
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    // Default mode: Processed Metric Summary
    const summary = await getMetricSummary(cleanSeriesId, options);

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

    console.error("FRED API route error:", error);
    const message =
      error instanceof FredApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Internal server error while retrieving FRED data";

    const status = error instanceof FredApiError && error.status ? error.status : 500;

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
