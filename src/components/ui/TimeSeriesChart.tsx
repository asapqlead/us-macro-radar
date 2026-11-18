"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { FredObservationPoint } from "@/types/fred";
import { MacroSeriesConfig } from "@/types/macro";
import { cn, formatDate, formatMetricValue } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "./Skeleton";

interface TimeSeriesChartProps {
  data: FredObservationPoint[];
  config?: MacroSeriesConfig;
  isLoading?: boolean;
  className?: string;
  height?: number;
}

type TimeRange = "1Y" | "3Y" | "5Y" | "MAX";

export function TimeSeriesChart({
  data,
  config,
  isLoading = false,
  className,
  height = 360,
}: TimeSeriesChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("5Y");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter observations based on selected time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (selectedRange === "MAX") return data;

    const years = selectedRange === "1Y" ? 1 : selectedRange === "3Y" ? 3 : 5;
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - years);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const sliced = data.filter((pt) => pt.date >= cutoffStr);
    return sliced.length > 0 ? sliced : data.slice(-Math.min(data.length, years * 12));
  }, [data, selectedRange]);

  // Determine chart bounds and gradient color
  const { minVal, maxVal, isSpreadInverted } = useMemo(() => {
    if (filteredData.length === 0) {
      return { minVal: 0, maxVal: 10, isSpreadInverted: false };
    }
    const vals = filteredData.map((d) => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const padding = (max - min) * 0.08 || 0.5;

    const inverted =
      config?.isInversionWarning &&
      vals[vals.length - 1] !== undefined &&
      vals[vals.length - 1] < (config?.benchmark ?? 0);

    return {
      minVal: Number((min - padding).toFixed(2)),
      maxVal: Number((max + padding).toFixed(2)),
      isSpreadInverted: Boolean(inverted),
    };
  }, [filteredData, config]);

  const strokeColor = isSpreadInverted ? "#f43f5e" : "#3b82f6";
  const gradientId = `colorFill-${config?.id || "series"}`;

  if (!isMounted || isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col justify-between rounded-xl border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/70 p-6 shadow-xs",
          className
        )}
      >
        <div className="flex items-center justify-between pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-44 rounded-lg" />
        </div>
        <Skeleton className="w-full" style={{ height }} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80 dark:shadow-sm backdrop-blur-md transition-colors",
        className
      )}
    >
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {config?.name || "Historical Macroeconomic Series"}
            </h2>
            {config?.id && (
              <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-700 dark:text-zinc-400">
                {config.id}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {config?.description || "Historical data powered by FRED"}
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 border border-zinc-200 dark:bg-zinc-900/90 dark:border-zinc-800">
          {(["1Y", "3Y", "5Y", "MAX"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                selectedRange === range
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="mt-6 w-full" style={{ height }}>
        {filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
            No historical data available for the selected range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={strokeColor}
                    stopOpacity={isDark ? 0.35 : 0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={strokeColor}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? "#27272a" : "#e4e4e7"}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(val) => formatDate(val)}
                stroke={isDark ? "#71717a" : "#a1a1aa"}
                tick={{ fill: isDark ? "#71717a" : "#71717a", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: isDark ? "#3f3f46" : "#e4e4e7" }}
                minTickGap={40}
              />

              <YAxis
                domain={[minVal, maxVal]}
                stroke={isDark ? "#71717a" : "#a1a1aa"}
                tick={{ fill: isDark ? "#71717a" : "#71717a", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  formatMetricValue(val, config?.units, config?.precision ?? 1)
                }
              />

              {config?.benchmark !== undefined && (
                <ReferenceLine
                  y={config.benchmark}
                  stroke="#e11d48"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target: ${config.benchmark}${config.units || ""}`,
                    fill: "#f43f5e",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
              )}

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as FredObservationPoint;
                  return (
                    <div className="rounded-lg border border-zinc-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95">
                      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        {formatDate(item.date)} ({item.date})
                      </p>
                      <p className="mt-1 font-mono text-base font-bold text-zinc-950 dark:text-white">
                        {formatMetricValue(
                          item.value,
                          config?.units,
                          config?.precision ?? 2
                        )}{" "}
                        {config?.units && config.units !== "%" && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                            {config.units}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                activeDot={{
                  r: 5,
                  fill: strokeColor,
                  stroke: isDark ? "#ffffff" : "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sub-footer details */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
        <span>
          Source: <strong className="text-zinc-800 dark:text-zinc-300">{config?.source || "FRED"}</strong>
        </span>
        <span>
          Showing {filteredData.length} observations • Updated:{" "}
          {filteredData.length > 0
            ? formatDate(filteredData[filteredData.length - 1].date)
            : "N/A"}
        </span>
      </div>
    </div>
  );
}
