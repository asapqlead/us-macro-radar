"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Compass,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Info,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { TimeSeriesChart } from "@/components/ui/TimeSeriesChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiResponse, DashboardResponse, MacroCategory, MetricSummary } from "@/types/macro";
import { cn } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  });

export default function DashboardPage() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ApiResponse<DashboardResponse>
  >("/api/fred/dashboard", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("T10Y2Y");

  const dashboard = data?.data;
  const isMockMode = dashboard?.isMockData ?? false;
  const regime = dashboard?.regime;

  // Find currently selected metric across all panels
  const allMetrics: MetricSummary[] = dashboard
    ? Object.values(dashboard.panels).flatMap((p) => p.metrics)
    : [];

  const selectedMetric =
    allMetrics.find((m) => m.seriesId === selectedSeriesId) || allMetrics[0];

  const panelOrder: MacroCategory[] = [
    "growth",
    "inflation",
    "labor",
    "policy",
    "financial_conditions",
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-950/90 to-black p-5 sm:p-6 shadow-xl backdrop-blur-md">
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
                  <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5" />
                    Current Macro Regime
                  </span>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                      regime.confidenceLevel === "High"
                        ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
                        : regime.confidenceLevel === "Medium"
                        ? "bg-blue-500/10 text-blue-400 ring-blue-500/30"
                        : "bg-amber-500/10 text-amber-400 ring-amber-500/30"
                    )}
                  >
                    {regime.confidenceLevel} Confidence ({regime.confidenceScore}%)
                  </span>

                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="text-xs text-zinc-400 hidden sm:inline">
                    Growth: <strong className="text-zinc-200">{regime.growthState}</strong> • Inflation: <strong className="text-zinc-200">{regime.inflationState}</strong>
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {regime.title}
                  </h1>
                </div>

                {/* Market-Direction Assessment */}
                <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed max-w-4xl pt-1">
                  💡 {regime.marketAssessment}
                </p>
              </div>

              {/* Quick links & regime deep-dive button */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <Link
                  href="/regime"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors"
                >
                  <span>Explore Regime Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/brief"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span>Weekly Macro Brief</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* INTERACTIVE HISTORICAL CHART PREVIEW */}
        {/* ============================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">
                Active Indicator Historical Deep-Dive
              </h2>
            </div>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Select any metric card below to switch chart
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
        {/* FIVE CORE PANELS */}
        {/* ============================================================== */}
        <div className="space-y-10">
          {panelOrder.map((catKey, panelIndex) => {
            const panel = dashboard?.panels[catKey];

            return (
              <section key={catKey} className="space-y-4">
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        PANEL 0{panelIndex + 1}
                      </span>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {panel?.title || catKey.toUpperCase()}
                      </h2>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-blue-400">
                      Q: {panel?.question}
                    </p>
                  </div>

                  {panel && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400 hidden md:block max-w-md text-right">
                        {panel.statusSummary}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shrink-0",
                          panel.overallStatus === "improving"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : panel.overallStatus === "deteriorating"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}
                      >
                        {panel.overallStatus.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metric Cards Grid: Desktop 3 cols, Tablet 2 cols, Mobile 1 col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading || !panel
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <MetricCard key={idx} isLoading={true} />
                      ))
                    : panel.metrics.map((metric) => (
                        <MetricCard
                          key={metric.seriesId}
                          summary={metric}
                          isSelected={metric.seriesId === selectedSeriesId}
                          onClick={() => setSelectedSeriesId(metric.seriesId)}
                        />
                      ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Disclaimer constraint */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-300">Analytical Disclaimer:</strong> US Macro Radar is an informational macroeconomic tracking and decision-support tool. It does not provide personalized investment advice or guaranteed market predictions. All scenarios represent probabilistic macroeconomic frameworks derived from official Federal Reserve and Bureau of Labor Statistics historical series.
          </p>
        </div>
      </main>
    </div>
  );
}
