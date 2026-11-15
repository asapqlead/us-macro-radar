import { CalendarEvent, MacroRegimeType, WeeklyBrief } from "@/types/macro";
import { format, startOfWeek } from "date-fns";

export function generateWeeklyBrief(
  regime: { type: MacroRegimeType; title: string; assessment: string },
  upcomingEvents: CalendarEvent[]
): WeeklyBrief {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekStr = `Week of ${format(weekStart, "MMMM d, yyyy")}`;

  const topReleases = upcomingEvents
    .filter((e) => e.isMajor || e.importance === "High")
    .slice(0, 3);

  return {
    weekOf: weekStr,
    macroRegime: regime,
    whatHappenedLastWeek: [
      {
        title: "Disinflation Reaffirmed by Core Gauges",
        impact: "Bullish for equities & intermediate Treasuries",
        bulletPoints: [
          "Core price pressures decelerated to 2.8% YoY, confirming the structural disinflation trend remains intact.",
          "Shelter inflation continued its delayed downshift, dampening forward service-sector inflation forecasts.",
          "Market-implied 5-year breakevens settled near 2.2%, remaining anchored near the Fed's target.",
        ],
      },
      {
        title: "Labor Market Remained Solid with Steady Turnover",
        impact: "Neutral to mildly supportive",
        bulletPoints: [
          "Initial jobless claims printed at 218k, maintaining a historically benign layoff backdrop across private employers.",
          "JOLTS job openings stabilized near 7.6M, keeping the vacancies-to-unemployed ratio around 1.1x.",
          "Average hourly earnings growth slowed to 3.8% YoY, easing unit labor cost pressures on services margins.",
        ],
      },
      {
        title: "Financial Conditions Loosened Further",
        impact: "Bullish for risk assets & corporate credit",
        bulletPoints: [
          "Chicago Fed NFCI printed -0.51, confirming broad access to capital across debt and equity channels.",
          "High-yield credit spreads tightened to 285 bps over benchmark Treasuries, signaling minimal distress.",
          "VIX compressed below 15.0, reflecting quiet equity volatility and disciplined hedging demand.",
        ],
      },
    ],
    whatMattersThisWeek: [
      {
        theme: "Upcoming CPI Print & Inflation Glidepath",
        keyDriver: "Headline CPI YoY & Supercore Services",
        bulletPoints: [
          "A print below 2.4% would give the FOMC green light to continue calibrating rates toward neutral.",
          "Watch shelter and auto insurance components for potential upside surprises.",
        ],
      },
      {
        theme: "Consumer Spending Durability via Advance Retail Sales",
        keyDriver: "Real Retail & Food Services (RSAFS)",
        bulletPoints: [
          "Assessing whether household balance sheets can sustain above-trend consumption into the quarter.",
          "Focus on discretionary spending vs essential staples.",
        ],
      },
      {
        theme: "Treasury Yield Curve Dynamics",
        keyDriver: "10Y - 2Y Curve Normalization (T10Y2Y)",
        bulletPoints: [
          "The 10Y-2Y spread has exited its deep inversion, trading at a positive spread.",
          "Historically, bull-steepening driven by Fed cuts supports risk assets, while bear-steepening creates duration friction.",
        ],
      },
    ],
    topUpcomingReleases: topReleases,
    marketScenarios: {
      baseCase: {
        probability: 60,
        thesis:
          "Orderly disinflation and steady trend growth sustain a constructive Goldilocks regime, with Fed easing at a steady 25 bps pace.",
        allocationTip:
          "Maintain overweight in broad equities with a tilt toward quality growth, balance-sheet fortresses, and intermediate Treasuries.",
      },
      bullishCase: {
        probability: 25,
        thesis:
          "Productivity surge accelerates real GDP output while inflation drops rapidly to 2.0%, sparking a powerful broad-market rally.",
        allocationTip:
          "Aggressively add high-beta cyclicals, small-cap equities (IWM), and rate-sensitive homebuilders.",
      },
      bearishCase: {
        probability: 15,
        thesis:
          "Commodity supply shock or sticky services inflation stalls rate cuts while hiring slows abruptly, sparking stagflation concerns.",
        allocationTip:
          "Overweight cash, short-duration T-bills, gold, energy commodities, and low-volatility defensive staples.",
      },
    },
    keyRisks: [
      "Geopolitical tensions disrupting energy transport corridors and elevating freight insurance costs.",
      "Fiscal Treasury issuance volume causing long-end auction indigestion and episodic 10Y yield spikes.",
      "Tariff and trade policy escalation introducing one-off price level shocks to import goods.",
      "Commercial real estate debt maturities pressuring regional bank balance sheets.",
    ],
    conclusion:
      "The U.S. macroeconomic backdrop remains squarely in an expansionary, disinflationary corridor. While high equity valuations leave limited margin for severe earnings misses, loose financial conditions and a benign layoff rate suggest market dips remain dip-buying opportunities rather than the beginning of a cyclical bear market.",
    lastUpdated: new Date().toISOString(),
  };
}
