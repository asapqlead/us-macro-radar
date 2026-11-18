"use client";

import React from "react";
import {
  Coins,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Gauge,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { CommoditiesBarometer, EquitiesBarometer } from "@/lib/macro/trader-signals";
import { cn } from "@/lib/utils";

interface TraderBarometerProps {
  lens: "commodities" | "equities";
  commoditiesBarometer: CommoditiesBarometer;
  equitiesBarometer: EquitiesBarometer;
  onSelectSeries: (seriesId: string) => void;
  selectedSeriesId: string;
}

export function TraderBarometer({
  lens,
  commoditiesBarometer,
  equitiesBarometer,
  onSelectSeries,
  selectedSeriesId,
}: TraderBarometerProps) {
  if (lens === "commodities") {
    const { score, stance, realYieldValue, dollarValue, summary, drivers } = commoditiesBarometer;

    const isBull = stance === "Bullish Tailwind";
    const isBear = stance === "Bearish Headwind";

    return (
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-zinc-50 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-amber-950/20 dark:via-zinc-950 dark:to-zinc-900/80 p-5 sm:p-6 shadow-xs dark:shadow-xl backdrop-blur-md space-y-5 transition-colors">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/60 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 bg-amber-100/70 border border-amber-300/60 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20 font-semibold px-2 py-0.5 rounded">
                  Macro Barometer
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Precious Metals & Real Assets</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-0.5">
                Monetary & Real Yields Posture
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stance Badge */}
            <div
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold border flex items-center gap-1.5 shadow-xs",
                isBull
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                  : isBear
                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
              )}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span>{stance}</span>
            </div>

            {/* Score Pill */}
            <div className="rounded-xl border border-amber-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300 shadow-xs">
              <span className="text-zinc-500 text-[10px] block">SIGNAL SCORE</span>
              <span className={cn("font-bold", score > 0 ? "text-emerald-600 dark:text-emerald-400" : score < 0 ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-200")}>
                {score > 0 ? `+${score}` : score} / 100
              </span>
            </div>
          </div>
        </div>

        {/* 3 Driver Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Driver 1: Real Yields */}
          <div
            onClick={() => onSelectSeries("REAL_YIELD_10Y")}
            role="button"
            tabIndex={0}
            className={cn(
              "rounded-xl border p-3.5 space-y-2 cursor-pointer transition-all duration-150 text-left",
              selectedSeriesId === "REAL_YIELD_10Y"
                ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-500/30 dark:border-amber-500/60 dark:bg-amber-950/20 dark:ring-amber-500/40"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700 shadow-xs"
            )}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">10Y Real Yield</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {realYieldValue !== null ? `${realYieldValue.toFixed(2)}%` : "N/A"}
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>{drivers.realYields.label}</span>
              <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {drivers.realYields.detail}
            </p>
          </div>

          {/* Driver 2: US Dollar */}
          <div
            onClick={() => onSelectSeries("DTWEXBGS")}
            role="button"
            tabIndex={0}
            className={cn(
              "rounded-xl border p-3.5 space-y-2 cursor-pointer transition-all duration-150 text-left",
              selectedSeriesId === "DTWEXBGS"
                ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/30 dark:border-blue-500/60 dark:bg-blue-950/20 dark:ring-blue-500/40"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700 shadow-xs"
            )}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Trade-Weighted USD</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {dollarValue !== null ? dollarValue.toFixed(1) : "N/A"}
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>{drivers.dollar.label}</span>
              <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {drivers.dollar.detail}
            </p>
          </div>

          {/* Driver 3: Risk Hedge & Breakevens */}
          <div
            onClick={() => onSelectSeries("T5YIE")}
            role="button"
            tabIndex={0}
            className={cn(
              "rounded-xl border p-3.5 space-y-2 cursor-pointer transition-all duration-150 text-left",
              selectedSeriesId === "T5YIE"
                ? "border-purple-500 bg-purple-50/60 ring-1 ring-purple-500/30 dark:border-purple-500/60 dark:bg-purple-950/20 dark:ring-purple-500/40"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700 shadow-xs"
            )}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">5Y Breakeven Inflation</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {commoditiesBarometer.breakevenValue !== null
                  ? `${commoditiesBarometer.breakevenValue.toFixed(2)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>{drivers.riskHedge.label}</span>
              <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {drivers.riskHedge.detail}
            </p>
          </div>
        </div>

        {/* Bottom Takeaway */}
        <div className="rounded-xl border border-amber-200/80 bg-white/80 dark:border-zinc-800/70 dark:bg-zinc-950/70 p-3.5 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <strong className="text-amber-700 dark:text-amber-400">Trading Takeaway:</strong> {summary}
          </p>
        </div>
      </div>
    );
  }

  // Equities Lens
  const { score, stance, nfciValue, hyOasValue, vixValue, summary, drivers } = equitiesBarometer;
  const isBull = stance === "Risk-On (Multiple Expansion)";
  const isBear = stance === "Risk-Off (Defensive)";

  return (
    <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-zinc-50 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-blue-950/20 dark:via-zinc-950 dark:to-zinc-900/80 p-5 sm:p-6 shadow-xs dark:shadow-xl backdrop-blur-md space-y-5 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-200/60 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-300/60 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 font-semibold px-2 py-0.5 rounded">
                Macro Barometer
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">S&P 500, Nasdaq & Risk Assets</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-0.5">
              Equity Risk Premia & Liquidity
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stance Badge */}
          <div
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold border flex items-center gap-1.5 shadow-xs",
              isBull
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                : isBear
                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
            )}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>{stance}</span>
          </div>

          {/* Score Pill */}
          <div className="rounded-xl border border-blue-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300 shadow-xs">
            <span className="text-zinc-500 text-[10px] block">SIGNAL SCORE</span>
            <span className={cn("font-bold", score > 0 ? "text-emerald-600 dark:text-emerald-400" : score < 0 ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-200")}>
              {score > 0 ? `+${score}` : score} / 100
            </span>
          </div>
        </div>
      </div>

      {/* 3 Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Driver 1: Chicago Fed NFCI */}
        <div
          onClick={() => onSelectSeries("NFCI")}
          role="button"
          tabIndex={0}
          className={cn(
            "rounded-xl border p-3.5 space-y-2 cursor-pointer transition-all duration-150 text-left",
            selectedSeriesId === "NFCI"
              ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/30 dark:border-blue-500/60 dark:bg-blue-950/20 dark:ring-blue-500/40"
              : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700 shadow-xs"
          )}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Financial Conditions (NFCI)</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {nfciValue !== null ? nfciValue.toFixed(2) : "N/A"}
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span>{drivers.liquidity.label}</span>
            <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {drivers.liquidity.detail}
          </p>
        </div>

        {/* Driver 2: High Yield Spread */}
        <div
          onClick={() => onSelectSeries("BAMLH0A0HYM2")}
          role="button"
          tabIndex={0}
          className={cn(
            "rounded-xl border p-3.5 space-y-2 cursor-pointer transition-all duration-150 text-left",
            selectedSeriesId === "BAMLH0A0HYM2"
              ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30 dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:ring-emerald-500/40"
              : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700 shadow-xs"
          )}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">High Yield Credit Spread</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {hyOasValue !== null ? `${hyOasValue.toFixed(2)}%` : "N/A"}
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span>{drivers.credit.label}</span>
            <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {drivers.credit.detail}
          </p>
        </div>

        {/* Driver 3: Volatility (VIX) */}
        <div
          onClick={() => onSelectSeries("VIXCLS")}
          role="button"
          tabIndex={0}
          className={cn(
            "rounded-xl border p-3.5 space-y-2 cursor-pointer transition-all duration-150 text-left",
            selectedSeriesId === "VIXCLS"
              ? "border-sky-500 bg-sky-50/60 ring-1 ring-sky-500/30 dark:border-sky-500/60 dark:bg-sky-950/20 dark:ring-sky-500/40"
              : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700 shadow-xs"
          )}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Equity Volatility (VIX)</span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
              {vixValue !== null ? vixValue.toFixed(1) : "N/A"}
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span>{drivers.volatility.label}</span>
            <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {drivers.volatility.detail}
          </p>
        </div>
      </div>

      {/* Bottom Takeaway */}
      <div className="rounded-xl border border-blue-200/80 bg-white/80 dark:border-zinc-800/70 dark:bg-zinc-950/70 p-3.5 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <strong className="text-blue-700 dark:text-blue-400">Trading Takeaway:</strong> {summary}
        </p>
      </div>
    </div>
  );
}
