import { FredObservationPoint } from "@/types/fred";
import { MetricStatus, MetricSummary } from "@/types/macro";

export type TraderLens = "all" | "equities" | "commodities";

export interface RealYieldData {
  nominalRate: number;
  breakevenRate: number;
  realYield: number;
  priorRealYield: number | null;
  delta: number | null;
  status: MetricStatus;
  stance: "Bullish Tailwind" | "Neutral / Rangebound" | "Bearish Headwind";
  interpretation: string;
  history: FredObservationPoint[];
}

export interface CommoditiesBarometer {
  score: number; // -100 (hostile for gold/real assets) to +100 (optimal tailwind)
  stance: "Bullish Tailwind" | "Neutral / Rangebound" | "Bearish Headwind";
  realYieldValue: number | null;
  dollarValue: number | null;
  breakevenValue: number | null;
  summary: string;
  drivers: {
    realYields: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string };
    dollar: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string };
    riskHedge: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string };
  };
}

export interface EquitiesBarometer {
  score: number; // -100 (heavy risk-off) to +100 (aggressive risk-on)
  stance: "Risk-On (Multiple Expansion)" | "Selective / Neutral" | "Risk-Off (Defensive)";
  nfciValue: number | null;
  hyOasValue: number | null;
  vixValue: number | null;
  summary: string;
  drivers: {
    liquidity: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string };
    credit: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string };
    volatility: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string };
  };
}

/**
 * Calculates 10-Year Real Treasury Yield (DGS10 nominal minus T5YIE breakeven).
 */
export function calculateRealYield(
  metricsMap: Record<string, MetricSummary>
): RealYieldData | null {
  const dgs10 = metricsMap["DGS10"];
  const t5yie = metricsMap["T5YIE"];

  if (
    !dgs10?.latestValue ||
    !t5yie?.latestValue ||
    typeof dgs10.latestValue !== "number" ||
    typeof t5yie.latestValue !== "number"
  ) {
    return null;
  }

  const nominalRate = dgs10.latestValue;
  const breakevenRate = t5yie.latestValue;
  const realYield = Number((nominalRate - breakevenRate).toFixed(2));

  let priorRealYield: number | null = null;
  let delta: number | null = null;

  if (
    dgs10.priorValue !== null &&
    t5yie.priorValue !== null &&
    typeof dgs10.priorValue === "number" &&
    typeof t5yie.priorValue === "number"
  ) {
    priorRealYield = Number((dgs10.priorValue - t5yie.priorValue).toFixed(2));
    delta = Number((realYield - priorRealYield).toFixed(2));
  }

  // Derive historical real yields by joining on matching dates
  const dgs10History = dgs10.history || [];
  const t5yieMap = new Map((t5yie.history || []).map((pt) => [pt.date, pt.value]));

  const history: FredObservationPoint[] = [];
  for (const pt of dgs10History) {
    const breakeven = t5yieMap.get(pt.date);
    if (breakeven !== undefined) {
      history.push({
        date: pt.date,
        value: Number((pt.value - breakeven).toFixed(2)),
      });
    }
  }

  // Real yields < 1.5% are generally positive/improving for non-yielding commodities
  // Real yields rising > 2.0% are restrictive/deteriorating
  let status: MetricStatus = "stable";
  let stance: "Bullish Tailwind" | "Neutral / Rangebound" | "Bearish Headwind" =
    "Neutral / Rangebound";
  let interpretation = "";

  if (realYield <= 1.5) {
    status = "improving";
    stance = "Bullish Tailwind";
    interpretation =
      "Real yields remain low to moderate, significantly reducing the opportunity cost of holding Gold and precious metals.";
  } else if (realYield > 2.0) {
    status = "deteriorating";
    stance = "Bearish Headwind";
    interpretation =
      "Real yields are deeply restrictive (>2.0%), creating persistent carrying-cost resistance for non-yielding monetary metals.";
  } else {
    status = "stable";
    stance = "Neutral / Rangebound";
    interpretation =
      "Real yields trade in a neutral equilibrium band (1.5% - 2.0%), leaving gold primarily responsive to dollar swings and safe-haven flows.";
  }

  return {
    nominalRate,
    breakevenRate,
    realYield,
    priorRealYield,
    delta,
    status,
    stance,
    interpretation,
    history: history.length > 0 ? history : dgs10History,
  };
}

/**
 * Creates a synthetic MetricSummary representing the 10Y Real Yield.
 */
