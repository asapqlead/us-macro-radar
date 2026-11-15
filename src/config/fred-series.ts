import { MacroCategory, MacroSeriesConfig } from "@/types/macro";

/**
 * Centralized FRED Series Configuration for US Macro Radar.
 * Fully configured with all 24 core macroeconomic indicators requested.
 */
export const FRED_SERIES_REGISTRY: Record<string, MacroSeriesConfig> = {
  // ==========================================
  // 1. Growth
  // ==========================================
  GDPC1: {
    id: "GDPC1",
    name: "Real Gross Domestic Product",
    shortName: "Real GDP",
    category: "growth",
    frequency: "Quarterly",
    fredFrequency: "q",
    units: "Bil. Chained $",
    defaultFredUnits: "lin",
    description:
      "Inflation-adjusted market value of all goods and services produced in the U.S. Tracks top-line macroeconomic expansion or contraction.",
    source: "U.S. Bureau of Economic Analysis (BEA)",
    precision: 1,
    goodDirection: "up",
    importance: "High",
    chartType: "area",
  },
  RSAFS: {
    id: "RSAFS",
    name: "Advance Real Retail & Food Services Sales",
    shortName: "Retail Sales YoY",
    category: "growth",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "pc1", // YoY
    description:
      "Year-over-year rate of change in retail purchases, providing a direct lens into consumer spending durability (roughly 70% of U.S. GDP).",
    source: "U.S. Census Bureau",
    precision: 1,
    goodDirection: "up",
    importance: "High",
    chartType: "area",
  },
  INDPRO: {
    id: "INDPRO",
    name: "Industrial Production Index",
    shortName: "Industrial Production YoY",
    category: "growth",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "pc1", // YoY
    description:
      "Measures real output of manufacturing, mining, and utilities. A reliable cyclical gauge for physical business investment and factory activity.",
    source: "Federal Reserve Board",
    precision: 1,
    goodDirection: "up",
    importance: "Medium",
    chartType: "area",
  },
  WEI: {
    id: "WEI",
    name: "Weekly Economic Index",
    shortName: "Weekly Economic Index (WEI)",
    category: "growth",
    frequency: "Weekly",
    fredFrequency: "w",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "High-frequency composite of 10 daily and weekly indicators of real economic activity (rail traffic, retail sales, fuel sales, tax withholdings).",
    source: "Federal Reserve Bank of New York",
    precision: 2,
    goodDirection: "up",
    importance: "High",
    chartType: "line",
  },

  // ==========================================
  // 2. Inflation
  // ==========================================
  CPIAUCSL: {
    id: "CPIAUCSL",
    name: "Consumer Price Index (All Urban Consumers)",
    shortName: "Headline CPI YoY",
    category: "inflation",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "pc1",
    description:
      "Year-over-year change in prices paid by urban consumers across food, energy, housing, and goods.",
    source: "U.S. Bureau of Labor Statistics (BLS)",
    benchmark: 2.0,
    precision: 1,
    goodDirection: "down",
    importance: "High",
    chartType: "area",
  },
  CPILFESL: {
    id: "CPILFESL",
    name: "Core CPI (Ex Food & Energy)",
    shortName: "Core CPI YoY",
    category: "inflation",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "pc1",
    description:
      "Strips volatile food and energy components to identify sticky underlying structural consumer inflation trends.",
    source: "U.S. Bureau of Labor Statistics (BLS)",
    benchmark: 2.0,
    precision: 1,
    goodDirection: "down",
    importance: "High",
    chartType: "area",
  },
  PCEPI: {
    id: "PCEPI",
    name: "Personal Consumption Expenditures Price Index",
    shortName: "Headline PCE YoY",
    category: "inflation",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "pc1",
    description:
      "Broad measure of consumer spending prices accounting for substitution effects; the Fed's primary statutory inflation gauge.",
    source: "U.S. Bureau of Economic Analysis (BEA)",
    benchmark: 2.0,
    precision: 1,
    goodDirection: "down",
    importance: "High",
    chartType: "area",
  },
  PCEPILFE: {
    id: "PCEPILFE",
    name: "Core PCE Price Index",
    shortName: "Core PCE YoY",
    category: "inflation",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "pc1",
    description:
      "Core PCE measures underlying inflation excluding food and energy. The definitive metric guiding the FOMC 2.0% annual inflation mandate.",
    source: "U.S. Bureau of Economic Analysis (BEA)",
    benchmark: 2.0,
    precision: 1,
    goodDirection: "down",
    importance: "High",
    chartType: "area",
  },
  T5YIE: {
    id: "T5YIE",
    name: "5-Year Breakeven Inflation Rate",
    shortName: "5Y Breakeven Inflation",
    category: "inflation",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Market-implied 5-year expected inflation derived from the yield spread between nominal 5Y Treasuries and 5Y TIPS.",
    source: "Federal Reserve Bank of St. Louis",
    benchmark: 2.0,
    precision: 2,
    goodDirection: "down",
    importance: "Medium",
    chartType: "line",
  },

  // ==========================================
  // 3. Labor Market
  // ==========================================
  UNRATE: {
    id: "UNRATE",
    name: "Civilian Unemployment Rate",
    shortName: "Unemployment Rate",
    category: "labor",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Headline U-3 unemployment rate representing the percentage of the civilian labor force actively seeking employment.",
    source: "U.S. Bureau of Labor Statistics (BLS)",
    precision: 1,
    goodDirection: "down",
    importance: "High",
    chartType: "area",
  },
  PAYEMS: {
    id: "PAYEMS",
    name: "Total Nonfarm Payroll Employment",
    shortName: "Nonfarm Payrolls (MoM Change)",
    category: "labor",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "k",
    defaultFredUnits: "chg", // Monthly change in thousands
    description:
      "Net monthly job creation in nonfarm commercial, industrial, and government sectors. The premier benchmark for labor momentum.",
    source: "U.S. Bureau of Labor Statistics (BLS)",
    precision: 0,
    goodDirection: "up",
    importance: "High",
    chartType: "bar",
  },
  ICSA: {
    id: "ICSA",
    name: "Initial Jobless Claims",
    shortName: "Initial Claims",
    category: "labor",
    frequency: "Weekly",
    fredFrequency: "w",
    units: "k",
    defaultFredUnits: "lin",
    description:
      "Weekly first-time filings for state unemployment insurance. High-frequency leading indicator of corporate layoff spikes.",
    source: "U.S. Department of Labor",
    precision: 0,
    goodDirection: "down",
    importance: "High",
    chartType: "line",
  },
  JTSJOL: {
    id: "JTSJOL",
    name: "Job Openings: Total Nonfarm (JOLTS)",
    shortName: "Job Openings (JOLTS)",
    category: "labor",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "M",
    defaultFredUnits: "lin",
    description:
      "Total available unfilled positions advertised by U.S. employers. Gauges labor demand tightness vs worker supply.",
    source: "U.S. Bureau of Labor Statistics (BLS)",
    precision: 2,
    goodDirection: "up",
    importance: "Medium",
    chartType: "area",
  },
  CES0500000003: {
    id: "CES0500000003",
    name: "Average Hourly Earnings of All Employees (Private)",
    shortName: "Wage Growth YoY",
    category: "labor",
    frequency: "Monthly",
    fredFrequency: "m",
    units: "%",
    defaultFredUnits: "pc1", // YoY wage growth
    description:
      "Year-over-year rate of change in average hourly pay for private nonfarm workers. Indicates labor market wage pressure on services inflation.",
    source: "U.S. Bureau of Labor Statistics (BLS)",
    precision: 1,
    goodDirection: "neutral",
    importance: "High",
    chartType: "line",
  },

  // ==========================================
  // 4. Policy and Rates
  // ==========================================
  DFF: {
    id: "DFF",
    name: "Federal Funds Effective Rate",
    shortName: "Effective Fed Funds Rate",
    category: "policy",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Volume-weighted median of overnight interbank lending transactions in the federal funds market, steered by the FOMC target range.",
    source: "Federal Reserve Bank of New York",
    precision: 2,
    goodDirection: "neutral",
    importance: "High",
    chartType: "line",
  },
  DFEDTARU: {
    id: "DFEDTARU",
    name: "Federal Funds Target Range - Upper Limit",
    shortName: "Fed Target Upper Limit",
    category: "policy",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Upper boundary of the FOMC target range for the federal funds rate, setting policy tightness ceiling.",
    source: "Federal Reserve Board",
    precision: 2,
    goodDirection: "neutral",
    importance: "Medium",
    chartType: "line",
  },
  DGS2: {
    id: "DGS2",
    name: "2-Year Treasury Constant Maturity",
    shortName: "2Y Treasury Yield",
    category: "policy",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Market yield on 2-year U.S. government debt. Deeply anchored by financial market pricing of FOMC interest rate adjustments over a 24-month horizon.",
    source: "Federal Reserve Board",
    precision: 2,
    goodDirection: "neutral",
    importance: "High",
    chartType: "line",
  },
  DGS10: {
    id: "DGS10",
    name: "10-Year Treasury Constant Maturity",
    shortName: "10Y Treasury Yield",
    category: "policy",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Global benchmark risk-free rate determining mortgage rates, corporate bond pricing, and equity discount rates.",
    source: "Federal Reserve Board",
    precision: 2,
    goodDirection: "neutral",
    importance: "High",
    chartType: "line",
  },
  T10Y2Y: {
    id: "T10Y2Y",
    name: "10-Year Minus 2-Year Treasury Yield Spread",
    shortName: "10Y - 2Y Spread",
    category: "policy",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Yield curve slope. When negative (inverted), 2Y yield exceeds 10Y yield, historically signaling elevated recession risk within 12-18 months.",
    source: "Federal Reserve Bank of St. Louis",
    benchmark: 0.0,
    isInversionWarning: true,
    precision: 2,
    goodDirection: "up",
    importance: "High",
    chartType: "area",
  },
  T10Y3M: {
    id: "T10Y3M",
    name: "10-Year Minus 3-Month Treasury Yield Spread",
    shortName: "10Y - 3M Spread",
    category: "policy",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Short-term yield curve spread favored by Federal Reserve research models as the most statistically rigorous predictor of U.S. recessions.",
    source: "Federal Reserve Bank of St. Louis",
    benchmark: 0.0,
    isInversionWarning: true,
    precision: 2,
    goodDirection: "up",
    importance: "High",
    chartType: "area",
  },

  // ==========================================
  // 5. Financial Conditions
  // ==========================================
  NFCI: {
    id: "NFCI",
    name: "Chicago Fed National Financial Conditions Index",
    shortName: "Chicago Fed NFCI",
    category: "financial_conditions",
    frequency: "Weekly",
    fredFrequency: "w",
    units: "Index",
    defaultFredUnits: "lin",
    description:
      "Comprehensive index of 105 financial activity indicators. Values above 0 indicate tighter-than-average financial conditions; values below 0 indicate looser conditions.",
    source: "Federal Reserve Bank of Chicago",
    benchmark: 0.0,
    precision: 2,
    goodDirection: "down",
    importance: "High",
    chartType: "line",
  },
  BAMLH0A0HYM2: {
    id: "BAMLH0A0HYM2",
    name: "ICE BofA US High Yield Index Option-Adjusted Spread",
    shortName: "High Yield Credit Spread",
    category: "financial_conditions",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Yield premium junk bond issuers must pay over comparable Treasuries. Widening spreads indicate corporate credit distress and risk aversion.",
    source: "ICE Data Indices, LLC",
    benchmark: 4.0,
    precision: 2,
    goodDirection: "down",
    importance: "High",
    chartType: "line",
  },
  BAMLC0O0CM: {
    id: "BAMLC0O0CM",
    name: "ICE BofA US Corporate Index Option-Adjusted Spread",
    shortName: "Investment Grade Credit Spread",
    category: "financial_conditions",
    frequency: "Daily",
    fredFrequency: "d",
    units: "%",
    defaultFredUnits: "lin",
    description:
      "Yield spread of investment-grade corporate bonds over spot Treasury curve. Tracks institutional borrowing cost friction.",
    source: "ICE Data Indices, LLC",
    precision: 2,
    goodDirection: "down",
    importance: "Medium",
    chartType: "line",
  },
  DTWEXBGS: {
    id: "DTWEXBGS",
    name: "Trade Weighted U.S. Dollar Index: Broad (Goods & Services)",
    shortName: "US Dollar Index (Broad)",
    category: "financial_conditions",
    frequency: "Daily",
    fredFrequency: "d",
    units: "Index",
    defaultFredUnits: "lin",
    description:
      "Weighted average foreign exchange value of the U.S. dollar against currencies of broad trading partners. A strengthening dollar tightens global liquidity.",
    source: "Federal Reserve Board",
    precision: 1,
    goodDirection: "neutral",
    importance: "Medium",
    chartType: "line",
  },
  VIXCLS: {
    id: "VIXCLS",
    name: "CBOE Volatility Index: VIX",
    shortName: "VIX (Equity Volatility)",
    category: "financial_conditions",
    frequency: "Daily",
    fredFrequency: "d",
    units: "Index",
    defaultFredUnits: "lin",
    description:
      "30-day implied volatility calculated from S&P 500 index options. Wall Street's benchmark fear gauge.",
    source: "Chicago Board Options Exchange (CBOE)",
    benchmark: 20.0,
    precision: 1,
    goodDirection: "down",
    importance: "High",
    chartType: "line",
  },
};

