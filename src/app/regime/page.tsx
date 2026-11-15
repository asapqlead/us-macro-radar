"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  FileCheck2,
  HelpCircle,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiResponse, RegimeClassification } from "@/types/macro";
import { cn } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load macro regime");
    return res.json();
  });

export default function RegimePage() {
  const { data, isLoading, mutate, isValidating } = useSWR<
    ApiResponse<RegimeClassification>
  >("/api/regime", fetcher);

  const regime = data?.data;

  const quadrants = [
    {
      id: "goldilocks",
      title: "Goldilocks",
      growth: "Stable / Trend Growth",
      inflation: "Falling Inflation",
      desc: "Accommodative policy, expanding multiples, optimal for equities & high yield.",
      color: "border-emerald-500/30 bg-emerald-950/10 text-emerald-400",
      activeColor: "ring-2 ring-emerald-500 bg-emerald-950/30",
    },
    {
      id: "reflation",
      title: "Reflation",
      growth: "Strong / Accelerating Growth",
      inflation: "Rising Inflation",
      desc: "Commodities & cyclicals lead; yields push higher; bond prices fall.",
      color: "border-blue-500/30 bg-blue-950/10 text-blue-400",
      activeColor: "ring-2 ring-blue-500 bg-blue-950/30",
    },
    {
      id: "disinflationary_slowdown",
      title: "Disinflationary Slowdown",
      growth: "Weak / Slowing Growth",
      inflation: "Falling Inflation",
      desc: "Treasuries & duration rally; corporate earnings face downgrades.",
      color: "border-sky-500/30 bg-sky-950/10 text-sky-400",
      activeColor: "ring-2 ring-sky-500 bg-sky-950/30",
    },
    {
      id: "stagflation",
      title: "Stagflation",
      growth: "Weak / Contracting Growth",
      inflation: "Rising Inflation",
      desc: "Hostile for 60/40; cash, gold, and real assets outperform.",
      color: "border-rose-500/30 bg-rose-950/10 text-rose-400",
      activeColor: "ring-2 ring-rose-500 bg-rose-950/30",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header
        lastUpdated={regime?.lastUpdated}
        onRefresh={() => mutate()}
        isRefreshing={isValidating}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
            <Compass className="h-4 w-4" />
            <span>Macroeconomic Regime Classifier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Macro Environment & Asset Allocation Matrix
          </h1>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Classifies current U.S. economic momentum across growth and inflation coordinates to calibrate asset class stances across equities, duration, currencies, and real assets.
          </p>
        </div>

        {/* Hero Regime Card */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-6 sm:p-8 shadow-xl backdrop-blur-md">
          {isLoading || !regime ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-96" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Active Classified Regime
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {regime.title}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-center">
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">
                      Confidence Score
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      {regime.confidenceScore}% ({regime.confidenceLevel})
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-center">
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">
                      Growth State
                    </span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {regime.growthState}
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-center">
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">
                      Inflation State
                    </span>
                    <span className="text-base font-bold text-blue-400 font-mono">
                      {regime.inflationState}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Market-Direction Assessment
                </h3>
                <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed">
                  {regime.marketAssessment}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  What Changed Since Last Update
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {regime.whatChanged}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4 Quadrants Interactive Overview */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            The 4 Macro Regimes Quadrant Map
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quadrants.map((quad) => {
              const isCurrent = regime?.regime === quad.id;
              return (
                <div
                  key={quad.id}
                  className={cn(
                    "rounded-xl border p-5 space-y-3 transition-all",
                    quad.color,
                    isCurrent && quad.activeColor
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">
                      {quad.title}
                    </h3>
                    {isCurrent && (
                      <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs space-y-1 font-mono text-zinc-300">
                    <p>• {quad.growth}</p>
                    <p>• {quad.inflation}</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-1 border-t border-zinc-800/50">
                    {quad.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Supporting vs Contradictory Indicators */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supporting Evidence */}
          <div className="rounded-xl border border-emerald-950/80 bg-zinc-950 p-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <h2 className="text-sm font-bold uppercase tracking-wide">
                Key Supporting Indicators
              </h2>
            </div>
            <div className="space-y-3">
              {regime?.supportingIndicators.map((item) => (
                <div
                  key={item.seriesId}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-200">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {item.latestValue}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contradictory / Divergent Signals */}
          <div className="rounded-xl border border-amber-950/80 bg-zinc-950 p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-sm font-bold uppercase tracking-wide">
                Key Contradictory Signals (Risk Factors)
              </h2>
            </div>
            <div className="space-y-3">
              {regime?.contradictoryIndicators.map((item) => (
                <div
                  key={item.seriesId}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-200">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {item.latestValue}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Asset Class Implications */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Cross-Asset Allocation Playbook
              </h2>
              <p className="text-xs text-zinc-400">
                Strategic asset class positioning tailored to the {regime?.title || "current macro environment"}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regime?.assetImplications.map((impl) => {
              const isBull = impl.stance === "Bullish";
              const isBear = impl.stance === "Bearish";

              return (
                <div
                  key={impl.asset}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white">
                        {impl.asset}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                          isBull
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isBear
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        )}
                      >
                        {impl.stance}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                      {impl.rationale}
                    </p>
                  </div>

                  {impl.topSectors && impl.topSectors.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800 text-[11px]">
                      <span className="text-zinc-500">Favored Sectors:</span>{" "}
                      <span className="text-zinc-300 font-medium">
                        {impl.topSectors.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* "What Would Change My View?" Checklist */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-400">
            <FileCheck2 className="h-5 w-5" />
            <h2 className="text-base font-bold text-white tracking-tight">
              &quot;What Would Change My View?&quot; Falsification Checklist
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Explicit empirical triggers that would invalidate the current macro thesis and trigger a regime reclassification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {regime?.checklist.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    Trigger 0{idx + 1}
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 capitalize">
                    Likelihood: {item.likelihood}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white">
                  {item.trigger}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
                <div className="text-[11px] text-zinc-500 pt-1">
                  Reclassifies to:{" "}
                  <strong className="text-zinc-300 capitalize">
                    {item.impactRegime.replace("_", " ")}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
