# US Macro Radar

An institutional-grade, personal U.S. macroeconomic radar dashboard built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Recharts**, **SWR**, **Zod**, and the **St. Louis Federal Reserve Economic Data (FRED) API**.

US Macro Radar answers five critical macroeconomic questions at a glance:
1. **Growth**: Is U.S. economic growth accelerating or slowing?
2. **Inflation**: Is inflation cooling toward target or re-accelerating?
3. **Labor**: Is the labor market loosening or remaining historically tight?
4. **Policy**: Is monetary policy restrictive, neutral, or actively easing?
5. **Financial Conditions**: Are financial markets and credit conditions tightening or supportive?

---

## Architecture & Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with dark-mode financial terminal palette
- **Data Visualization**: [Recharts](https://recharts.org/) (responsive SVG line/area charts, gradient fills, benchmark references)
- **Data Source**: St. Louis Fed [FRED API](https://fred.stlouisfed.org/docs/api/fred/) (24 series covered across all five macro categories)
- **Client Fetching & Cache**: [SWR](https://swr.vercel.app/) with deduplication, background revalidation, and zero client token exposure
- **Schema Validation**: [Zod](https://zod.dev/) for server API response contracts and data normalization
- **Date Handling**: [date-fns](https://date-fns.org/) for local timezone formatting and weekly calendars
- **Unit Testing**: [Vitest](https://vitest.dev/) covering macro regime scoring, status engine, and transformation mathematics
- **Deployment**: [Vercel](https://vercel.com/) ready with edge caching and static optimization

---

## Five Core Pages

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | **Macro Dashboard** | One-page cockpit with top status bar (active regime, confidence, market takeaway) and five category panels with interactive metric cards and historical charts. |
| `/calendar` | **Economic Calendar** | Weekly schedule of high-impact releases with consensus, previous, and conditional scenario trees (Bullish / Base / Bearish) mapping cross-asset implications. |
| `/indicators` | **Indicator Library** | Searchable directory across 24 FRED series with range selectors (1Y, 3Y, 5Y, 10Y) and transformation toggles (Level, MoM Change, YoY %). |
| `/regime` | **Market Regime** | Quadrant classifier (*Goldilocks*, *Reflation*, *Stagflation*, *Disinflationary Slowdown*) with cross-asset playbook and falsification checklists. |
| `/brief` | **Weekly Macro Brief** | Automated institutional intelligence memo synthesizing what happened last week, what matters this week, scenario probabilities, and key risks. |

---

## 24 FRED Macroeconomic Series

### 1. Growth & Output
- `GDPC1`: Real Gross Domestic Product (BEA)
- `RSAFS`: Advance Real Retail & Food Services Sales YoY (Census)
- `INDPRO`: Industrial Production Index YoY (Federal Reserve Board)
- `WEI`: Weekly Economic Index (NY Fed)

### 2. Inflation & Prices
- `CPIAUCSL`: Headline Consumer Price Index YoY (BLS)
- `CPILFESL`: Core CPI YoY (ex-Food & Energy) (BLS)
- `PCEPI`: Headline PCE Price Index YoY (BEA)
- `PCEPILFE`: Core PCE Price Index YoY (BEA - Fed Target)
- `T5YIE`: 5-Year Breakeven Inflation Rate (St. Louis Fed)

### 3. Labor Market
- `UNRATE`: Civilian Unemployment Rate (BLS)
- `PAYEMS`: Total Nonfarm Payrolls MoM Change (BLS)
- `ICSA`: Initial Jobless Claims (DOL)
- `JTSJOL`: Job Openings (JOLTS) (BLS)
- `CES0500000003`: Average Hourly Earnings YoY (BLS)

### 4. Monetary Policy & Rates
- `DFF`: Federal Funds Effective Rate (NY Fed)
- `DFEDTARU`: Federal Funds Target Range Upper Limit (FRB)
- `DGS2`: 2-Year Treasury Constant Maturity Yield (FRB)
- `DGS10`: 10-Year Treasury Constant Maturity Yield (FRB)
- `T10Y2Y`: 10-Year Minus 2-Year Treasury Spread (Yield Curve Inversion Gauge)
- `T10Y3M`: 10-Year Minus 3-Month Treasury Spread (Fed Recession Probability Gauge)

### 5. Financial Conditions & Risk
- `NFCI`: Chicago Fed National Financial Conditions Index
- `BAMLH0A0HYM2`: ICE BofA US High Yield Index OAS (Credit Spread)
- `BAMLC0O0CM`: ICE BofA US Corporate Index OAS (Investment Grade Spread)
- `DTWEXBGS`: Trade-Weighted U.S. Dollar Index (Broad Goods & Services)
- `VIXCLS`: CBOE Volatility Index (VIX)

---

## Getting Started

### 1. Prerequisites
- **Node.js** >= 18.17 (v20+ recommended)
- **npm**, **pnpm**, or **yarn**

### 2. Installation
Clone repository and install dependencies:
```bash
git clone https://github.com/your-username/macro_analyst.git
cd macro_analyst
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your free St. Louis Fed FRED API key:
```env
# Request free key at: https://fred.stlouisfed.org/docs/api/api_key.html
FRED_API_KEY=your_actual_fred_api_key_here
```
> **Note**: If `FRED_API_KEY` is omitted or left as a placeholder, the system automatically runs in **Deterministic Demo Fallback Mode** with realistic historical series so you can test all features without an API key immediately.

### 4. Local Development
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Unit Tests
Execute the Vitest test suite:
```bash
npm test
```

### 6. Production Build
Create an optimized production bundle:
```bash
npm run build
npm run start
```

---

## Server Route Handlers

All FRED API queries are executed server-side to ensure `FRED_API_KEY` is never leaked to the client browser. Responses are cached with `Cache-Control` headers and Next.js data caching.

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/fred/dashboard` | `GET` | — | Aggregates all 5 category panels, status evaluations, and active regime classification. |
| `/api/regime` | `GET` | — | Returns regime classification, continuous scores, asset playbooks, and falsification triggers. |
| `/api/calendar` | `GET` | — | Returns upcoming U.S. releases with scenario matrices and cross-asset implications. |
| `/api/brief` | `GET` | — | Synthesizes an automated weekly institutional macro memo. |
| `/api/fred/series/[seriesId]` | `GET` | `units`, `frequency`, `observation_start` | Returns processed summary, history, and sparkline for any series. |
| `/api/fred` | `GET` | `series_id`, `series_ids`, `mode`, `units` | Versatile batch or single series query endpoint. |

---

## Vercel Deployment

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Under **Project Settings > Environment Variables**, add:
   - `FRED_API_KEY` = your St. Louis Fed API key
4. Deploy. Vercel automatically compiles the Next.js App Router application with automatic ISR, edge caching, and serverless route handlers.

---

## License & Disclaimers

This software is for educational, research, and macroeconomic informational tracking purposes only. It does not provide personalized investment advice, guaranteed market forecasts, or trade recommendations. All data is sourced via public API endpoints from the Federal Reserve Bank of St. Louis, U.S. Bureau of Economic Analysis, U.S. Bureau of Labor Statistics, and U.S. Department of Labor.
