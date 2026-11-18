"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiResponse, CalendarEvent, CalendarResponse } from "@/types/macro";
import { cn, formatDate, formatCalendarEventDateTime } from "@/lib/utils";
import { isSameWeek, parseISO, startOfWeek, addWeeks } from "date-fns";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load economic calendar");
    return res.json();
  });

export default function CalendarPage() {
  const { data, isLoading, mutate, isValidating } = useSWR<
    ApiResponse<CalendarResponse>
  >("/api/calendar", fetcher);

  const [activeTab, setActiveTab] = useState<"this_week" | "next_week">("this_week");
  const [majorOnly, setMajorOnly] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<string>("All");
  const [expandedEventId, setExpandedEventId] = useState<string | null>("cpi-release");
  const [timezone, setTimezone] = useState<"UTC+7" | "ET">("UTC+7");

  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const events = data?.data?.events || [];

  // Categorize events into this week vs next week
  const filteredEvents = useMemo(() => {
    if (!currentDate) return events;
    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const nextWeekStart = addWeeks(currentWeekStart, 1);

    return events.filter((evt) => {
      const evtDate = parseISO(evt.releaseDate);
      const inTargetWeek =
        activeTab === "this_week"
          ? isSameWeek(evtDate, currentWeekStart, { weekStartsOn: 1 })
          : isSameWeek(evtDate, nextWeekStart, { weekStartsOn: 1 });

      if (!inTargetWeek) return false;
      if (majorOnly && !evt.isMajor) return false;
      if (
        selectedAsset !== "All" &&
        !evt.affectedAssets.includes(selectedAsset as any)
      ) {
        return false;
      }
      return true;
    });
  }, [events, activeTab, majorOnly, selectedAsset]);

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 dark:bg-black dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors">
      <Header
        lastUpdated={data?.data?.lastUpdated}
        onRefresh={() => mutate()}
        isRefreshing={isValidating}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Intro */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <CalendarIcon className="h-4 w-4" />
            <span>Forward Market Catalysts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            U.S. Macroeconomic Calendar & Scenario Matrix
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            High-impact economic releases formatted with institutional consensus forecasts and conditional scenario trees mapping implications across Fed policy expectations, Treasury yields, equities, and the U.S. dollar.
          </p>
        </div>

        {/* Filters & Week Toggle Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80 backdrop-blur-md">
          {/* Week Toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 self-start">
            <button
              onClick={() => setActiveTab("this_week")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "this_week"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab("next_week")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "next_week"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Next Week
            </button>
          </div>

          {/* Asset & Major Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Timezone Toggle */}
            <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setTimezone("UTC+7")}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1.5",
                  timezone === "UTC+7"
                    ? "bg-amber-500 text-black shadow-xs font-bold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                <Clock className="h-3 w-3" />
                <span>UTC+7</span>
              </button>
              <button
                type="button"
                onClick={() => setTimezone("ET")}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-semibold transition-all",
                  timezone === "ET"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                <span>US Eastern (ET)</span>
              </button>
            </div>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={majorOnly}
                onChange={(e) => setMajorOnly(e.target.checked)}
                className="rounded border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 text-blue-600 focus:ring-0"
              />
              <span>Major Events Only</span>
            </label>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Asset Impact:</span>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Assets</option>
                <option value="Equities">Equities</option>
                <option value="Treasuries">Treasuries</option>
                <option value="US Dollar">US Dollar</option>
                <option value="Commodities">Commodities</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Events List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
              No economic releases matching the active filters for this week.
            </div>
          ) : (
            filteredEvents.map((event) => {
              const isExpanded = expandedEventId === event.id;
              const dt = formatCalendarEventDateTime(
                event.releaseDate,
                event.releaseTime,
                timezone
              );

              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden",
                    isExpanded
                      ? "border-zinc-300 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-950/90 dark:shadow-xl"
                      : "border-zinc-200 bg-white hover:border-zinc-300 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/50 dark:hover:border-zinc-700"
                  )}
                >
                  {/* Event Summary Bar */}
                  <div
                    onClick={() => toggleExpand(event.id)}
                    className="p-4 sm:p-5 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Prominent Date & Time Card Block */}
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/90 px-3.5 py-2.5 shrink-0 flex sm:flex-col justify-between sm:justify-center items-center sm:items-start gap-1 min-w-[175px] shadow-xs">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                          <CalendarIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{dt.specificDate}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 font-mono">
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dt.timeString}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            ({dt.secondaryTime})
                          </span>
                        </div>
                      </div>

                      {/* Title & Category Tags */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                              event.importance === "High"
                                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30"
                                : event.importance === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
                                : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                            )}
                          >
                            {event.importance} Impact
                          </span>

                          {event.seriesId && (
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 px-1.5 py-0.2 rounded">
                              {event.seriesId}
                            </span>
                          )}

                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Period: <strong className="text-zinc-800 dark:text-zinc-300 font-medium">{event.period}</strong>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    {/* Consensus, Previous & Asset Tags */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-zinc-400 dark:text-zinc-500 block text-[10px]">
                            CONSENSUS
                          </span>
                          <span className="text-zinc-950 dark:text-white font-bold">
                            {event.consensus}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 dark:text-zinc-500 block text-[10px]">
                            PREVIOUS
                          </span>
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {event.previous}
                          </span>
                        </div>
                      </div>

                      {/* Affected Assets Pill list */}
                      <div className="hidden lg:flex items-center gap-1.5">
                        {event.affectedAssets.map((asset) => (
                          <span
                            key={asset}
                            className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>

                      {/* Expand Chevron */}
                      <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Scenario Analysis Matrix */}
                  {isExpanded && (
                    <div className="border-t border-zinc-200 bg-zinc-50/70 p-5 space-y-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/60">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
                            Scenario Analysis & Multi-Asset Implications
                          </h4>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Conditional policy & market reaction trees
                          </span>
                        </div>
                        <div className="font-mono text-xs text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20 px-2.5 py-1 rounded-md self-start sm:self-auto flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>Release: {dt.specificDate} • {dt.timeString} ({dt.secondaryTime})</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Bullish Scenario */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-950/10 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5" />
                              Bullish Case
                            </span>
                          </div>
                          <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {event.bullishScenario.outcome}
                          </p>
                          <div className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1.5 border-t border-emerald-200/60 dark:border-emerald-900/30 pt-2 font-mono">
                            <p>
                              <strong className="text-emerald-700 dark:text-emerald-400">Fed Policy:</strong>{" "}
                              {event.bullishScenario.fedPolicy}
                            </p>
                            <p>
                              <strong className="text-emerald-700 dark:text-emerald-400">Yields:</strong>{" "}
                              {event.bullishScenario.yields}
                            </p>
                            <p>
                              <strong className="text-emerald-700 dark:text-emerald-400">Equities:</strong>{" "}
                              {event.bullishScenario.equities}
                            </p>
                            <p>
                              <strong className="text-emerald-700 dark:text-emerald-400">Dollar:</strong>{" "}
                              {event.bullishScenario.dollar}
                            </p>
                          </div>
                        </div>

                        {/* 2. Base Case Scenario */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-950/10 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 flex items-center gap-1">
                              <HelpCircle className="h-3.5 w-3.5" />
                              Base Case (Expected)
                            </span>
                          </div>
                          <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {event.baseScenario.outcome}
                          </p>
                          <div className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1.5 border-t border-blue-200/60 dark:border-blue-900/30 pt-2 font-mono">
                            <p>
                              <strong className="text-blue-700 dark:text-blue-400">Fed Policy:</strong>{" "}
                              {event.baseScenario.fedPolicy}
                            </p>
                            <p>
                              <strong className="text-blue-700 dark:text-blue-400">Yields:</strong>{" "}
                              {event.baseScenario.yields}
                            </p>
                            <p>
                              <strong className="text-blue-700 dark:text-blue-400">Equities:</strong>{" "}
                              {event.baseScenario.equities}
                            </p>
                            <p>
                              <strong className="text-blue-700 dark:text-blue-400">Dollar:</strong>{" "}
                              {event.baseScenario.dollar}
                            </p>
                          </div>
                        </div>

                        {/* 3. Bearish Scenario */}
                        <div className="rounded-xl border border-rose-200 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-950/10 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1">
                              <TrendingDown className="h-3.5 w-3.5" />
                              Bearish Case
                            </span>
                          </div>
                          <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {event.bearishScenario.outcome}
                          </p>
                          <div className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1.5 border-t border-rose-200/60 dark:border-rose-900/30 pt-2 font-mono">
                            <p>
                              <strong className="text-rose-700 dark:text-rose-400">Fed Policy:</strong>{" "}
                              {event.bearishScenario.fedPolicy}
                            </p>
                            <p>
                              <strong className="text-rose-700 dark:text-rose-400">Yields:</strong>{" "}
                              {event.bearishScenario.yields}
                            </p>
                            <p>
                              <strong className="text-rose-700 dark:text-rose-400">Equities:</strong>{" "}
                              {event.bearishScenario.equities}
                            </p>
                            <p>
                              <strong className="text-rose-700 dark:text-rose-400">Dollar:</strong>{" "}
                              {event.bearishScenario.dollar}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
