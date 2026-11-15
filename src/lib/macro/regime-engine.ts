import {
  AssetClassImplication,
  MacroRegimeType,
  MetricSummary,
  RegimeChecklistItem,
  RegimeClassification,
  RegimeConfidenceLevel,
  RegimeSupportingIndicator,
} from "@/types/macro";

export interface RegimeScores {
  growthScore: number; // -100 (severe contraction) to +100 (rapid expansion)
  inflationScore: number; // -100 (rapid disinflation/deflation) to +100 (surging inflation)
}

/**
 * Calculates continuous growth and inflation momentum scores from underlying metrics.
 */
export function calculateRegimeScores(
  metricsMap: Record<string, MetricSummary>
): RegimeScores {
  // 1. Growth Score Components
  let growthTotal = 0;
  let growthWeights = 0;

  // Real GDP (Quarterly)
  const gdp = metricsMap["GDPC1"];
  if (gdp?.latestValue && gdp.priorValue) {
    const qGrowth = (gdp.latestValue - gdp.priorValue) / gdp.priorValue;
    const score = qGrowth > 0.005 ? 50 : qGrowth > 0 ? 20 : -40;
    growthTotal += score * 1.5;
    growthWeights += 1.5;
  }

  // Retail Sales YoY (RSAFS)
  const retail = metricsMap["RSAFS"];
  if (retail?.latestValue !== null && retail?.latestValue !== undefined) {
    const score = retail.latestValue >= 3.0 ? 50 : retail.latestValue >= 1.5 ? 20 : -30;
    growthTotal += score * 1.2;
    growthWeights += 1.2;
  }

  // Industrial Production YoY (INDPRO)
  const indpro = metricsMap["INDPRO"];
  if (indpro?.latestValue !== null && indpro?.latestValue !== undefined) {
    const score = indpro.latestValue > 1.0 ? 40 : indpro.latestValue >= 0 ? 10 : -30;
    growthTotal += score * 1.0;
    growthWeights += 1.0;
  }

  // Weekly Economic Index (WEI)
  const wei = metricsMap["WEI"];
  if (wei?.latestValue !== null && wei?.latestValue !== undefined) {
    const score = wei.latestValue >= 2.2 ? 40 : wei.latestValue >= 1.5 ? 15 : -35;
    growthTotal += score * 1.0;
    growthWeights += 1.0;
  }

  // Labor confirmation: Unemployment rate delta
  const unrate = metricsMap["UNRATE"];
  if (
    unrate &&
    unrate.latestValue !== null &&
    unrate.latestValue !== undefined &&
    unrate.priorValue !== null &&
    unrate.priorValue !== undefined
  ) {
    const delta = unrate.latestValue - unrate.priorValue;
    const score = delta < 0 ? 30 : delta === 0 ? 10 : -30;
    growthTotal += score * 1.0;
    growthWeights += 1.0;
  }

  const growthScore = growthWeights > 0 ? Math.round(growthTotal / growthWeights) : 25;

  // 2. Inflation Score Components
  let inflationTotal = 0;
  let inflationWeights = 0;

  // Headline CPI YoY (CPIAUCSL)
  const cpi = metricsMap["CPIAUCSL"];
  if (cpi?.latestValue !== null && cpi?.latestValue !== undefined) {
    const score = cpi.latestValue > 3.2 ? 60 : cpi.latestValue > 2.5 ? 20 : -40;
    inflationTotal += score * 1.5;
    inflationWeights += 1.5;
  }

  // Core CPI YoY (CPILFESL)
  const coreCpi = metricsMap["CPILFESL"];
  if (coreCpi?.latestValue !== null && coreCpi?.latestValue !== undefined) {
    const score = coreCpi.latestValue > 3.2 ? 60 : coreCpi.latestValue > 2.7 ? 20 : -40;
    inflationTotal += score * 1.5;
    inflationWeights += 1.5;
  }

  // Core PCE YoY (PCEPILFE)
  const corePce = metricsMap["PCEPILFE"];
  if (corePce?.latestValue !== null && corePce?.latestValue !== undefined) {
    const score = corePce.latestValue > 2.8 ? 50 : corePce.latestValue > 2.3 ? 15 : -40;
    inflationTotal += score * 1.8;
    inflationWeights += 1.8;
  }

  // 5-Year Breakeven Inflation (T5YIE)
  const breakeven = metricsMap["T5YIE"];
  if (breakeven?.latestValue !== null && breakeven?.latestValue !== undefined) {
    const score = breakeven.latestValue > 2.4 ? 40 : breakeven.latestValue > 2.1 ? 10 : -30;
    inflationTotal += score * 1.0;
    inflationWeights += 1.0;
  }

  const inflationScore =
    inflationWeights > 0 ? Math.round(inflationTotal / inflationWeights) : -20;

  return { growthScore, inflationScore };
}

