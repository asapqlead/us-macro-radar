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
import { cn, formatDate } from "@/lib/utils";
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
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header
        lastUpdated={data?.data?.lastUpdated}
        onRefresh={() => mutate()}
        isRefreshing={isValidating}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Intro */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
            <CalendarIcon className="h-4 w-4" />
            <span>Forward Market Catalysts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            U.S. Macroeconomic Calendar & Scenario Matrix
          </h1>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            High-impact economic releases formatted with institutional consensus forecasts and conditional scenario trees mapping implications across Fed policy expectations, Treasury yields, equities, and the U.S. dollar.
          </p>
        </div>

        {/* Filters & Week Toggle Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur-md">
          {/* Week Toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-1 border border-zinc-800 self-start">
            <button
              onClick={() => setActiveTab("this_week")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "this_week"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab("next_week")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "next_week"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Next Week
            </button>
          </div>

          {/* Asset & Major Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-300">
              <input
                type="checkbox"
                checked={majorOnly}
                onChange={(e) => setMajorOnly(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
              />
              <span>Major Events Only</span>
            </label>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400">Asset Impact:</span>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3"
              >
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-sm text-zinc-400">
              No economic releases matching the active filters for this week.
            </div>
          ) : (
            filteredEvents.map((event) => {
              const isExpanded = expandedEventId === event.id;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden",
                    isExpanded
                      ? "border-zinc-700 bg-zinc-950/90 shadow-xl"
                      : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700"
                  )}
                >
                  {/* Event Summary Bar */}
                  <div
                    onClick={() => toggleExpand(event.id)}
                    className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">
                          {formatDate(event.releaseDate)} • {event.releaseTime} ET
                        </span>

                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                            event.importance === "High"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : event.importance === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          )}
                        >
                          {event.importance} Impact
                        </span>

                        {event.seriesId && (
                          <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                            {event.seriesId}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">
                        {event.title}
                      </h3>
                      <p className="text-xs text-zinc-400">Period: {event.period}</p>
                    </div>

                    {/* Consensus, Previous & Asset Tags */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-zinc-500 block text-[10px]">
                            CONSENSUS
                          </span>
                          <span className="text-white font-bold">
                            {event.consensus}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px]">
                            PREVIOUS
                          </span>
                          <span className="text-zinc-300">
                            {event.previous}
                          </span>
                        </div>
                      </div>

                      {/* Affected Assets Pill list */}
                      <div className="hidden lg:flex items-center gap-1.5">
                        {event.affectedAssets.map((asset) => (
                          <span
                            key={asset}
                            className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>

                      {/* Expand Chevron */}
                      <button className="text-zinc-400 group-hover:text-white p-1">
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
                    <div className="border-t border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Scenario Analysis & Multi-Asset Implications
                        </h4>
                        <span className="text-[11px] text-zinc-400">
                          Conditional policy & market reaction trees
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Bullish Scenario */}
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5" />
                              Bullish Case
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                            {event.bullishScenario.outcome}
                          </p>
                          <div className="text-[11px] text-zinc-300 space-y-1.5 border-t border-emerald-900/30 pt-2 font-mono">
                            <p>
                              <strong className="text-emerald-400">Fed Policy:</strong>{" "}
                              {event.bullishScenario.fedPolicy}
                            </p>
                            <p>
                              <strong className="text-emerald-400">Yields:</strong>{" "}
                              {event.bullishScenario.yields}
                            </p>
                            <p>
                              <strong className="text-emerald-400">Equities:</strong>{" "}
                              {event.bullishScenario.equities}
                            </p>
                            <p>
                              <strong className="text-emerald-400">Dollar:</strong>{" "}
                              {event.bullishScenario.dollar}
                            </p>
                          </div>
                        </div>

                        {/* 2. Base Case Scenario */}
                        <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1">
                              <HelpCircle className="h-3.5 w-3.5" />
                              Base Case (Expected)
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                            {event.baseScenario.outcome}
                          </p>
                          <div className="text-[11px] text-zinc-300 space-y-1.5 border-t border-blue-900/30 pt-2 font-mono">
                            <p>
                              <strong className="text-blue-400">Fed Policy:</strong>{" "}
                              {event.baseScenario.fedPolicy}
                            </p>
                            <p>
                              <strong className="text-blue-400">Yields:</strong>{" "}
                              {event.baseScenario.yields}
                            </p>
                            <p>
                              <strong className="text-blue-400">Equities:</strong>{" "}
                              {event.baseScenario.equities}
                            </p>
                            <p>
                              <strong className="text-blue-400">Dollar:</strong>{" "}
                              {event.baseScenario.dollar}
                            </p>
                          </div>
                        </div>

                        {/* 3. Bearish Scenario */}
                        <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-rose-400 flex items-center gap-1">
                              <TrendingDown className="h-3.5 w-3.5" />
                              Bearish Case
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                            {event.bearishScenario.outcome}
                          </p>
                          <div className="text-[11px] text-zinc-300 space-y-1.5 border-t border-rose-900/30 pt-2 font-mono">
                            <p>
                              <strong className="text-rose-400">Fed Policy:</strong>{" "}
                              {event.bearishScenario.fedPolicy}
                            </p>
                            <p>
                              <strong className="text-rose-400">Yields:</strong>{" "}
                              {event.bearishScenario.yields}
                            </p>
                            <p>
                              <strong className="text-rose-400">Equities:</strong>{" "}
                              {event.bearishScenario.equities}
                            </p>
                            <p>
                              <strong className="text-rose-400">Dollar:</strong>{" "}
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
