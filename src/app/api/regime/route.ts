import { NextResponse } from "next/server";
import { getMetricSummary } from "@/lib/fred/client";
import {
  calculateRegimeScores,
  classifyRegime,
} from "@/lib/macro/regime-engine";
import { regimeClassificationSchema } from "@/types/schemas";
import { ApiResponse, MetricSummary, RegimeClassification } from "@/types/macro";

export async function GET() {
  try {
    const keySeries = [
      "GDPC1",
      "RSAFS",
      "INDPRO",
      "WEI",
      "CPIAUCSL",
      "CPILFESL",
      "PCEPI",
      "PCEPILFE",
      "T5YIE",
      "UNRATE",
      "PAYEMS",
      "NFCI",
      "BAMLH0A0HYM2",
      "T10Y2Y",
    ];

    const summaries = await Promise.all(
      keySeries.map(async (id) => {
        try {
          return await getMetricSummary(id);
        } catch {
          return null;
        }
      })
    );

    const metricsMap: Record<string, MetricSummary> = {};
    for (const item of summaries) {
      if (item) {
        metricsMap[item.seriesId] = item;
      }
    }

    const scores = calculateRegimeScores(metricsMap);
    const regime = classifyRegime(scores, metricsMap);

    // Validate with Zod
    const validation = regimeClassificationSchema.safeParse(regime);
    if (!validation.success) {
      console.warn("Regime Zod validation warning:", validation.error.format());
    }

    return NextResponse.json<ApiResponse<RegimeClassification>>(
      {
        success: true,
        data: regime,
        metadata: {
          timestamp: regime.lastUpdated,
          isMock: summaries.some((s) => s?.isMockData),
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=1800, stale-while-revalidate=86400",
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

    console.error("Regime API error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to evaluate macro regime",
      },
      { status: 500 }
    );
  }
}
