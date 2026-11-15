import {
  DEFAULT_REVALIDATE_SECONDS,
  FRED_API_BASE_URL,
  getFredApiKey,
  isFredConfigured,
} from "./env";
import { getMockObservations } from "./mock-data";
import { getSeriesConfig } from "@/config/fred-series";
import {
  evaluateMetricStatus,
  generateMetricInterpretation,
  getGdpEstimateType,
} from "@/lib/macro/status-engine";
import {
  FredFetchOptions,
  FredObservationPoint,
  FredObservationsResponse,
  FredSeriesInfo,
  FredSeriesResponse,
} from "@/types/fred";
import { MetricSummary } from "@/types/macro";

export class FredApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "FredApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Fetch raw observations from St. Louis Fed FRED API with Next.js data cache.
 */
export async function fetchFredObservations(
  seriesId: string,
  options: FredFetchOptions = {}
): Promise<{ observations: FredObservationPoint[]; isMock: boolean }> {
  const apiKey = getFredApiKey();

  // If no API key configured, use deterministic realistic mock data
  if (!isFredConfigured() || !apiKey) {
    const mockData = getMockObservations(seriesId);
    return {
      observations: mockData,
      isMock: true,
    };
  }

  const config = getSeriesConfig(seriesId);
  const url = new URL(`${FRED_API_BASE_URL}/series/observations`);

  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");

  // Determine units (use provided, or config default, or default to lin)
  const units = options.units || config?.defaultFredUnits || "lin";
  url.searchParams.set("units", units);

  if (options.frequency || config?.fredFrequency) {
    url.searchParams.set(
      "frequency",
      options.frequency || config?.fredFrequency || "m"
    );
  }

  if (options.observation_start) {
    url.searchParams.set("observation_start", options.observation_start);
  }

  if (options.observation_end) {
    url.searchParams.set("observation_end", options.observation_end);
  }

  url.searchParams.set("sort_order", options.sort_order || "asc");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson: { error_message?: string; error_code?: number } = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // non-JSON response
      }

      throw new FredApiError(
        errorJson.error_message || `FRED API error: ${res.statusText}`,
        res.status,
        errorJson.error_code?.toString()
      );
    }

    const data: FredObservationsResponse = await res.json();

    // Sanitize observations (filter out "." missing values and parse floats)
    const validPoints: FredObservationPoint[] = (data.observations || [])
      .filter((obs) => obs.value && obs.value !== ".")
      .map((obs) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }))
      .filter((pt) => !isNaN(pt.value));

    return {
      observations: validPoints,
      isMock: false,
    };
  } catch (error) {
    if (error instanceof FredApiError) {
      throw error;
    }
    throw new FredApiError(
      `Failed to fetch FRED series ${seriesId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Fetch series metadata from St. Louis Fed FRED API.
 */
export async function fetchFredSeriesInfo(
  seriesId: string
): Promise<FredSeriesInfo | null> {
  const apiKey = getFredApiKey();
  if (!isFredConfigured() || !apiKey) {
    return null;
  }

  const url = new URL(`${FRED_API_BASE_URL}/series`);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS * 24 },
    });

    if (!res.ok) {
      return null;
    }

    const data: FredSeriesResponse = await res.json();
    return data.seriess?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * High-level helper returning processed metric summary, delta calculations,
 * YoY shifts, status evaluation, and plain-English interpretation.
 */
export async function getMetricSummary(
  seriesId: string,
  options: FredFetchOptions = {}
): Promise<MetricSummary> {
  const config = getSeriesConfig(seriesId) || {
    id: seriesId,
    name: seriesId,
    shortName: seriesId,
    category: "growth" as const,
    frequency: "Monthly" as const,
    units: "",
    description: "Macroeconomic Series",
    source: "Federal Reserve Economic Data (FRED)",
    precision: 2,
    importance: "Medium" as const,
  };

  const { observations, isMock } = await fetchFredObservations(seriesId, options);

  const totalPoints = observations.length;
  const latestObs = totalPoints > 0 ? observations[totalPoints - 1] : null;
  const priorObs = totalPoints > 1 ? observations[totalPoints - 2] : null;

  const latestValue = latestObs ? latestObs.value : null;
  const latestDate = latestObs ? latestObs.date : "";

  const priorValue = priorObs ? priorObs.value : null;
  const priorDate = priorObs ? priorObs.date : "";

  let changePeriod: number | null = null;
  let changePeriodPercent: number | null = null;

  if (latestValue !== null && priorValue !== null) {
    changePeriod = Number((latestValue - priorValue).toFixed(4));
    if (priorValue !== 0) {
      changePeriodPercent = Number(
        (((latestValue - priorValue) / Math.abs(priorValue)) * 100).toFixed(2)
      );
    }
  }

  // Calculate Year-over-Year change (12 months or 4 quarters back)
  let changeYoY: number | null = null;
  const lookbackPeriod = config.frequency === "Quarterly" ? 4 : config.frequency === "Weekly" ? 52 : 12;
  if (totalPoints > lookbackPeriod && latestValue !== null) {
    const yoyObs = observations[totalPoints - 1 - lookbackPeriod];
    if (yoyObs && yoyObs.value !== 0) {
      changeYoY = Number(
        (((latestValue - yoyObs.value) / Math.abs(yoyObs.value)) * 100).toFixed(2)
      );
    }
  }

  // Status and interpretation
  const status = evaluateMetricStatus(config, latestValue, priorValue, changePeriod);
  const interpretation = generateMetricInterpretation(
    config,
    latestValue,
    priorValue,
    status
  );

  // Sparkline data: 12-16 recent observations
  const sparkline = observations.slice(-16);

  // GDP Estimate label
  const gdpEstimateType =
    config.id === "GDPC1" ? getGdpEstimateType(latestDate) : undefined;

  return {
    config,
    seriesId: config.id,
    name: config.shortName || config.name,
    category: config.category,
    latestValue,
    latestDate,
    priorValue,
    priorDate,
    changePeriod,
    changePeriodPercent,
    changeYoY,
    sparkline,
    history: observations,
    status,
    interpretation,
    releaseDate: latestDate,
    gdpEstimateType,
    isMockData: isMock,
    lastUpdated: new Date().toISOString(),
  };
}
