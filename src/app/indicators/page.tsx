"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Activity,
  Calendar,
  ExternalLink,
  Layers,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TimeSeriesChart } from "@/components/ui/TimeSeriesChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { FRED_SERIES_REGISTRY } from "@/config/fred-series";
import {
  ApiResponse,
  MacroCategory,
  MacroSeriesConfig,
  MetricSummary,
} from "@/types/macro";
import { cn, formatDate, formatMetricValue } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load indicator series");
    return res.json();
  });

type TransformType = "lin" | "chg" | "pc1";

export default function IndicatorsPage() {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("T10Y2Y");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [transformation, setTransformation] = useState<TransformType>("lin");

  // Fetch the selected series with dynamic transformation
  const { data, isLoading, mutate, isValidating } = useSWR<
    ApiResponse<MetricSummary>
  >(`/api/fred/series/${selectedSeriesId}?units=${transformation}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const allConfigs = useMemo(() => Object.values(FRED_SERIES_REGISTRY), []);

  // Filter series library list
  const filteredConfigs = useMemo(() => {
    return allConfigs.filter((cfg) => {
      const matchesCategory =
        categoryFilter === "all" || cfg.category === categoryFilter;
      const matchesQuery =
        cfg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cfg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cfg.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [allConfigs, categoryFilter, searchQuery]);

  const metricSummary = data?.data;
  const currentConfig =
    metricSummary?.config || FRED_SERIES_REGISTRY[selectedSeriesId];

  // Calculate historical min and max
  const { minVal, maxVal, currentVal } = useMemo(() => {
    if (!metricSummary?.history || metricSummary.history.length === 0) {
      return { minVal: null, maxVal: null, currentVal: null };
    }
    const vals = metricSummary.history.map((h) => h.value);
    return {
      minVal: Math.min(...vals),
      maxVal: Math.max(...vals),
      currentVal: vals[vals.length - 1],
    };
  }, [metricSummary]);

  const categories: { label: string; value: string }[] = [
    { label: "All Indicators", value: "all" },
    { label: "Growth", value: "growth" },
    { label: "Inflation", value: "inflation" },
    { label: "Labor", value: "labor" },
    { label: "Policy & Rates", value: "policy" },
    { label: "Financial Conditions", value: "financial_conditions" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 dark:bg-black dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors">
      <Header
        lastUpdated={metricSummary?.lastUpdated}
        onRefresh={() => mutate()}
        isRefreshing={isValidating}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Intro */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Activity className="h-4 w-4" />
            <span>Macro Research Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Comprehensive Indicator Library
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Search and chart the 24 core Federal Reserve Economic Data (FRED) series with interactive multi-decade history, transformation toggles (level vs period change vs YoY), and analytical interpretations.
          </p>
        </div>

        {/* 2-Column Layout: Sidebar Selector & Main Chart View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Searchable Indicator Selector (4 cols) */}
          <div className="lg:col-span-4 rounded-xl border border-zinc-200 bg-white p-4 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search by series ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                    categoryFilter === cat.value
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* List of Indicators */}
            <div className="max-h-[600px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredConfigs.map((cfg) => {
                const isSelected = cfg.id === selectedSeriesId;
                return (
                  <div
                    key={cfg.id}
                    onClick={() => setSelectedSeriesId(cfg.id)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all flex flex-col gap-1 text-left",
                      isSelected
                        ? "bg-blue-50/70 border border-blue-500/40 shadow-xs dark:bg-zinc-800/90 dark:border-blue-500/50"
                        : "hover:bg-zinc-50/80 border border-transparent dark:hover:bg-zinc-900/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {cfg.id}
                      </span>
                      <span className="text-[10px] uppercase font-medium text-zinc-400 dark:text-zinc-500">
                        {cfg.frequency}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {cfg.shortName || cfg.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 capitalize">
                      Category: {cfg.category.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Time Series Deep-Dive & Transformation Matrix (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header with Title and Transformation Toggles */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 px-2 py-0.5 rounded">
                      {currentConfig.id}
                    </span>
                    <span className="text-xs text-zinc-300 dark:text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {currentConfig.source}
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    {currentConfig.name}
                  </h2>
                </div>

                {/* Transformation Toggle Buttons */}
                <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 self-start sm:self-auto">
                  <button
                    onClick={() => setTransformation("lin")}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      transformation === "lin"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    )}
                  >
                    Level
                  </button>
                  <button
                    onClick={() => setTransformation("chg")}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      transformation === "chg"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    )}
                  >
                    Period Δ
                  </button>
                  <button
                    onClick={() => setTransformation("pc1")}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      transformation === "pc1"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    )}
                  >
                    YoY %
                  </button>
                </div>
              </div>

              {/* Statistics Strip: Latest, Min, Max, Benchmark */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-200 dark:border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Latest Observation
                  </span>
                  <span className="text-lg font-bold font-mono text-zinc-950 dark:text-white mt-0.5 block">
                    {formatMetricValue(
                      metricSummary?.latestValue,
                      currentConfig.units,
                      currentConfig.precision ?? 2
                    )}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {formatDate(metricSummary?.latestDate || "")}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-200 dark:border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Historical Range Min
                  </span>
                  <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
                    {minVal !== null
                      ? formatMetricValue(
                          minVal,
                          currentConfig.units,
                          currentConfig.precision ?? 2
                        )
                      : "N/A"}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Sample minimum</span>
                </div>

                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-200 dark:border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Historical Range Max
                  </span>
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {maxVal !== null
                      ? formatMetricValue(
                          maxVal,
                          currentConfig.units,
                          currentConfig.precision ?? 2
                        )
                      : "N/A"}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Sample maximum</span>
                </div>

                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-200 dark:border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Status Assessment
                  </span>
                  <span
                    className={cn(
                      "text-base font-bold capitalize mt-0.5 block",
                      metricSummary?.status === "improving"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : metricSummary?.status === "deteriorating"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {metricSummary?.status || "Stable"}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {currentConfig.frequency} frequency
                  </span>
                </div>
              </div>

              {/* Time Series Recharts Component */}
              <TimeSeriesChart
                data={metricSummary?.history || []}
                config={currentConfig}
                isLoading={isLoading}
                height={380}
              />

              {/* Why this indicator matters */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 p-4 space-y-1.5">
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Why This Macro Indicator Matters
                </h4>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {currentConfig.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <span>
                    St. Louis Fed Source ID: <strong className="text-zinc-700 dark:text-zinc-300">{currentConfig.id}</strong>
                  </span>
                  <a
                    href={`https://fred.stlouisfed.org/series/${currentConfig.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    View Official FRED Series <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