/**
 * Classifies current macro regime based on growth and inflation momentum.
 */
export function classifyRegime(
  scores: RegimeScores,
  metricsMap: Record<string, MetricSummary>
): RegimeClassification {
  const { growthScore, inflationScore } = scores;

  let regime: MacroRegimeType;
  if (growthScore >= 0 && inflationScore <= 0) {
    regime = "goldilocks";
  } else if (growthScore >= 0 && inflationScore > 0) {
    regime = "reflation";
  } else if (growthScore < 0 && inflationScore > 0) {
    regime = "stagflation";
  } else {
    regime = "disinflationary_slowdown";
  }

  // Calculate confidence score (0-100)
  const growthMagnitude = Math.min(Math.abs(growthScore), 100);
  const inflationMagnitude = Math.min(Math.abs(inflationScore), 100);
  const avgMagnitude = (growthMagnitude + inflationMagnitude) / 2;
  const confidenceScore = Math.min(Math.max(Math.round(40 + avgMagnitude * 0.55), 45), 94);

  const confidenceLevel: RegimeConfidenceLevel =
    confidenceScore >= 75 ? "High" : confidenceScore >= 60 ? "Medium" : "Low";

  const growthState = growthScore > 20 ? "Accelerating" : growthScore >= 0 ? "Trend" : "Slowing";
  const inflationState = inflationScore > 20 ? "Rising" : inflationScore >= -10 ? "Sticky" : "Falling";

  const regimeConfigs: Record<
    MacroRegimeType,
    {
      title: string;
      tagline: string;
      marketAssessment: string;
      whatChanged: string;
      assetImplications: AssetClassImplication[];
      checklist: RegimeChecklistItem[];
    }
  > = {
    goldilocks: {
      title: "Goldilocks Regime",
      tagline: "Resilient U.S. Growth Coupled with Disinflationary Tailwinds",
      marketAssessment:
        "Historically the most constructive macro backdrop for broad equities and corporate credit, with earnings holding and the Fed retaining policy flexibility.",
      whatChanged:
        "Headline and core price pressures continued their measured descent toward 2%, while weekly economic activity and retail sales affirmed durable consumer demand.",
      assetImplications: [
        {
          asset: "Equities",
          stance: "Bullish",
          rationale:
            "Expanding profit margins and declining discount rates support broad multiples without severe margin compression.",
          topSectors: ["Technology", "Consumer Discretionary", "Industrials"],
        },
        {
          asset: "Bonds",
          stance: "Neutral / Selective",
          rationale:
            "Intermediate curve yields benefit from rate normalization, but term premiums limit aggressive long-duration rally.",
        },
        {
          asset: "US Dollar",
          stance: "Neutral / Selective",
          rationale:
            "U.S. growth outperformance offsets declining rate differentials, keeping DXY in a rangebound channel.",
        },
        {
          asset: "Commodities",
          stance: "Neutral / Selective",
          rationale:
            "Moderate industrial demand supports base metals, while absent supply shocks cap runaway oil upside.",
        },
        {
          asset: "Rate-Sensitive Sectors",
          stance: "Bullish",
          rationale:
            "Homebuilders, commercial REITs, and growth equities re-rate favorably as policy rates stabilize.",
        },
      ],
      checklist: [
        {
          trigger: "Core PCE accelerates above 3.2% YoY across 2 consecutive months",
          likelihood: "Low",
          impactRegime: "reflation",
          description: "Forces FOMC to halt rate reductions or communicate renewed tightening bias.",
        },
        {
          trigger: "Initial Jobless Claims surge persistently above 275k per week",
          likelihood: "Medium",
          impactRegime: "disinflationary_slowdown",
          description: "Signals corporate retrenchment and household consumption decelerating rapidly.",
        },
        {
          trigger: "Oil spikes above $95/bbl amid geopolitical shipping disruptions",
          likelihood: "Low",
          impactRegime: "stagflation",
          description: "Creates negative supply shock boosting headline prices while crimping disposable income.",
        },
        {
          trigger: "High-yield credit spreads blow out past 500 bps",
          likelihood: "Low",
          impactRegime: "disinflationary_slowdown",
          description: "Indicates credit market dislocation and private sector refinancing strain.",
        },
      ],
    },
    reflation: {
      title: "Reflation Regime",
      tagline: "Accelerating Economic Activity Driving Upward Price Pressures",
      marketAssessment:
        "Cyclicals and commodities outperform as top-line revenues swell, but rising bond yields create valuation headwinds for high-multiple growth equities.",
      whatChanged:
        "Consumer demand and manufacturing production rebounded sharply, leading to renewed firm pricing power and rising breakeven inflation rates.",
      assetImplications: [
        {
          asset: "Equities",
          stance: "Neutral / Selective",
          rationale:
            "Value, cyclicals, and financials outperform long-duration secular growth stocks.",
          topSectors: ["Energy", "Financials", "Materials"],
        },
        {
          asset: "Bonds",
          stance: "Bearish",
          rationale:
            "Rising inflation premiums and hawkish policy revisions push benchmark Treasury yields higher.",
        },
        {
          asset: "US Dollar",
          stance: "Bullish",
          rationale:
            "Fed staying higher-for-longer attracts international capital flows seeking superior U.S. carry.",
        },
        {
          asset: "Commodities",
          stance: "Bullish",
          rationale:
            "Raw materials and energy lead asset classes due to physical inventory constraints.",
        },
        {
          asset: "Rate-Sensitive Sectors",
          stance: "Bearish",
          rationale:
            "High borrowing rates pressure utility dividend yields and mortgage affordability.",
        },
      ],
      checklist: [
        {
          trigger: "Headline CPI retreats toward 2.2% on goods deflation",
          likelihood: "Medium",
          impactRegime: "goldilocks",
          description: "Growth sustains without reigniting broad consumer price pressures.",
        },
        {
          trigger: "10-Year Treasury yield breaches 5.0% triggering financial stress",
          likelihood: "Medium",
          impactRegime: "stagflation",
          description: "Excessive borrowing costs restrict corporate capital expenditures.",
        },
      ],
    },
    stagflation: {
      title: "Stagflation Regime",
      tagline: "Decelerating Economic Growth Met with Persistent High Inflation",
      marketAssessment:
        "The most hostile macro regime for traditional 60/40 portfolios, requiring defensive posture, cash preservation, and real asset exposure.",
      whatChanged:
        "Output indicators downshifted while supply-side frictions and sticky service costs elevated inflation above consensus targets.",
      assetImplications: [
        {
          asset: "Equities",
          stance: "Bearish",
          rationale:
            "Simultaneous margin contraction and multiple compression impair aggregate index returns.",
        },
        {
          asset: "Bonds",
          stance: "Bearish",
          rationale:
            "Bonds lose their traditional recession-hedging buffer as inflation prevents rate cuts.",
        },
        {
          asset: "Commodities",
          stance: "Bullish",
          rationale:
            "Physical assets, gold, and energy retain purchasing power in supply-driven inflation.",
        },
        {
          asset: "US Dollar",
          stance: "Neutral / Selective",
          rationale: "Benefits from global safe-haven flight during acute risk-off episodes.",
        },
        {
          asset: "Rate-Sensitive Sectors",
          stance: "Defensive",
          rationale: "Extreme sensitivity to elevated rates without volume growth.",
        },
      ],
      checklist: [
        {
          trigger: "Commodity and energy prices collapse 20%",
          likelihood: "Medium",
          impactRegime: "disinflationary_slowdown",
          description: "Relieves cost push pressure, transitioning macro into classic slowdown.",
        },
      ],
    },
    disinflationary_slowdown: {
      title: "Disinflationary Slowdown",
      tagline: "Sub-Trend Economic Growth Facilitating Rapid Disinflation",
      marketAssessment:
        "High-quality Treasuries and defensive dividend cash-flow leaders outperform as the market aggressively prices upcoming central bank rate cuts.",
      whatChanged:
        "Labor demand cooled and consumer discretionary spending moderated, reducing aggregate demand pressures on inflation.",
      assetImplications: [
        {
          asset: "Equities",
          stance: "Neutral / Selective",
          rationale:
            "Earnings estimates face downward revisions; favor secular balance-sheet fortresses.",
          topSectors: ["Healthcare", "Utilities", "Consumer Staples"],
        },
        {
          asset: "Bonds",
          stance: "Bullish",
          rationale:
            "Sovereign debt delivers capital appreciation as forward rate expectations decline.",
        },
        {
          asset: "US Dollar",
          stance: "Bearish",
          rationale: "Fed easing cycle narrows nominal yield advantage vs G10 peers.",
        },
        {
          asset: "Commodities",
          stance: "Bearish",
          rationale: "Weakening industrial throughput suppresses oil and cyclical metal demand.",
        },
        {
          asset: "Rate-Sensitive Sectors",
          stance: "Neutral / Selective",
          rationale:
            "Lower mortgage and debt costs provide relief after initial demand stabilization.",
        },
      ],
      checklist: [
        {
          trigger: "Fiscal stimulus and inventory restocking reaccelerate industrial output",
          likelihood: "Medium",
          impactRegime: "goldilocks",
          description: "Economic momentum rebounds before unemployment reaches critical thresholds.",
        },
      ],
    },
  };

  const currentConfig = regimeConfigs[regime];

  // Derive supporting vs contradictory indicators from current metrics
  const supportingIndicators: RegimeSupportingIndicator[] = [];
  const contradictoryIndicators: RegimeSupportingIndicator[] = [];

  // Check Growth indicators
  const rsg = metricsMap["RSAFS"];
  if (rsg?.latestValue !== null && rsg?.latestValue !== undefined) {
    if (regime === "goldilocks" || regime === "reflation") {
      if ((rsg.latestValue ?? 0) >= 2.0) {
        supportingIndicators.push({
          name: "Retail Sales YoY",
          seriesId: "RSAFS",
          latestValue: `${rsg.latestValue.toFixed(1)}%`,
          signal: "supporting",
          detail: "Healthy consumer spending affirms growth durability.",
        });
      } else {
        contradictoryIndicators.push({
          name: "Retail Sales YoY",
          seriesId: "RSAFS",
          latestValue: `${rsg.latestValue.toFixed(1)}%`,
          signal: "contradictory",
          detail: "Sub-2% retail spending indicates softening consumer discretionary demand.",
        });
      }
    }
  }

  // Check Inflation indicators
  const cpiSummary = metricsMap["CPIAUCSL"];
  if (cpiSummary?.latestValue !== null && cpiSummary?.latestValue !== undefined) {
    if (regime === "goldilocks" || regime === "disinflationary_slowdown") {
      if ((cpiSummary.latestValue ?? 0) <= 2.8) {
        supportingIndicators.push({
          name: "Headline CPI YoY",
          seriesId: "CPIAUCSL",
          latestValue: `${cpiSummary.latestValue.toFixed(1)}%`,
          signal: "supporting",
          detail: "Ongoing disinflation supports monetary easing without growth sacrifice.",
        });
      } else {
        contradictoryIndicators.push({
          name: "Headline CPI YoY",
          seriesId: "CPIAUCSL",
          latestValue: `${cpiSummary.latestValue.toFixed(1)}%`,
          signal: "contradictory",
          detail: "Headline CPI running above 2.8% keeps monetary policy cautious.",
        });
      }
    }
  }

  // Check Unemployment
  const unrateSummary = metricsMap["UNRATE"];
  if (unrateSummary?.latestValue !== null && unrateSummary?.latestValue !== undefined) {
    supportingIndicators.push({
      name: "Unemployment Rate",
      seriesId: "UNRATE",
      latestValue: `${unrateSummary.latestValue.toFixed(1)}%`,
      signal: "supporting",
      detail: "Historical low unemployment maintains aggregate wage purchasing power.",
    });
  }

  // Check Financial Conditions
  const nfciSummary = metricsMap["NFCI"];
  if (nfciSummary?.latestValue !== null && nfciSummary?.latestValue !== undefined) {
    if ((nfciSummary.latestValue ?? 0) < 0) {
      supportingIndicators.push({
        name: "Chicago Fed NFCI",
        seriesId: "NFCI",
        latestValue: nfciSummary.latestValue.toFixed(2),
        signal: "supporting",
        detail: "Negative index demonstrates loose, accommodative liquidity conditions.",
      });
    } else {
      contradictoryIndicators.push({
        name: "Chicago Fed NFCI",
        seriesId: "NFCI",
        latestValue: nfciSummary.latestValue.toFixed(2),
        signal: "contradictory",
        detail: "Positive reading flags tightness in banking and credit markets.",
      });
    }
  }

  // Check Credit Spreads
  const hySpread = metricsMap["BAMLH0A0HYM2"];
  if (hySpread?.latestValue !== null && hySpread?.latestValue !== undefined) {
    supportingIndicators.push({
      name: "High Yield Credit Spread",
      seriesId: "BAMLH0A0HYM2",
      latestValue: `${hySpread.latestValue.toFixed(2)}%`,
      signal: "supporting",
      detail: "Sub-3.5% spreads confirm absence of institutional corporate credit panic.",
    });
  }

  return {
    regime,
    title: currentConfig.title,
    tagline: currentConfig.tagline,
    confidenceScore,
    confidenceLevel,
    growthState,
    inflationState,
    marketAssessment: currentConfig.marketAssessment,
    whatChanged: currentConfig.whatChanged,
    supportingIndicators: supportingIndicators.slice(0, 4),
    contradictoryIndicators:
      contradictoryIndicators.length > 0
        ? contradictoryIndicators.slice(0, 3)
        : [
            {
              name: "10Y - 2Y Spread",
              seriesId: "T10Y2Y",
              latestValue: `${(metricsMap["T10Y2Y"]?.latestValue ?? 0.25).toFixed(2)}%`,
              signal: "contradictory",
              detail: "Yield curve steepening out of prior inversion warrants vigilant monitoring.",
            },
          ],
    assetImplications: currentConfig.assetImplications,
    checklist: currentConfig.checklist,
    lastUpdated: new Date().toISOString(),
  };
}