export const CATEGORY_PANEL_CONFIG: Record<
  MacroCategory,
  { title: string; question: string; defaultSeriesIds: string[] }
> = {
  growth: {
    title: "1. Economic Growth & Activity",
    question: "Is U.S. growth accelerating or slowing?",
    defaultSeriesIds: ["GDPC1", "RSAFS", "INDPRO", "WEI"],
  },
  inflation: {
    title: "2. Inflation & Price Pressures",
    question: "Is inflation improving or worsening?",
    defaultSeriesIds: ["CPIAUCSL", "CPILFESL", "PCEPI", "PCEPILFE", "T5YIE"],
  },
  labor: {
    title: "3. Labor Market & Employment",
    question: "Is the labor market weakening or remaining tight?",
    defaultSeriesIds: ["UNRATE", "PAYEMS", "ICSA", "JTSJOL", "CES0500000003"],
  },
  policy: {
    title: "4. Monetary Policy & Rates",
    question: "Is monetary policy restrictive, neutral, or easing?",
    defaultSeriesIds: ["DFF", "DFEDTARU", "DGS2", "DGS10", "T10Y2Y", "T10Y3M"],
  },
  financial_conditions: {
    title: "5. Financial Conditions & Risk",
    question: "Are financial conditions tightening or easing?",
    defaultSeriesIds: ["NFCI", "BAMLH0A0HYM2", "BAMLC0O0CM", "DTWEXBGS", "VIXCLS"],
  },
};

export function getSeriesConfig(id: string): MacroSeriesConfig | undefined {
  return FRED_SERIES_REGISTRY[id];
}

export function getAllSeriesConfigs(): MacroSeriesConfig[] {
  return Object.values(FRED_SERIES_REGISTRY);
}

export function getSeriesConfigsByCategory(
  category: MacroCategory
): MacroSeriesConfig[] {
  return Object.values(FRED_SERIES_REGISTRY).filter(
    (series) => series.category === category
  );
}