export function createRealYieldMetricSummary(
  realYieldData: RealYieldData,
  lastUpdated: string
): MetricSummary {
  const sparkline = realYieldData.history.slice(-12);

  return {
    seriesId: "REAL_YIELD_10Y",
    name: "10-Year Real Treasury Yield (Derived)",
    category: "policy",
    latestValue: realYieldData.realYield,
    latestDate: realYieldData.history[realYieldData.history.length - 1]?.date || "Latest",
    priorValue: realYieldData.priorRealYield,
    priorDate: realYieldData.history[realYieldData.history.length - 2]?.date || "Prior",
    changePeriod: realYieldData.delta,
    changePeriodPercent:
      realYieldData.priorRealYield && realYieldData.delta
        ? Number(((realYieldData.delta / Math.abs(realYieldData.priorRealYield)) * 100).toFixed(1))
        : null,
    changeYoY: null,
    sparkline,
    history: realYieldData.history,
    status: realYieldData.status,
    interpretation: realYieldData.interpretation,
    releaseDate: realYieldData.history[realYieldData.history.length - 1]?.date || "Latest",
    isMockData: false,
    lastUpdated,
    config: {
      id: "REAL_YIELD_10Y",
      name: "10-Year Real Treasury Yield",
      shortName: "10Y Real Yield",
      category: "policy",
      frequency: "Daily",
      units: "%",
      description:
        "Derived by subtracting 5-Year Breakeven Inflation (T5YIE) from 10-Year Nominal Yield (DGS10). The primary structural driver of Gold (XAUUSD) and real assets.",
      source: "U.S. Macro Radar Engine / FRED",
      benchmark: 1.5,
      goodDirection: "down", // For real assets, lower is better
      precision: 2,
      importance: "High",
      chartType: "area",
    },
  };
}

/**
 * Calculates the Commodities & Real Assets Macro Barometer.
 */
export function calculateCommoditiesBarometer(
  metricsMap: Record<string, MetricSummary>
): CommoditiesBarometer {
  const realYield = calculateRealYield(metricsMap);
  const dollar = metricsMap["DTWEXBGS"];
  const hySpread = metricsMap["BAMLH0A0HYM2"];
  const vix = metricsMap["VIXCLS"];
  const breakeven = metricsMap["T5YIE"];

  let score = 0;

  // 1. Real Yield component (Weight: 45%)
  let realYieldDriver: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string } = {
    label: "Real Yields",
    status: "neutral",
    detail: "Real yields balanced near historical median.",
  };

  if (realYield) {
    if (realYield.realYield <= 1.4) {
      score += 45;
      realYieldDriver = {
        label: `Real Yield at ${realYield.realYield}% (Low)`,
        status: "bullish",
        detail: "Low real rates create strong carrying tailwinds for gold and precious metals.",
      };
    } else if (realYield.realYield >= 2.0) {
      score -= 45;
      realYieldDriver = {
        label: `Real Yield at ${realYield.realYield}% (Elevated)`,
        status: "bearish",
        detail: "High real rates increase opportunity cost of holding non-yielding real assets.",
      };
    } else {
      score += 5;
      realYieldDriver = {
        label: `Real Yield at ${realYield.realYield}% (Neutral)`,
        status: "neutral",
        detail: "Real rates stable; asset prices driven by currency and safe-haven flows.",
      };
    }
  }

  // 2. Dollar component (Weight: 35%)
  let dollarDriver: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string } = {
    label: "U.S. Dollar",
    status: "neutral",
    detail: "Dollar Index rangebound.",
  };

  if (dollar?.latestValue) {
    const dVal = dollar.latestValue;
    const delta = dollar.changePeriod ?? 0;
    if (delta < -0.5 || dVal < 120) {
      score += 35;
      dollarDriver = {
        label: `Dollar Softening (${dVal.toFixed(1)})`,
        status: "bullish",
        detail: "Dollar depreciation expands global purchasing power for commodity buyers.",
      };
    } else if (delta > 0.5 || dVal > 126) {
      score -= 35;
      dollarDriver = {
        label: `Dollar Strengthening (${dVal.toFixed(1)})`,
        status: "bearish",
        detail: "Surging dollar pressures commodity prices and limits upward breakout momentum.",
      };
    } else {
      score += 0;
      dollarDriver = {
        label: `Dollar Consolidating (${dVal.toFixed(1)})`,
        status: "neutral",
        detail: "Rangebound DXY leaves commodity pricing uninhibited.",
      };
    }
  }

  // 3. Safe-haven & Inflation expectation component (Weight: 20%)
  let riskDriver: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string } = {
    label: "Safe Haven & Credit",
    status: "neutral",
    detail: "Credit conditions orderly.",
  };

  const isRiskStress = (hySpread?.latestValue ?? 0) > 4.2 || (vix?.latestValue ?? 0) > 22;
  const isHighInflationExpectation = (breakeven?.latestValue ?? 0) > 2.35;

  if (isRiskStress) {
    score += 20;
    riskDriver = {
      label: "Elevated Risk Stress",
      status: "bullish",
      detail: "Wider credit spreads and heightened volatility boost flight-to-safety gold bids.",
    };
  } else if (isHighInflationExpectation) {
    score += 15;
    riskDriver = {
      label: "Sticky Inflation Expectations",
      status: "bullish",
      detail: "Breakevens above 2.3% support demand for real purchasing power preservation.",
    };
  } else {
    score -= 10;
    riskDriver = {
      label: "Benign Volatility & Spreads",
      status: "neutral",
      detail: "Lack of acute financial stress keeps safe-haven speculative premia muted.",
    };
  }

  const finalScore = Math.min(Math.max(score, -100), 100);
  const stance =
    finalScore > 20
      ? "Bullish Tailwind"
      : finalScore < -20
      ? "Bearish Headwind"
      : "Neutral / Rangebound";

  let summary = "";
  if (stance === "Bullish Tailwind") {
    summary =
      "Macro posture is strongly constructive for real assets and precious metals, supported by manageable real yields and favorable currency conditions.";
  } else if (stance === "Bearish Headwind") {
    summary =
      "Elevated real yields or a resilient dollar are currently imposing macro resistance on non-yielding commodities.";
  } else {
    summary =
      "Balanced macro forces: real yields and currency dynamics suggest rangebound consolidation with tactical dip-buying setups.";
  }

  return {
    score: finalScore,
    stance,
    realYieldValue: realYield?.realYield ?? null,
    dollarValue: dollar?.latestValue ?? null,
    breakevenValue: breakeven?.latestValue ?? null,
    summary,
    drivers: {
      realYields: realYieldDriver,
      dollar: dollarDriver,
      riskHedge: riskDriver,
    },
  };
}

