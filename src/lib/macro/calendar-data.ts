import { CalendarEvent } from "@/types/macro";
import { addDays, format, startOfWeek } from "date-fns";

export function generateCalendarEvents(): CalendarEvent[] {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  const getReleaseDate = (offsetDays: number) => {
    return format(addDays(currentWeekStart, offsetDays), "yyyy-MM-dd");
  };

  return [
    // --- THIS WEEK ---
    {
      id: "cpi-release",
      title: "Consumer Price Index (CPI YoY)",
      seriesId: "CPIAUCSL",
      category: "inflation",
      releaseDate: getReleaseDate(1), // Tuesday
      releaseTime: "08:30:00",
      period: "Latest Month",
      consensus: "2.4%",
      previous: "2.5%",
      importance: "High",
      isMajor: true,
      affectedAssets: ["Equities", "Treasuries", "US Dollar", "Commodities"],
      bullishScenario: {
        outcome: "Headline CPI prints ≤ 2.2% YoY with Core CPI ≤ 2.9%",
        fedPolicy: "Solidifies confidence for consecutive 25bps rate cuts; opens door to 50bps discussion.",
        yields: "2Y and 10Y Treasury yields drop 8-12 bps as rate cut probabilities surge.",
        equities: "Rally led by high-multiple technology, small caps (IWM), and homebuilders.",
        dollar: "DXY weakens 0.5-0.8% as U.S. nominal rate advantage diminishes.",
      },
      baseScenario: {
        outcome: "Headline prints 2.4% YoY in-line with consensus; Core at 3.0%",
        fedPolicy: "Keeps Fed on measured, meeting-by-meeting easing path.",
        yields: "Yields trade within ±3 bps range; curve holds current slope.",
        equities: "Modest gains; market maintains focus on corporate earnings quality.",
        dollar: "Dollar consolidates near recent moving averages.",
      },
      bearishScenario: {
        outcome: "Headline surges ≥ 2.7% YoY with sticky shelter and services rebound",
        fedPolicy: "Forces FOMC to pause rate cuts; markets price in higher terminal rate.",
        yields: "2Y yield spikes 12-18 bps; yield curve flattens aggressively.",
        equities: "Broad sell-off; growth equities pressured by multiple contraction.",
        dollar: "DXY rallies 0.8-1.2% on hawkish Fed repricing.",
      },
    },
    {
      id: "retail-sales-release",
      title: "Retail Sales (Advance MoM)",
      seriesId: "RSAFS",
      category: "growth",
      releaseDate: getReleaseDate(2), // Wednesday
      releaseTime: "08:30:00",
      period: "Latest Month",
      consensus: "+0.3%",
      previous: "+0.4%",
      importance: "High",
      isMajor: true,
      affectedAssets: ["Equities", "Treasuries", "US Dollar"],
      bullishScenario: {
        outcome: "Retail sales beat consensus at +0.5% with broad discretionary strength",
        fedPolicy: "Confirms soft landing / Goldilocks; allows gradual easing without recession urgency.",
        yields: "10Y yield edges higher by 4-6 bps on growth durability.",
        equities: "Cyclicals, discretionary (XLY), and transport stocks surge.",
        dollar: "Dollar strengthens moderately on U.S. growth exceptionalism.",
      },
      baseScenario: {
        outcome: "Prints +0.2% to +0.3%, showing resilient household spending",
        fedPolicy: "Neutral impact; aligns with baseline economic projections.",
        yields: "Yields unch or slight 1-2 bps drift.",
        equities: "Markets trade constructively without major sector dispersion.",
        dollar: "Narrow trading range.",
      },
      bearishScenario: {
        outcome: "Unexpected contraction at -0.4% MoM across core retail control group",
        fedPolicy: "Increases market clamor for aggressive emergency rate cuts.",
        yields: "Yields plunge 10-15 bps on recession anxiety.",
        equities: "Cyclical equities dump; defensive staples (XLP) and healthcare outperform.",
        dollar: "Dollar weakens against safe-haven CHF and JPY.",
      },
    },
    {
      id: "initial-claims-thisweek",
      title: "Initial Jobless Claims",
      seriesId: "ICSA",
      category: "labor",
      releaseDate: getReleaseDate(3), // Thursday
      releaseTime: "08:30:00",
      period: "Week of Release",
      consensus: "218k",
      previous: "221k",
      importance: "Medium",
      isMajor: false,
      affectedAssets: ["Treasuries", "Equities"],
      bullishScenario: {
        outcome: "Claims print 210k, highlighting near-zero involuntary layoffs",
        fedPolicy: "No urgency for outsized rate reductions.",
        yields: "Yields hold steady.",
        equities: "Supportive for risk assets.",
        dollar: "Steady.",
      },
      baseScenario: {
        outcome: "Prints 215k-222k within tight seasonal corridor",
        fedPolicy: "Keeps labor market in 'balanced' categorization.",
        yields: "No reaction.",
        equities: "Neutral.",
        dollar: "Neutral.",
      },
      bearishScenario: {
        outcome: "Claims jump above 255k, signaling broadening corporate job cuts",
        fedPolicy: "Elevates employment mandate risk above inflation risk.",
        yields: "Front-end yields fall rapidly.",
        equities: "Growth fears dampen stock sentiment.",
        dollar: "Dollar softens.",
      },
    },
    {
      id: "industrial-prod-release",
      title: "Industrial Production & Capacity Utilization",
      seriesId: "INDPRO",
      category: "growth",
      releaseDate: getReleaseDate(4), // Friday
      releaseTime: "09:15:00",
      period: "Latest Month",
      consensus: "+0.2%",
      previous: "+0.1%",
      importance: "Medium",
      isMajor: false,
      affectedAssets: ["Equities", "Commodities"],
      bullishScenario: {
        outcome: "Manufacturing output exceeds +0.6%",
        fedPolicy: "Affirms cyclical factory trough is behind us.",
        yields: "Slight steepening.",
        equities: "Industrial sector (XLI) leads.",
        dollar: "Stable.",
      },
      baseScenario: {
        outcome: "Prints +0.1% to +0.2%",
        fedPolicy: "Neutral.",
        yields: "Unchanged.",
        equities: "Quiet trading.",
        dollar: "Unchanged.",
      },
      bearishScenario: {
        outcome: "Sharp contraction at -0.5% with autos and mining dragging",
        fedPolicy: "Reinforces goods-sector sluggishness.",
        yields: "Lower yields.",
        equities: "Materials and industrials lag.",
        dollar: "Weakens slightly.",
      },
    },

    // --- NEXT WEEK ---
    {
      id: "fomc-decision",
      title: "FOMC Interest Rate Decision & Press Conference",
      seriesId: "DFEDTARU",
      category: "policy",
      releaseDate: getReleaseDate(9), // Next Wednesday
      releaseTime: "14:00:00",
      period: "FOMC Meeting",
      consensus: "-25 bps Cut",
      previous: "4.50% - 4.75%",
      importance: "High",
      isMajor: true,
      affectedAssets: ["Equities", "Treasuries", "US Dollar", "Commodities"],
      bullishScenario: {
        outcome: "Delivers 25bps cut; Chair Powell highlights confidence in neutral rate glidepath",
        fedPolicy: "Confirms steady quarterly easing cadence.",
        yields: "Short yields grind down 5-10 bps; bull steepening.",
        equities: "Broad equity market upside; small caps and dividend payers lead.",
        dollar: "Orderly dollar softening.",
      },
      baseScenario: {
        outcome: "25bps cut delivered with balanced, data-dependent forward guidance",
        fedPolicy: "Maintains maximum optionality for future FOMC meetings.",
        yields: "Yields remain contained in recent ranges.",
        equities: "Choppy sideways price action; buy the rumor, sell the fact.",
        dollar: "Consolidation.",
      },
      bearishScenario: {
        outcome: "Hawkish hold or dissent citing sticky services CPI and financial condition loosening",
        fedPolicy: "Signals extended pause or higher neutral rate (r*).",
        yields: "Front-end yields skyrocket 15-25 bps.",
        equities: "Sharp drawdown across high-valuation equities and credit.",
        dollar: "Dollar rallies violently across all currency pairs.",
      },
    },
    {
      id: "nonfarm-payrolls-release",
      title: "Nonfarm Payrolls & Unemployment Rate",
      seriesId: "PAYEMS",
      category: "labor",
      releaseDate: getReleaseDate(11), // Next Friday
      releaseTime: "08:30:00",
      period: "Latest Month",
      consensus: "+175k / 4.1% Unrate",
      previous: "+180k / 4.1%",
      importance: "High",
      isMajor: true,
      affectedAssets: ["Equities", "Treasuries", "US Dollar", "Commodities"],
      bullishScenario: {
        outcome: "Goldilocks print: +150k to +185k jobs, 4.1% unrate, wage growth tame at +0.2% MoM",
        fedPolicy: "Perfect backdrop allowing Fed to normalize without recession panic.",
        yields: "2Y and 10Y Treasuries drift lower 4-6 bps.",
        equities: "S&P 500 and Nasdaq push higher on soft-landing confirmation.",
        dollar: "Slight dollar dip.",
      },
      baseScenario: {
        outcome: "Prints +160k to +190k; wage growth +0.3% MoM",
        fedPolicy: "Keeps existing easing trajectory unaltered.",
        yields: "Yields fluctuate ±3 bps.",
        equities: "Moderate constructive sentiment.",
        dollar: "Neutral.",
      },
      bearishScenario: {
        outcome: "Disaster print: Sub-50k jobs or unemployment jumps to 4.4% (Sahm Rule trigger)",
        fedPolicy: "Triggers emergency inter-meeting easing fears or 50bps front-loading.",
        yields: "Massive flight to safety; 10Y yield plunges 15-20 bps.",
        equities: "Severe risk-off rout as earnings downgrade cycle begins.",
        dollar: "Dollar plunges against JPY and EUR.",
      },
    },
    {
      id: "pce-release",
      title: "Core PCE Price Index (MoM & YoY)",
      seriesId: "PCEPILFE",
      category: "inflation",
      releaseDate: getReleaseDate(10), // Next Thursday
      releaseTime: "08:30:00",
      period: "Latest Month",
      consensus: "+0.2% MoM / 2.6% YoY",
      previous: "+0.2% MoM / 2.7% YoY",
      importance: "High",
      isMajor: true,
      affectedAssets: ["Equities", "Treasuries", "US Dollar"],
      bullishScenario: {
        outcome: "Core PCE prints +0.1% MoM bringing 3-month annualized rate to 2.1%",
        fedPolicy: "Affirms mission accomplished on inflation mandate.",
        yields: "Lower yields across the curve.",
        equities: "Broad rally across all sectors.",
        dollar: "Dollar weakens.",
      },
      baseScenario: {
        outcome: "Prints +0.2% MoM in line with expectations",
        fedPolicy: "No change to current projection trajectory.",
        yields: "Flat yields.",
        equities: "Neutral to slightly positive.",
        dollar: "Stable.",
      },
      bearishScenario: {
        outcome: "Core PCE jumps +0.4% MoM on healthcare and financial services inflation",
        fedPolicy: "Re-ignites hawkish rhetoric and pauses rate cuts.",
        yields: "Yields surge 10-14 bps.",
        equities: "Growth tech and interest-rate sensitive sectors sold off.",
        dollar: "Dollar jumps higher.",
      },
    },
  ];
}
