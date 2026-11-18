import { describe, it, expect } from "vitest";
import {
  calculateRealYield,
  calculateCommoditiesBarometer,
  calculateEquitiesBarometer,
  createRealYieldMetricSummary,
  getSeriesForLens,
} from "@/lib/macro/trader-signals";
import { MetricSummary } from "@/types/macro";

function createMockMetric(
  seriesId: string,
  latestValue: number,
  priorValue: number,
  category: any = "policy"
): MetricSummary {
  return {
    seriesId,
    name: seriesId,
    category,
    latestValue,
    latestDate: "2025-03-01",
    priorValue,
    priorDate: "2025-02-01",
    changePeriod: latestValue - priorValue,
    changePeriodPercent: null,
    changeYoY: null,
    sparkline: [
      { date: "2025-02-01", value: priorValue },
      { date: "2025-03-01", value: latestValue },
    ],
    history: [
      { date: "2025-01-01", value: priorValue - 0.1 },
      { date: "2025-02-01", value: priorValue },
      { date: "2025-03-01", value: latestValue },
    ],
    status: "stable",
    interpretation: "Mock interpretation",
    releaseDate: "2025-03-01",
    isMockData: true,
    lastUpdated: "2026-11-16T00:00:00Z",
    config: {
      id: seriesId,
      name: seriesId,
      shortName: seriesId,
      category,
      frequency: "Daily",
      units: "%",
      description: "Test series",
      source: "Test",
    },
  };
}

describe("Trader Signals & Derived Real Yield Engine", () => {
  it("should calculate 10Y Real Yield as DGS10 minus T5YIE", () => {
    const mockMap: Record<string, MetricSummary> = {
      DGS10: createMockMetric("DGS10", 4.25, 4.35),
      T5YIE: createMockMetric("T5YIE", 2.30, 2.32),
    };

    const realYield = calculateRealYield(mockMap);
    expect(realYield).not.toBeNull();
    expect(realYield?.nominalRate).toBe(4.25);
    expect(realYield?.breakevenRate).toBe(2.3);
    expect(realYield?.realYield).toBe(1.95);
    expect(realYield?.priorRealYield).toBe(2.03);
    expect(realYield?.delta).toBe(-0.08);
  });

  it("should produce a valid MetricSummary for Real Yield", () => {
    const mockMap: Record<string, MetricSummary> = {
      DGS10: createMockMetric("DGS10", 3.8, 4.0),
      T5YIE: createMockMetric("T5YIE", 2.4, 2.4),
    };

    const realYield = calculateRealYield(mockMap)!;
    const summary = createRealYieldMetricSummary(realYield, "2026-11-16T00:00:00Z");

    expect(summary.seriesId).toBe("REAL_YIELD_10Y");
    expect(summary.latestValue).toBe(1.4);
    expect(summary.status).toBe("improving");
    expect(summary.config.id).toBe("REAL_YIELD_10Y");
    expect(summary.history.length).toBeGreaterThan(0);
  });

  it("should calculate Commodities & Real Assets barometer", () => {
    const mockMap: Record<string, MetricSummary> = {
      DGS10: createMockMetric("DGS10", 3.6, 3.8),
      T5YIE: createMockMetric("T5YIE", 2.3, 2.3),
      DTWEXBGS: createMockMetric("DTWEXBGS", 119.5, 121.0, "financial_conditions"),
      BAMLH0A0HYM2: createMockMetric("BAMLH0A0HYM2", 3.2, 3.3, "financial_conditions"),
      VIXCLS: createMockMetric("VIXCLS", 14.5, 15.0, "financial_conditions"),
    };

    const barometer = calculateCommoditiesBarometer(mockMap);
    expect(barometer.stance).toBe("Bullish Tailwind");
    expect(barometer.score).toBeGreaterThan(20);
    expect(barometer.drivers.realYields.status).toBe("bullish");
  });

  it("should calculate Equities & Risk Assets barometer", () => {
    const mockMap: Record<string, MetricSummary> = {
      NFCI: createMockMetric("NFCI", -0.52, -0.48, "financial_conditions"),
      BAMLH0A0HYM2: createMockMetric("BAMLH0A0HYM2", 3.1, 3.2, "financial_conditions"),
      VIXCLS: createMockMetric("VIXCLS", 13.8, 14.2, "financial_conditions"),
      DGS10: createMockMetric("DGS10", 4.1, 4.2),
      RSAFS: createMockMetric("RSAFS", 2.8, 2.5, "growth"),
    };

    const barometer = calculateEquitiesBarometer(mockMap);
    expect(barometer.stance).toBe("Risk-On (Multiple Expansion)");
    expect(barometer.score).toBeGreaterThan(25);
    expect(barometer.drivers.liquidity.status).toBe("bullish");
  });

  it("should filter series correctly for asset lenses", () => {
    const allIds = ["REAL_YIELD_10Y", "DGS10", "T5YIE", "DTWEXBGS", "NFCI", "INDPRO", "RSAFS"];
    
    const all = getSeriesForLens("all", allIds);
    expect(all).toEqual(allIds);

    const commodities = getSeriesForLens("commodities", allIds);
    expect(commodities).toContain("REAL_YIELD_10Y");
    expect(commodities).toContain("DGS10");
    expect(commodities).toContain("DTWEXBGS");
    expect(commodities).not.toContain("NFCI");

    const equities = getSeriesForLens("equities", allIds);
    expect(equities).toContain("NFCI");
    expect(equities).toContain("DGS10");
    expect(equities).toContain("RSAFS");
    expect(equities).not.toContain("DTWEXBGS");
  });
});
