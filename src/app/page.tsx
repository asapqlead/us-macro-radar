"use client";

import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Calendar,
  ChevronRight,
  Coins,
  Compass,
  Gauge,
  Layers,
  Pin,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { TimeSeriesChart } from "@/components/ui/TimeSeriesChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { TraderBarometer } from "@/components/macro/TraderBarometer";
import {
  ApiResponse,
  CalendarResponse,
  DashboardResponse,
  MacroCategory,
  MetricSummary,
} from "@/types/macro";
import {
  calculateCommoditiesBarometer,
  calculateEquitiesBarometer,
  calculateRealYield,
  createRealYieldMetricSummary,
  getSeriesForLens,
  TraderLens,
} from "@/lib/macro/trader-signals";
import { cn, formatCalendarEventDateTime } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  });

const DEFAULT_PINNED_SERIES = [
  "REAL_YIELD_10Y",
  "DGS10",
  "DTWEXBGS",
  "BAMLH0A0HYM2",
  "VIXCLS",
  "T10Y2Y",
];

export default function DashboardPage() {
  const { data, isLoading, isValidating, mutate } = useSWR<
    ApiResponse<DashboardResponse>
  >("/api/fred/dashboard", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: calendarData } = useSWR<ApiResponse<CalendarResponse>>(
    "/api/calendar",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 120000 }
  );

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("REAL_YIELD_10Y");
  const [traderLens, setTraderLens] = useState<TraderLens>("all");
  const [pinnedSeries, setPinnedSeries] = useState<string[]>(DEFAULT_PINNED_SERIES);
  const [isClient, setIsClient] = useState(false);

  // Restore pinned cards from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("macro_radar_pinned_series");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPinnedSeries(parsed);
        }
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const togglePin = (seriesId: string) => {
    setPinnedSeries((prev) => {
      const next = prev.includes(seriesId)
        ? prev.filter((id) => id !== seriesId)
        : [...prev, seriesId];
      try {
        localStorage.setItem("macro_radar_pinned_series", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const dashboard = data?.data;
  const isMockMode = dashboard?.isMockData ?? false;
  const regime = dashboard?.regime;

  // Build metrics lookup map
  const rawMetricsMap = useMemo(() => {
    if (!dashboard) return {};
    const map: Record<string, MetricSummary> = {};
    for (const panel of Object.values(dashboard.panels)) {
      for (const m of panel.metrics) {
        map[m.seriesId] = m;
      }
    }
    return map;
  }, [dashboard]);

  // Derive Real Yield metric
  const realYieldData = useMemo(() => {
    return calculateRealYield(rawMetricsMap);
  }, [rawMetricsMap]);

  const realYieldMetric = useMemo(() => {
    if (!realYieldData || !dashboard) return null;
    return createRealYieldMetricSummary(realYieldData, dashboard.lastUpdated);
  }, [realYieldData, dashboard]);

  // Combined metrics map including synthetic Real Yield
  const metricsMap = useMemo(() => {
    const map = { ...rawMetricsMap };
    if (realYieldMetric) {
      map["REAL_YIELD_10Y"] = realYieldMetric;
    }
    return map;
  }, [rawMetricsMap, realYieldMetric]);

  const allMetrics: MetricSummary[] = useMemo(() => {
    const list = Object.values(metricsMap);
    return list;
  }, [metricsMap]);

  // Find currently charted metric
  const selectedMetric =
    metricsMap[selectedSeriesId] ||
    (realYieldMetric ? realYieldMetric : allMetrics[0]);

  // Trader Barometers
  const commoditiesBarometer = useMemo(() => {
    return calculateCommoditiesBarometer(metricsMap);
  }, [metricsMap]);

  const equitiesBarometer = useMemo(() => {
    return calculateEquitiesBarometer(metricsMap);
  }, [metricsMap]);

  // Next high-impact calendar catalyst
  const nextMajorEvent = useMemo(() => {
    const events = calendarData?.data?.events || [];
    return events.find((e) => e.isMajor) || events[0] || null;
  }, [calendarData]);

  const availableSeriesIds = useMemo(() => {
    return Object.keys(metricsMap);
  }, [metricsMap]);

  const filteredSeriesIds = useMemo(() => {
    return getSeriesForLens(traderLens, availableSeriesIds);
  }, [traderLens, availableSeriesIds]);

  const panelOrder: MacroCategory[] = [
    "growth",
    "inflation",
    "labor",
    "policy",
    "financial_conditions",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 dark:bg-black dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors">
      <Header
        isConfigured={!isMockMode}
        lastUpdated={dashboard?.lastUpdated}
        onRefresh={() => mutate()}
        isRefreshing={isValidating}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ============================================================== */}
        {/* TOP STATUS BAR: MACRO REGIME & MARKET DIRECTION */}
        {/* ============================================================== */}
        <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100/80 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900/90 dark:via-zinc-950/90 dark:to-black p-5 sm:p-6 shadow-xs dark:shadow-xl backdrop-blur-md transition-colors">
          {isLoading || !regime ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5" />
                    Current Macro Regime
                  </span>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                      regime.confidenceLevel === "High"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30"
                        : regime.confidenceLevel === "Medium"
                        ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30"
                        : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30"
                    )}
                  >
                    {regime.confidenceLevel} Confidence ({regime.confidenceScore}%)
                  </span>

                  <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">•</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                    Growth: <strong className="text-zinc-800 dark:text-zinc-200">{regime.growthState}</strong> • Inflation:{" "}
                    <strong className="text-zinc-800 dark:text-zinc-200">{regime.inflationState}</strong>
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                    {regime.title}
                  </h1>
                </div>

                {/* Market-Direction Assessment */}
                <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed max-w-4xl pt-1">
                  💡 {regime.marketAssessment}
                </p>

                {/* Next Upcoming Catalyst Pill */}
                {nextMajorEvent && (() => {
                  const dt = formatCalendarEventDateTime(
                    nextMajorEvent.releaseDate,
                    nextMajorEvent.releaseTime,
                    "UTC+7"
                  );
                  return (
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20 px-2.5 py-1 rounded-lg font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        Next Catalyst: <strong className="font-semibold text-zinc-900 dark:text-white">{nextMajorEvent.title}</strong>
                        <span className="text-zinc-600 dark:text-zinc-400 font-mono">• {dt.specificDate} at {dt.timeString}</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">({nextMajorEvent.consensus} exp)</span>
                      </span>
                      <Link
                        href="/calendar"
                        className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-0.5 text-[11px] underline underline-offset-2"
                      >
                        <span>Scenario Trees</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })()}
              </div>

              {/* Quick links & regime deep-dive button */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <Link
                  href="/regime"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 active:scale-[0.98] transition-all"
                >
                  <span>Explore Regime Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/brief"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white active:scale-[0.98] transition-all shadow-xs"
                >
                  <span>Weekly Macro Brief</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* ASSET-CENTRIC PERSPECTIVE SELECTOR (TRADER LENSES) */}
        {/* ============================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80 backdrop-blur-md">
            {/* Primary Lens Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider mr-1 hidden sm:inline">
                Macro Lens:
              </span>

              <button
                onClick={() => setTraderLens("all")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] whitespace-nowrap",
                  traderLens === "all"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                )}
              >
                🌐 All Macro (5 Pillars)
              </button>

              <button
                onClick={() => setTraderLens("commodities")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] whitespace-nowrap flex items-center gap-1.5",
                  traderLens === "commodities"
                    ? "bg-amber-500 text-black font-bold shadow-xs"
                    : "text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400/90 dark:hover:text-amber-300 dark:hover:bg-amber-950/30"
                )}
              >
                <Coins className="h-3.5 w-3.5" />
                <span>Commodities & Real Assets (Metals)</span>
              </button>

              <button
                onClick={() => setTraderLens("equities")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] whitespace-nowrap flex items-center gap-1.5",
                  traderLens === "equities"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-blue-700 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30"
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Equities & Risk Assets (Stocks)</span>
              </button>
            </div>
          </div>

          {/* Dedicated Barometer when an asset lens is selected */}
          {traderLens !== "all" && (
            <TraderBarometer
              lens={traderLens}
              commoditiesBarometer={commoditiesBarometer}
              equitiesBarometer={equitiesBarometer}
              onSelectSeries={(id) => setSelectedSeriesId(id)}
              selectedSeriesId={selectedSeriesId}
            />
          )}
        </section>

        {/* ============================================================== */}
        {/* INTERACTIVE HISTORICAL CHART PREVIEW */}
        {/* ============================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-600 dark:text-zinc-400">
                Active Indicator Historical Deep-Dive
              </h2>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              Select any metric card or barometer driver to switch chart
            </span>
          </div>

          <TimeSeriesChart
            data={selectedMetric?.history || []}
            config={selectedMetric?.config}
            isLoading={isLoading}
            height={320}
          />
        </section>

        {/* ============================================================== */}
        {/* PINNED TRADER WATCHLIST (QUICK GLANCE) */}
        {/* ============================================================== */}
        {isClient && pinnedSeries.length > 0 && (
          <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-amber-500 fill-amber-500 rotate-45" />
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-900 dark:text-zinc-200">
                  Trader Pinned Watchlist
                </h2>
                <span className="rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 text-[10px] font-mono">
                  {pinnedSeries.length} Pinned
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Click any card to chart • Click pin icon to toggle
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedSeries.map((id) => {
                const metric = metricsMap[id];
                if (!metric) return null;
                return (
                  <MetricCard
                    key={id}
                    summary={metric}
                    isSelected={metric.seriesId === selectedSeriesId}
                    isPinned={true}
                    onTogglePin={() => togglePin(metric.seriesId)}
                    onClick={() => setSelectedSeriesId(metric.seriesId)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* MAIN METRIC PANELS OR FILTERED ASSET VIEW */}
        {/* ============================================================== */}
        {traderLens === "all" ? (
          // Default: 5 Core Panels
          <div className="space-y-10">
            {panelOrder.map((catKey, panelIndex) => {
              const panel = dashboard?.panels[catKey];

              // In the policy panel, include the 10Y Real Yield at the top
              const metricsToDisplay =
                catKey === "policy" && realYieldMetric
                  ? [realYieldMetric, ...(panel?.metrics.filter((m) => m.seriesId !== "REAL_YIELD_10Y") || [])]
                  : panel?.metrics || [];

              return (
                <section key={catKey} className="space-y-4">
                  {/* Panel Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                          PANEL 0{panelIndex + 1}
                        </span>
                        <h2 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
                          {panel?.title || catKey.toUpperCase()}
                        </h2>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        Q: {panel?.question}
                      </p>
                    </div>

                    {panel && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden md:block max-w-md text-right">
                          {panel.statusSummary}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shrink-0",
                            panel.overallStatus === "improving"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : panel.overallStatus === "deteriorating"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          )}
                        >
                          {panel.overallStatus.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading || !panel
                      ? Array.from({ length: 4 }).map((_, idx) => (
                          <MetricCard key={idx} isLoading={true} />
                        ))
                      : metricsToDisplay.map((metric) => (
                          <MetricCard
                            key={metric.seriesId}
                            summary={metric}
                            isSelected={metric.seriesId === selectedSeriesId}
                            isPinned={pinnedSeries.includes(metric.seriesId)}
                            onTogglePin={() => togglePin(metric.seriesId)}
                            onClick={() => setSelectedSeriesId(metric.seriesId)}
                          />
                        ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          // Asset-Focused Filtered View
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
                  {traderLens === "commodities"
                    ? "Commodities & Real Assets Tracked Indicators"
                    : "Equities & Risk Premia Tracked Indicators"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Showing {filteredSeriesIds.length} macro series prioritized for{" "}
                  {traderLens === "commodities" ? "Precious Metals & Real Assets" : "Stocks & Risk Assets"}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSeriesIds.map((id) => {
                const metric = metricsMap[id];
                if (!metric) return null;
                return (
                  <MetricCard
                    key={id}
                    summary={metric}
                    isSelected={metric.seriesId === selectedSeriesId}
                    isPinned={pinnedSeries.includes(metric.seriesId)}
                    onTogglePin={() => togglePin(metric.seriesId)}
                    onClick={() => setSelectedSeriesId(metric.seriesId)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Disclaimer constraint */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-400 leading-relaxed shadow-xs">
          <p>
            <strong className="text-zinc-900 dark:text-zinc-300">Analytical Disclaimer:</strong> US Macro Radar is an informational macroeconomic tracking and decision-support cockpit. It does not provide personalized investment advice or guaranteed market predictions. All scenarios represent probabilistic macroeconomic frameworks derived from official Federal Reserve and Bureau of Labor Statistics historical series.
          </p>
        </div>
      </main>
    </div>
  );
}