/**
 * Calculates the Equities & Risk Assets Macro Barometer.
 */
export function calculateEquitiesBarometer(
  metricsMap: Record<string, MetricSummary>
): EquitiesBarometer {
  const nfci = metricsMap["NFCI"];
  const hySpread = metricsMap["BAMLH0A0HYM2"];
  const vix = metricsMap["VIXCLS"];
  const dgs10 = metricsMap["DGS10"];
  const retail = metricsMap["RSAFS"];

  let score = 0;

  // 1. Financial Conditions / Liquidity (Weight: 40%)
  let liquidityDriver: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string } = {
    label: "Financial Conditions (NFCI)",
    status: "neutral",
    detail: "Financial conditions near neutral historical averages.",
  };

  if (nfci?.latestValue !== null && nfci?.latestValue !== undefined) {
    if (nfci.latestValue <= -0.4) {
      score += 40;
      liquidityDriver = {
        label: `NFCI at ${nfci.latestValue.toFixed(2)} (Very Loose)`,
        status: "bullish",
        detail: "Accommodative systemic liquidity supports equity multiple expansion and credit flow.",
      };
    } else if (nfci.latestValue > 0.0) {
      score -= 40;
      liquidityDriver = {
        label: `NFCI at ${nfci.latestValue.toFixed(2)} (Tightening)`,
        status: "bearish",
        detail: "Tighter financial conditions constrain corporate liquidity and leverage.",
      };
    } else {
      score += 15;
      liquidityDriver = {
        label: `NFCI at ${nfci.latestValue.toFixed(2)} (Neutral / Loose)`,
        status: "bullish",
        detail: "Sub-zero conditions remain supportive of risk assets without excess exuberance.",
      };
    }
  }

  // 2. High Yield Credit Spreads (Weight: 35%)
  let creditDriver: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string } = {
    label: "High Yield Credit Spread",
    status: "neutral",
    detail: "Credit risk premium near historical averages.",
  };

  if (hySpread?.latestValue !== null && hySpread?.latestValue !== undefined) {
    if (hySpread.latestValue <= 3.4) {
      score += 35;
      creditDriver = {
        label: `HY OAS at ${hySpread.latestValue.toFixed(2)}% (Tight)`,
        status: "bullish",
        detail: "Compressed junk bond spreads confirm corporate solvency and absent default panic.",
      };
    } else if (hySpread.latestValue >= 4.5) {
      score -= 35;
      creditDriver = {
        label: `HY OAS at ${hySpread.latestValue.toFixed(2)}% (Widening)`,
        status: "bearish",
        detail: "Widening credit risk premiums signal distress in corporate debt markets.",
      };
    } else {
      score += 10;
      creditDriver = {
        label: `HY OAS at ${hySpread.latestValue.toFixed(2)}% (Normal)`,
        status: "neutral",
        detail: "Credit spreads orderly, allowing equity markets to focus on earnings fundamentals.",
      };
    }
  }

  // 3. Volatility & Growth confirmation (Weight: 25%)
  let volDriver: { label: string; status: "bullish" | "neutral" | "bearish"; detail: string } = {
    label: "Volatility (VIX)",
    status: "neutral",
    detail: "Volatility regime orderly.",
  };

  const vixVal = vix?.latestValue ?? 16;
  if (vixVal < 16) {
    score += 25;
    volDriver = {
      label: `VIX at ${vixVal.toFixed(1)} (Complacent / Calm)`,
      status: "bullish",
      detail: "Low implied volatility allows systematic and trend-following strategies to allocate.",
    };
  } else if (vixVal > 24) {
    score -= 25;
    volDriver = {
      label: `VIX at ${vixVal.toFixed(1)} (Elevated Risk Aversion)`,
      status: "bearish",
      detail: "Elevated market anxiety encourages hedging and tactical de-grossing.",
    };
  } else {
    score += 5;
    volDriver = {
      label: `VIX at ${vixVal.toFixed(1)} (Moderate)`,
      status: "neutral",
      detail: "Volatility within normal operational channels.",
    };
  }

  const finalScore = Math.min(Math.max(score, -100), 100);
  const stance =
    finalScore > 25
      ? "Risk-On (Multiple Expansion)"
      : finalScore < -20
      ? "Risk-Off (Defensive)"
      : "Selective / Neutral";

  let summary = "";
  if (stance === "Risk-On (Multiple Expansion)") {
    summary =
      "Liquidity is loose and credit spreads remain tight, providing an open runway for equity valuations and cyclical leadership.";
  } else if (stance === "Risk-Off (Defensive)") {
    summary =
      "Tightening liquidity and widening credit spreads warn of negative divergences; rotate into quality balance sheets and defensives.";
  } else {
    summary =
      "Macro backdrop is balanced; favor high-quality earnings leaders while monitoring 10Y yield sensitivity.";
  }

  return {
    score: finalScore,
    stance,
    nfciValue: nfci?.latestValue ?? null,
    hyOasValue: hySpread?.latestValue ?? null,
    vixValue: vix?.latestValue ?? null,
    summary,
    drivers: {
      liquidity: liquidityDriver,
      credit: creditDriver,
      volatility: volDriver,
    },
  };
}

/**
 * Filter series IDs based on active trader lens.
 */
export function getSeriesForLens(
  lens: TraderLens,
  availableIds: string[]
): string[] {
  if (lens === "all") {
    return availableIds;
  }

  if (lens === "commodities") {
    // Curated high-impact cluster for Commodities, Precious Metals, & Real Assets
    const priority = [
      "REAL_YIELD_10Y",
      "DGS10",
      "T5YIE",
      "DTWEXBGS",
      "DGS2",
      "CPIAUCSL",
      "INDPRO",
      "GDPC1",
      "BAMLH0A0HYM2",
      "VIXCLS",
    ];
    return priority.filter((id) => availableIds.includes(id) || id === "REAL_YIELD_10Y");
  }

  if (lens === "equities") {
    // Curated high-impact cluster for Equities & Risk Assets
    const priority = [
      "NFCI",
      "BAMLH0A0HYM2",
      "VIXCLS",
      "DGS10",
      "RSAFS",
      "GDPC1",
      "UNRATE",
      "PAYEMS",
      "CPILFESL",
      "T10Y2Y",
      "DGS2",
    ];
    return priority.filter((id) => availableIds.includes(id));
  }

  return availableIds;
}
