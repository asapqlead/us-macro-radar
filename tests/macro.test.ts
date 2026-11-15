import { describe, it, expect } from "vitest";
import {
  calculateRegimeScores,
  classifyRegime,
} from "@/lib/macro/regime-engine";
import {
  evaluateMetricStatus,
  generateMetricInterpretation,
  getGdpEstimateType,
} from "@/lib/macro/status-engine";
import { formatMetricValue } from "@/lib/utils";
import { MacroSeriesConfig, MetricSummary } from "@/types/macro";

describe("Regime Classification Engine", () => {
  it("should classify Goldilocks when growth is positive and inflation is negative/falling", () => {
    const scores = { growthScore: 35, inflationScore: -25 };
    const regime = classifyRegime(scores, {});

    expect(regime.regime).toBe("goldilocks");
    expect(regime.title).toBe("Goldilocks Regime");
    expect(regime.confidenceScore).toBeGreaterThanOrEqual(40);
    expect(regime.confidenceScore).toBeLessThanOrEqual(100);
    expect(regime.assetImplications.length).toBeGreaterThan(0);
    expect(regime.assetImplications.find((a) => a.asset === "Equities")?.stance).toBe("Bullish");
  });

  it("should classify Reflation when both growth and inflation are accelerating", () => {
    const scores = { growthScore: 40, inflationScore: 30 };
    const regime = classifyRegime(scores, {});

    expect(regime.regime).toBe("reflation");
    expect(regime.title).toBe("Reflation Regime");
    expect(regime.assetImplications.find((a) => a.asset === "Commodities")?.stance).toBe("Bullish");
    expect(regime.assetImplications.find((a) => a.asset === "Bonds")?.stance).toBe("Bearish");
  });

  it("should classify Stagflation when growth is contracting and inflation is rising", () => {
    const scores = { growthScore: -30, inflationScore: 35 };
    const regime = classifyRegime(scores, {});

    expect(regime.regime).toBe("stagflation");
    expect(regime.title).toBe("Stagflation Regime");
    expect(regime.assetImplications.find((a) => a.asset === "Equities")?.stance).toBe("Bearish");
    expect(regime.assetImplications.find((a) => a.asset === "Bonds")?.stance).toBe("Bearish");
  });

  it("should classify Disinflationary Slowdown when both growth and inflation are decelerating", () => {
    const scores = { growthScore: -25, inflationScore: -30 };
    const regime = classifyRegime(scores, {});

    expect(regime.regime).toBe("disinflationary_slowdown");
    expect(regime.title).toBe("Disinflationary Slowdown");
    expect(regime.assetImplications.find((a) => a.asset === "Bonds")?.stance).toBe("Bullish");
  });

  it("should calculate continuous scores dynamically from metric observations", () => {
    const mockMap: Record<string, MetricSummary> = {
      GDPC1: {
        config: {} as any,
        seriesId: "GDPC1",
        name: "Real GDP",
        category: "growth",
        latestValue: 23000,
        latestDate: "2025-01-01",
        priorValue: 22800,
        priorDate: "2024-10-01",
        changePeriod: 200,
        changePeriodPercent: 0.88,
        changeYoY: 2.8,
        sparkline: [],
        history: [],
        status: "improving",
        interpretation: "Solid expansion",
        releaseDate: "2025-01-01",
        isMockData: true,
        lastUpdated: "2026-11-15T00:00:00Z",
      },
      CPIAUCSL: {
        config: {} as any,
        seriesId: "CPIAUCSL",
        name: "CPI YoY",
        category: "inflation",
        latestValue: 2.3,
        latestDate: "2025-03-01",
        priorValue: 2.4,
        priorDate: "2025-02-01",
        changePeriod: -0.1,
        changePeriodPercent: -4.1,
        changeYoY: null,
        sparkline: [],
        history: [],
        status: "improving",
        interpretation: "Cooling inflation",
        releaseDate: "2025-03-01",
        isMockData: true,
        lastUpdated: "2026-11-15T00:00:00Z",
      },
    };

    const scores = calculateRegimeScores(mockMap);
    expect(scores.growthScore).toBeGreaterThan(0);
    expect(scores.inflationScore).toBeLessThan(0);
  });
});

describe("Status Engine & Data Transformation Logic", () => {
  const yieldSpreadConfig: MacroSeriesConfig = {
    id: "T10Y2Y",
    name: "10Y - 2Y Spread",
    shortName: "10Y-2Y",
    category: "policy",
    frequency: "Daily",
    units: "%",
    description: "Yield spread",
    source: "FRED",
    benchmark: 0.0,
    isInversionWarning: true,
    goodDirection: "up",
  };

  it("should flag inverted yield curve as deteriorating", () => {
    const status = evaluateMetricStatus(yieldSpreadConfig, -0.35, -0.30, -0.05);
    expect(status).toBe("deteriorating");
  });

  it("should flag positive un-inverting yield curve as improving", () => {
    const status = evaluateMetricStatus(yieldSpreadConfig, 0.25, 0.15, 0.10);
    expect(status).toBe("improving");
  });

  it("should evaluate NFCI financial conditions relative to 0", () => {
    const nfciConfig: MacroSeriesConfig = {
      id: "NFCI",
      name: "Chicago Fed NFCI",
      shortName: "NFCI",
      category: "financial_conditions",
      frequency: "Weekly",
      units: "Index",
      description: "Financial conditions",
      source: "Chicago Fed",
      goodDirection: "down",
    };

    expect(evaluateMetricStatus(nfciConfig, -0.52, -0.48, -0.04)).toBe("improving");
    expect(evaluateMetricStatus(nfciConfig, 0.15, 0.10, 0.05)).toBe("deteriorating");
  });

  it("should evaluate VIX equity volatility correctly", () => {
    const vixConfig: MacroSeriesConfig = {
      id: "VIXCLS",
      name: "VIX",
      shortName: "VIX",
      category: "financial_conditions",
      frequency: "Daily",
      units: "Index",
      description: "Volatility",
      source: "CBOE",
      goodDirection: "down",
    };

    expect(evaluateMetricStatus(vixConfig, 14.5, 15.0, -0.5)).toBe("improving");
    expect(evaluateMetricStatus(vixConfig, 28.0, 22.0, 6.0)).toBe("deteriorating");
  });

  it("should correctly classify GDP estimate types based on release calendar month", () => {
    expect(getGdpEstimateType("2024-01-30")).toBe("Advance");
    expect(getGdpEstimateType("2024-02-28")).toBe("Second");
    expect(getGdpEstimateType("2024-03-27")).toBe("Third");
  });

  it("should generate clear plain-English interpretations", () => {
    const text = generateMetricInterpretation(
      yieldSpreadConfig,
      0.31,
      0.28,
      "improving"
    );
    expect(text).toContain("positively sloped");
  });
});

describe("Format Utilities", () => {
  it("should format percentages, large numbers, and handle nulls safely", () => {
    expect(formatMetricValue(3.45, "%", 1)).toBe("3.5%");
    expect(formatMetricValue(1500000, "Index", 2)).toBe("1.50M");
    expect(formatMetricValue(22500, "k", 0)).toBe("22,500");
    expect(formatMetricValue(null)).toBe("N/A");
    expect(formatMetricValue(undefined)).toBe("N/A");
  });
});
