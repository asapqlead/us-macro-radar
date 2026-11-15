import { NextResponse } from "next/server";
import { getMetricSummary } from "@/lib/fred/client";
import {
  calculateRegimeScores,
  classifyRegime,
} from "@/lib/macro/regime-engine";
import { CATEGORY_PANEL_CONFIG } from "@/config/fred-series";
import { dashboardResponseSchema } from "@/types/schemas";
import {
  ApiResponse,
  DashboardResponse,
  MacroCategory,
  MetricStatus,
  MetricSummary,
  PanelData,
} from "@/types/macro";

export async function GET() {
  try {
    const categories: MacroCategory[] = [
      "growth",
      "inflation",
      "labor",
      "policy",
      "financial_conditions",
    ];

    // Collect all series IDs across categories
    const allSeriesIds = Array.from(
      new Set(
        categories.flatMap((cat) => CATEGORY_PANEL_CONFIG[cat].defaultSeriesIds)
      )
    );

    // Concurrently fetch all metric summaries
    const summariesArray = await Promise.all(
      allSeriesIds.map(async (id) => {
        try {
          return await getMetricSummary(id);
        } catch (err) {
          console.error(`Error loading series ${id} for dashboard:`, err);
          return null;
        }
      })
    );

    // Build metric map
    const metricsMap: Record<string, MetricSummary> = {};
    for (const item of summariesArray) {
      if (item) {
        metricsMap[item.seriesId] = item;
      }
    }

    // Determine panel summaries
    const panels: Record<MacroCategory, PanelData> = {} as Record<
      MacroCategory,
      PanelData
    >;

    for (const cat of categories) {
      const cfg = CATEGORY_PANEL_CONFIG[cat];
      const panelMetrics = cfg.defaultSeriesIds
        .map((id) => metricsMap[id])
        .filter(Boolean);

      // Determine panel overall status
      const improvingCount = panelMetrics.filter(
        (m) => m.status === "improving"
      ).length;
      const deterioratingCount = panelMetrics.filter(
        (m) => m.status === "deteriorating"
      ).length;

      let overallStatus: MetricStatus = "stable";
      if (improvingCount > deterioratingCount) {
        overallStatus = "improving";
      } else if (deterioratingCount > improvingCount) {
        overallStatus = "deteriorating";
      }

      let statusSummary = "";
      switch (cat) {
        case "growth":
          statusSummary =
            overallStatus === "improving"
              ? "Growth momentum is solid with consumer spending and GDP trending above baseline."
              : overallStatus === "deteriorating"
              ? "Growth is decelerating as manufacturing and consumer spending moderate."
              : "Growth is expanding at a steady, sustainable trend pace.";
          break;
        case "inflation":
          statusSummary =
            overallStatus === "improving"
              ? "Disinflation remains on track, easing pressure for restrictive policy."
              : overallStatus === "deteriorating"
              ? "Inflation readings indicate persistent cost pressures in services or energy."
              : "Inflation is stable, moving gradually toward the Fed's 2.0% objective.";
          break;
        case "labor":
          statusSummary =
            overallStatus === "improving"
              ? "Labor market is solid with healthy hiring and very low initial claims."
              : overallStatus === "deteriorating"
              ? "Labor demand is softening with unemployment rate edging upward."
              : "Labor market is balanced between job openings and workforce supply.";
          break;
        case "policy":
          statusSummary =
            overallStatus === "improving"
              ? "Monetary policy easing expectations are broadening with curve normalization."
              : overallStatus === "deteriorating"
              ? "Policy remains tight with elevated real rates exerting braking force."
              : "Policy stance is restrictive but transitioning toward neutral.";
          break;
        case "financial_conditions":
          statusSummary =
            overallStatus === "improving"
              ? "Financial conditions are accommodative with tight credit spreads and low VIX."
              : overallStatus === "deteriorating"
              ? "Conditions are tightening with widening credit spreads and equity volatility."
              : "Financial conditions are balanced and supportive of capital flow.";
          break;
      }

      panels[cat] = {
        category: cat,
        title: cfg.title,
        question: cfg.question,
        overallStatus,
        statusSummary,
        metrics: panelMetrics,
      };
    }

    // Calculate regime scores & classification
    const scores = calculateRegimeScores(metricsMap);
    const regime = classifyRegime(scores, metricsMap);

    const isMockData = summariesArray.some((m) => m?.isMockData);

    const dashboardData: DashboardResponse = {
      regime,
      panels,
      lastUpdated: new Date().toISOString(),
      isMockData,
    };

    // Zod validation check
    const validation = dashboardResponseSchema.safeParse(dashboardData);
    if (!validation.success) {
      console.warn("Dashboard Zod validation warning:", validation.error.format());
    }

    return NextResponse.json<ApiResponse<DashboardResponse>>(
      {
        success: true,
        data: dashboardData,
        metadata: {
          timestamp: dashboardData.lastUpdated,
          isMock: isMockData,
          count: Object.keys(metricsMap).length,
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

    console.error("Dashboard API route error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate dashboard payload",
      },
      { status: 500 }
    );
  }
}
