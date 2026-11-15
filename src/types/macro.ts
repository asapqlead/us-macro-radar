import { FredFetchOptions, FredObservationPoint } from "./fred";

export type MacroCategory =
  | "growth"
  | "inflation"
  | "labor"
  | "policy"
  | "financial_conditions";

export type MetricStatus = "improving" | "stable" | "deteriorating";

export type MacroRegimeType =
  | "goldilocks"
  | "reflation"
  | "stagflation"
  | "disinflationary_slowdown";

export type RegimeConfidenceLevel = "High" | "Medium" | "Low";

export interface MacroSeriesConfig {
  id: string;
  name: string;
  shortName: string;
  category: MacroCategory;
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  units: string;
  defaultFredUnits?: FredFetchOptions["units"];
  fredFrequency?: FredFetchOptions["frequency"];
  description: string;
  source: string;
  benchmark?: number;
  isInversionWarning?: boolean;
  goodDirection?: "up" | "down" | "neutral";
  precision?: number;
  importance?: "High" | "Medium" | "Low";
  chartType?: "area" | "line" | "bar";
  interpretationTemplate?: string;
}

export interface MetricSummary {
  config: MacroSeriesConfig;
  seriesId: string;
  name: string;
  category: MacroCategory;
  latestValue: number | null;
  latestDate: string;
  priorValue: number | null;
  priorDate: string;
  changePeriod: number | null;
  changePeriodPercent: number | null;
  changeYoY: number | null;
  sparkline: FredObservationPoint[];
  history: FredObservationPoint[];
  status: MetricStatus;
  interpretation: string;
  releaseDate: string;
  gdpEstimateType?: "Advance" | "Second" | "Third" | "Final";
  isMockData: boolean;
  lastUpdated: string;
}

export interface PanelData {
  category: MacroCategory;
  title: string;
  question: string;
  overallStatus: MetricStatus;
  statusSummary: string;
  metrics: MetricSummary[];
}

export interface RegimeSupportingIndicator {
  name: string;
  seriesId: string;
  latestValue: string;
  signal: "supporting" | "contradictory";
  detail: string;
}

export interface AssetClassImplication {
  asset: "Equities" | "Bonds" | "US Dollar" | "Commodities" | "Rate-Sensitive Sectors";
  stance: "Bullish" | "Neutral / Selective" | "Bearish" | "Defensive";
  rationale: string;
  topSectors?: string[];
}

export interface RegimeChecklistItem {
  trigger: string;
  likelihood: "Low" | "Medium" | "High";
  impactRegime: MacroRegimeType;
  description: string;
}

export interface RegimeClassification {
  regime: MacroRegimeType;
  title: string;
  tagline: string;
  confidenceScore: number; // 0 - 100
  confidenceLevel: RegimeConfidenceLevel;
  growthState: "Accelerating" | "Slowing" | "Trend";
  inflationState: "Rising" | "Falling" | "Sticky";
  marketAssessment: string;
  whatChanged: string;
  supportingIndicators: RegimeSupportingIndicator[];
  contradictoryIndicators: RegimeSupportingIndicator[];
  assetImplications: AssetClassImplication[];
  checklist: RegimeChecklistItem[];
  lastUpdated: string;
}

export interface DashboardResponse {
  regime: RegimeClassification;
  panels: Record<MacroCategory, PanelData>;
  lastUpdated: string;
  isMockData: boolean;
}

export interface ScenarioDetail {
  outcome: string;
  fedPolicy: string;
  yields: string;
  equities: string;
  dollar: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  seriesId?: string;
  category: MacroCategory;
  releaseDate: string; // ISO format or YYYY-MM-DD
  releaseTime: string; // HH:mm:ss ET
  period: string; // e.g., "October 2026"
  consensus: string;
  previous: string;
  actual?: string;
  importance: "High" | "Medium" | "Low";
  affectedAssets: ("Equities" | "Treasuries" | "US Dollar" | "Commodities")[];
  isMajor: boolean;
  bullishScenario: ScenarioDetail;
  baseScenario: ScenarioDetail;
  bearishScenario: ScenarioDetail;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  lastUpdated: string;
}

export interface WeeklyBrief {
  weekOf: string;
  macroRegime: {
    type: MacroRegimeType;
    title: string;
    assessment: string;
  };
  whatHappenedLastWeek: {
    title: string;
    impact: string;
    bulletPoints: string[];
  }[];
  whatMattersThisWeek: {
    theme: string;
    keyDriver: string;
    bulletPoints: string[];
  }[];
  topUpcomingReleases: CalendarEvent[];
  marketScenarios: {
    baseCase: { probability: number; thesis: string; allocationTip: string };
    bullishCase: { probability: number; thesis: string; allocationTip: string };
    bearishCase: { probability: number; thesis: string; allocationTip: string };
  };
  keyRisks: string[];
  conclusion: string;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    cached?: boolean;
    timestamp: string;
    isMock?: boolean;
    count?: number;
  };
}
