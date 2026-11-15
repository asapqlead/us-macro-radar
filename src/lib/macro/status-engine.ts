import { MacroSeriesConfig, MetricStatus } from "@/types/macro";

/**
 * Determines whether a metric's latest reading is improving, stable, or deteriorating
 * based on its configuration, change relative to prior period, and historical benchmark.
 */
export function evaluateMetricStatus(
  config: MacroSeriesConfig,
  latestValue: number | null,
  priorValue: number | null,
  changePeriod: number | null
): MetricStatus {
  if (latestValue === null) return "stable";

  // Case 1: Inversion warning (Yield curve spreads T10Y2Y, T10Y3M)
  if (config.isInversionWarning) {
    if (latestValue < 0) return "deteriorating";
    if (latestValue >= 0 && (changePeriod ?? 0) > 0) return "improving";
    return "stable";
  }

  // Case 2: VIX and Credit Spreads
  if (config.id === "VIXCLS") {
    if (latestValue > 25) return "deteriorating";
    if (latestValue < 18) return "improving";
    return "stable";
  }

  if (config.id === "BAMLH0A0HYM2") {
    if (latestValue > 4.5) return "deteriorating";
    if (latestValue < 3.5) return "improving";
    return "stable";
  }

  // Case 3: NFCI Financial Conditions (below 0 is loose/supportive, above 0 is tight)
  if (config.id === "NFCI") {
    if (latestValue > 0) return "deteriorating";
    if (latestValue < -0.3) return "improving";
    return "stable";
  }

  // Case 4: Inflation metrics (benchmark ~ 2.0%)
  if (config.category === "inflation") {
    if (latestValue <= 2.3 && (changePeriod ?? 0) <= 0) return "improving";
    if (latestValue > 3.0 && (changePeriod ?? 0) > 0) return "deteriorating";
    if ((changePeriod ?? 0) < -0.15) return "improving";
    if ((changePeriod ?? 0) > 0.15) return "deteriorating";
    return "stable";
  }

  // Case 5: Standard goodDirection ("up" or "down")
  if (changePeriod === null || Math.abs(changePeriod) < 0.001) {
    return "stable";
  }

  const delta = changePeriod;
  const tolerance = (Math.abs(latestValue) * 0.01) || 0.05;

  if (Math.abs(delta) <= tolerance) {
    return "stable";
  }

  if (config.goodDirection === "up") {
    return delta > 0 ? "improving" : "deteriorating";
  }

  if (config.goodDirection === "down") {
    return delta < 0 ? "improving" : "deteriorating";
  }

  return "stable";
}

/**
 * Generates plain-English interpretation for a metric reading.
 */
export function generateMetricInterpretation(
  config: MacroSeriesConfig,
  latestValue: number | null,
  priorValue: number | null,
  status: MetricStatus
): string {
  if (latestValue === null) {
    return "Awaiting latest official release from reporting agency.";
  }

  switch (config.id) {
    case "GDPC1":
      return latestValue > (priorValue ?? 0)
        ? "Economic output expanded, sustaining baseline macroeconomic momentum."
        : "Output contracted or decelerated relative to previous quarter.";

    case "RSAFS":
      return status === "improving"
        ? "Consumer spending remains resilient, supporting retail earnings and GDP."
        : "Consumer demand showed signs of fatigue or cautious household spending.";

    case "INDPRO":
      return status === "improving"
        ? "Industrial and factory capacity output accelerated, signaling business investment."
        : "Manufacturing production softened amid cautious inventory restocking.";

    case "WEI":
      return latestValue > 2.0
        ? "High-frequency weekly index tracks above-trend real economic growth."
        : "Weekly composite signals below-trend domestic expansion.";

    case "CPIAUCSL":
      return status === "improving"
        ? "Headline inflation continues its disinflationary glide toward target."
        : "Headline CPI rose, reflecting persistent energy or shelter cost pressure.";

    case "CPILFESL":
      return status === "improving"
        ? "Core disinflation intact; reduces pressure for further monetary tightening."
        : "Sticky core pressures indicate persistent underlying service price inflation.";

    case "PCEPI":
    case "PCEPILFE":
      return latestValue <= 2.5
        ? "Nearing the FOMC's 2.0% statutory inflation objective."
        : "Running above the Fed's 2% target, keeping rate cut cadence gradual.";

    case "T5YIE":
      return latestValue <= 2.3
        ? "5-year market inflation expectations remain solidly anchored."
        : "Market pricing in higher medium-term inflation risk premiums.";

    case "UNRATE":
      return latestValue <= 4.2
        ? "Unemployment remains in healthy historical territory near full employment."
        : "Unemployment ticking upward, signaling incremental labor market softening.";

    case "PAYEMS":
      return (latestValue ?? 0) > 150
        ? "Solid nonfarm job additions absorbing new entrants to the labor force."
        : "Job growth moderating toward long-run population replacement pace.";

    case "ICSA":
      return (latestValue ?? 0) < 235
        ? "Sub-235k claims confirm corporate layoff rates remain historically low."
        : "Elevated filings indicate rising initial corporate headcount reductions.";

    case "JTSJOL":
      return "Job openings reflect balanced labor demand vs available jobseekers.";

    case "CES0500000003":
      return (latestValue ?? 0) <= 3.8
        ? "Wage growth decelerating toward pace compatible with 2% inflation target."
        : "Elevated wage growth exerting cost push pressure on services prices.";

    case "DFF":
    case "DFEDTARU":
      return "Reflects current restrictive policy stance to ensure price stability.";

    case "DGS2":
      return "Reflects market expectations for FOMC policy trajectory over 2 years.";

    case "DGS10":
      return "10-Year yield balances long-run growth potential and fiscal supply.";

    case "T10Y2Y":
      return latestValue >= 0
        ? "Yield curve is positively sloped, reflecting normalization from inversion."
        : "Yield curve remains inverted, signaling sustained recession caution.";

    case "T10Y3M":
      return latestValue >= 0
        ? "Short-end curve positive, indicating reduced near-term recession odds."
        : "Negative spread signals Fed policy rate remains elevated above long-term neutral.";

    case "NFCI":
      return latestValue < 0
        ? "Broad financial conditions are looser than historical averages."
        : "Financial conditions are tighter than average, restricting credit flow.";

    case "BAMLH0A0HYM2":
      return latestValue < 3.5
        ? "Tight high-yield credit spreads signal high corporate debt confidence."
        : "Widening junk bond spreads indicate rising credit risk discrimination.";

    case "DTWEXBGS":
      return "Dollar index reflects relative U.S. growth and interest rate differential.";

    case "VIXCLS":
      return latestValue < 18
        ? "Low implied equity volatility signals benign near-term market sentiment."
        : "Elevated VIX indicates hedging demand and market uncertainty.";

    default:
      return status === "improving"
        ? "Indicator moving in a favorable direction for macro stability."
        : status === "deteriorating"
        ? "Indicator showing signs of cyclical strain or adverse momentum."
        : "Metric is holding steady within recent seasonal expectations.";
  }
}

/**
 * Assigns GDP release estimate type (Advance, Second, Third) based on release timing.
 */
export function getGdpEstimateType(
  dateString: string
): "Advance" | "Second" | "Third" | "Final" {
  if (!dateString) return "Advance";
  const month = parseInt(dateString.split("-")[1], 10);
  if ([1, 4, 7, 10].includes(month)) return "Advance";
  if ([2, 5, 8, 11].includes(month)) return "Second";
  if ([3, 6, 9, 12].includes(month)) return "Third";
  return "Final";
}
