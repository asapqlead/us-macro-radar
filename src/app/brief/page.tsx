"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  Printer,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiResponse, WeeklyBrief } from "@/types/macro";
import { cn, formatDate, formatCalendarEventDateTime } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load weekly macro brief");
    return res.json();
  });

export default function WeeklyBriefPage() {
  const { data, isLoading, mutate, isValidating } = useSWR<
    ApiResponse<WeeklyBrief>
  >("/api/brief", fetcher);

  const brief = data?.data;

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 dark:bg-black dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors">
      <Header
        lastUpdated={brief?.lastUpdated}
        onRefresh={() => mutate()}
        isRefreshing={isValidating}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header with Print/Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
              <span>Institutional Research Note</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Weekly Macroeconomic Intelligence Brief
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {brief?.weekOf || "Current Operating Week"} • Automated Synthetic Assessment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / PDF
            </button>
          </div>
        </div>

        {isLoading || !brief ? (
          <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Macro Regime Summary Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 space-y-2 dark:border-blue-500/30 dark:bg-blue-950/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Compass className="h-4 w-4" />
                  Current Operating Regime: {brief.macroRegime.title}
                </span>
                <Link
                  href="/regime"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:underline inline-flex items-center gap-1"
                >
                  Regime Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                {brief.macroRegime.assessment}
              </p>
            </div>

            {/* Section 1: What Happened Last Week */}
            <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">01.</span>
                What Happened Last Week (Retrospective)
              </h2>

              <div className="space-y-4 pt-1">
                {brief.whatHappenedLastWeek.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-2 dark:border-zinc-800/80 dark:bg-zinc-900/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded self-start sm:self-auto">
                        {item.impact}
                      </span>
                    </div>

                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pl-4 list-disc marker:text-zinc-400 dark:marker:text-zinc-600">
                      {item.bulletPoints.map((bp, bidx) => (
                        <li key={bidx} className="leading-relaxed">
                          {bp}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: What Matters This Week */}
            <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">02.</span>
                What Matters This Week (Forward Drivers)
              </h2>

              <div className="space-y-4 pt-1">
                {brief.whatMattersThisWeek.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-2 dark:border-zinc-800/80 dark:bg-zinc-900/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {item.theme}
                      </h3>
                      <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 px-2 py-0.5 rounded self-start sm:self-auto">
                        Driver: {item.keyDriver}
                      </span>
                    </div>

                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pl-4 list-disc marker:text-zinc-400 dark:marker:text-zinc-600">
                      {item.bulletPoints.map((bp, bidx) => (
                        <li key={bidx} className="leading-relaxed">
                          {bp}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Three Most Important Upcoming Releases */}
            <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">03.</span>
                  Key Economic Catalysts on Deck
                </h2>
                <Link
                  href="/calendar"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:underline flex items-center gap-1"
                >
                  Full Calendar <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {brief.topUpcomingReleases.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2 dark:border-zinc-800 dark:bg-zinc-900/60"
                  >
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block uppercase">
                      {formatCalendarEventDateTime(evt.releaseDate, evt.releaseTime, "UTC+7").fullDisplay}
                    </span>
                    <h3 className="text-xs font-bold text-zinc-950 dark:text-white line-clamp-1">
                      {evt.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Consensus:</span>
                      <span className="text-zinc-950 dark:text-white font-bold">{evt.consensus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Probability-Weighted Market Scenarios */}
            <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">04.</span>
                Conditional Market Scenarios
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Base Case */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 space-y-3 dark:border-blue-500/30 dark:bg-blue-950/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      Base Case
                    </span>
                    <span className="rounded bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-xs font-bold font-mono text-blue-800 dark:text-blue-300">
                      {brief.marketScenarios.baseCase.probability}% Prob
                    </span>
                  </div>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {brief.marketScenarios.baseCase.thesis}
                  </p>
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/30 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <strong className="text-blue-700 dark:text-blue-400 block mb-0.5">Tactical Play:</strong>
                    {brief.marketScenarios.baseCase.allocationTip}
                  </div>
                </div>

                {/* Bullish Case */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3 dark:border-emerald-500/30 dark:bg-emerald-950/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Bullish Case
                    </span>
                    <span className="rounded bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-bold font-mono text-emerald-800 dark:text-emerald-300">
                      {brief.marketScenarios.bullishCase.probability}% Prob
                    </span>
                  </div>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {brief.marketScenarios.bullishCase.thesis}
                  </p>
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/30 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">Tactical Play:</strong>
                    {brief.marketScenarios.bullishCase.allocationTip}
                  </div>
                </div>

                {/* Bearish Case */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 space-y-3 dark:border-rose-500/30 dark:bg-rose-950/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                      Bearish Case
                    </span>
                    <span className="rounded bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 text-xs font-bold font-mono text-rose-800 dark:text-rose-300">
                      {brief.marketScenarios.bearishCase.probability}% Prob
                    </span>
                  </div>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {brief.marketScenarios.bearishCase.thesis}
                  </p>
                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/30 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">Tactical Play:</strong>
                    {brief.marketScenarios.bearishCase.allocationTip}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Key Risks */}
            <section className="rounded-xl border border-rose-200 bg-white p-6 space-y-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-5 w-5" />
                <h2 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                  Key Tail Risks & Asymmetric Vulnerabilities
                </h2>
              </div>
              <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-2 pl-4 list-disc marker:text-rose-500 pt-1">
                {brief.keyRisks.map((risk, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {risk}
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 6: Conclusion */}
            <section className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 p-6 space-y-2 shadow-xs dark:border-zinc-800 dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Macro Synthesis & Bottom Line
              </h2>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {brief.conclusion}
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
