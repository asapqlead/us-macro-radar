import { z } from "zod";

export const fredObservationPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const macroCategorySchema = z.enum([
  "growth",
  "inflation",
  "labor",
  "policy",
  "financial_conditions",
]);

export const metricStatusSchema = z.enum([
  "improving",
  "stable",
  "deteriorating",
]);

export const macroRegimeTypeSchema = z.enum([
  "goldilocks",
  "reflation",
  "stagflation",
  "disinflationary_slowdown",
]);

export const regimeConfidenceLevelSchema = z.enum(["High", "Medium", "Low"]);

export const macroSeriesConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  category: macroCategorySchema,
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly"]),
  units: z.string(),
  description: z.string(),
  source: z.string(),
  benchmark: z.number().optional(),
  isInversionWarning: z.boolean().optional(),
  goodDirection: z.enum(["up", "down", "neutral"]).optional(),
  precision: z.number().optional(),
  importance: z.enum(["High", "Medium", "Low"]).optional(),
  chartType: z.enum(["area", "line", "bar"]).optional(),
});

export const metricSummarySchema = z.object({
  config: macroSeriesConfigSchema,
  seriesId: z.string(),
  name: z.string(),
  category: macroCategorySchema,
  latestValue: z.number().nullable(),
  latestDate: z.string(),
  priorValue: z.number().nullable(),
  priorDate: z.string(),
  changePeriod: z.number().nullable(),
  changePeriodPercent: z.number().nullable(),
  changeYoY: z.number().nullable(),
  sparkline: z.array(fredObservationPointSchema),
  history: z.array(fredObservationPointSchema),
  status: metricStatusSchema,
  interpretation: z.string(),
  releaseDate: z.string(),
  gdpEstimateType: z.enum(["Advance", "Second", "Third", "Final"]).optional(),
  isMockData: z.boolean(),
  lastUpdated: z.string(),
});

export const panelDataSchema = z.object({
  category: macroCategorySchema,
  title: z.string(),
  question: z.string(),
  overallStatus: metricStatusSchema,
  statusSummary: z.string(),
  metrics: z.array(metricSummarySchema),
});

export const regimeSupportingIndicatorSchema = z.object({
  name: z.string(),
  seriesId: z.string(),
  latestValue: z.string(),
  signal: z.enum(["supporting", "contradictory"]),
  detail: z.string(),
});

export const assetClassImplicationSchema = z.object({
  asset: z.enum([
    "Equities",
    "Bonds",
    "US Dollar",
    "Commodities",
    "Rate-Sensitive Sectors",
  ]),
  stance: z.enum(["Bullish", "Neutral / Selective", "Bearish", "Defensive"]),
  rationale: z.string(),
  topSectors: z.array(z.string()).optional(),
});

export const regimeChecklistItemSchema = z.object({
  trigger: z.string(),
  likelihood: z.enum(["Low", "Medium", "High"]),
  impactRegime: macroRegimeTypeSchema,
  description: z.string(),
});

export const regimeClassificationSchema = z.object({
  regime: macroRegimeTypeSchema,
  title: z.string(),
  tagline: z.string(),
  confidenceScore: z.number().min(0).max(100),
  confidenceLevel: regimeConfidenceLevelSchema,
  growthState: z.enum(["Accelerating", "Slowing", "Trend"]),
  inflationState: z.enum(["Rising", "Falling", "Sticky"]),
  marketAssessment: z.string(),
  whatChanged: z.string(),
  supportingIndicators: z.array(regimeSupportingIndicatorSchema),
  contradictoryIndicators: z.array(regimeSupportingIndicatorSchema),
  assetImplications: z.array(assetClassImplicationSchema),
  checklist: z.array(regimeChecklistItemSchema),
  lastUpdated: z.string(),
});

export const dashboardResponseSchema = z.object({
  regime: regimeClassificationSchema,
  panels: z.record(macroCategorySchema, panelDataSchema),
  lastUpdated: z.string(),
  isMockData: z.boolean(),
});

export const scenarioDetailSchema = z.object({
  outcome: z.string(),
  fedPolicy: z.string(),
  yields: z.string(),
  equities: z.string(),
  dollar: z.string(),
});

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  seriesId: z.string().optional(),
  category: macroCategorySchema,
  releaseDate: z.string(),
  releaseTime: z.string(),
  period: z.string(),
  consensus: z.string(),
  previous: z.string(),
  actual: z.string().optional(),
  importance: z.enum(["High", "Medium", "Low"]),
  affectedAssets: z.array(
    z.enum(["Equities", "Treasuries", "US Dollar", "Commodities"])
  ),
  isMajor: z.boolean(),
  bullishScenario: scenarioDetailSchema,
  baseScenario: scenarioDetailSchema,
  bearishScenario: scenarioDetailSchema,
});

export const calendarResponseSchema = z.object({
  events: z.array(calendarEventSchema),
  lastUpdated: z.string(),
});
