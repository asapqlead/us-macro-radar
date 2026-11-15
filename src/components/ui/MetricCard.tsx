import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Minus,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { cn, formatDate, formatMetricValue } from "@/lib/utils";
import { MetricSummary, MetricStatus } from "@/types/macro";
import { Skeleton } from "./Skeleton";

interface MetricCardProps {
  summary?: MetricSummary;
  isLoading?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  summary,
  isLoading = false,
  isSelected = false,
  onClick,
  className,
}: MetricCardProps) {
  if (isLoading || !summary) {
    return (
      <div
        className={cn(
          "rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm",
          className
        )}
      >
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="my-2 h-7 w-24" />
        <Skeleton className="h-4 w-36" />
        <div className="mt-3 pt-2.5 border-t border-zinc-900">
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  const {
    config,
    seriesId,
    name,
    latestValue,
    latestDate,
    priorValue,
    changePeriod,
    changePeriodPercent,
    changeYoY,
    status,
    interpretation,
    releaseDate,
    gdpEstimateType,
    sparkline,
  } = summary;

  // Status visual badge styling
  const statusConfig: Record<
    MetricStatus,
    { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }
  > = {
    improving: {
      label: "Improving",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: CheckCircle2,
    },
    stable: {
      label: "Stable",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      icon: HelpCircle,
    },
    deteriorating: {
      label: "Deteriorating",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
      icon: XCircle,
    },
  };

  const currentStatus = statusConfig[status || "stable"];
  const StatusIcon = currentStatus.icon;

  const isSpreadInverted =
    config.isInversionWarning &&
    latestValue !== null &&
    latestValue < (config.benchmark ?? 0);

  // Period change direction
  const isPositiveDelta = (changePeriod ?? 0) > 0;
  const isNegativeDelta = (changePeriod ?? 0) < 0;

  // Sparkline SVG generator
  const sparklineSvg = (() => {
    if (!sparkline || sparkline.length < 2) return null;
    const values = sparkline.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 110;
    const height = 24;

    const points = sparkline
      .map((p, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((p.value - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const strokeColor =
      status === "improving"
        ? "#10b981"
        : status === "deteriorating"
        ? "#f43f5e"
        : "#f59e0b";

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-6 overflow-visible"
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  })();

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-200 text-left",
        "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700",
        isSelected &&
          "border-blue-500/80 bg-zinc-900/90 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div>
        {/* Top Header: Series ID, Frequency, Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              {seriesId}
            </span>
            {gdpEstimateType && (
              <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                {gdpEstimateType}
              </span>
            )}
            <span className="text-[10px] text-zinc-500">•</span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {config.frequency}
            </span>
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border",
              currentStatus.bg,
              currentStatus.text,
              currentStatus.border
            )}
          >
            <StatusIcon className="h-3 w-3" />
            <span>{currentStatus.label}</span>
          </div>
        </div>

        {/* Metric Name */}
        <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
          {name}
        </h3>

        {/* Primary Value & Unit */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tracking-tight text-white">
            {formatMetricValue(latestValue, config.units, config.precision ?? 2)}
          </span>
          {config.units && config.units !== "%" && (
            <span className="text-xs font-medium text-zinc-400">
              {config.units}
            </span>
          )}

          {isSpreadInverted && (
            <span className="ml-auto inline-flex items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 ring-1 ring-rose-500/30">
              <AlertTriangle className="h-3 w-3" />
              Inverted
            </span>
          )}
        </div>

        {/* Prior Value, MoM/QoQ Delta & YoY Delta */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {/* Prior Value */}
          <span className="text-zinc-500 text-[11px]">
            Prior:{" "}
            <strong className="text-zinc-300 font-mono">
              {formatMetricValue(priorValue, config.units, config.precision ?? 2)}
            </strong>
          </span>

          <span className="text-zinc-700">•</span>

          {/* Delta vs prior */}
          {changePeriod !== null ? (
            <span
              className={cn(
                "inline-flex items-center font-mono text-[11px] font-medium",
                isPositiveDelta
                  ? "text-emerald-400"
                  : isNegativeDelta
                  ? "text-rose-400"
                  : "text-zinc-400"
              )}
            >
              {isPositiveDelta ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : isNegativeDelta ? (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              ) : (
                <Minus className="h-3 w-3 mr-0.5" />
              )}
              {changePeriod > 0 ? "+" : ""}
              {formatMetricValue(changePeriod, undefined, config.precision ?? 2)}
              {changePeriodPercent !== null && (
                <span className="ml-0.5 opacity-80">
                  ({changePeriodPercent > 0 ? "+" : ""}
                  {changePeriodPercent}%)
                </span>
              )}
            </span>
          ) : null}

          {/* YoY change if available */}
          {changeYoY !== null && (
            <>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-400 font-mono text-[11px]">
                YoY:{" "}
                <span className={changeYoY > 0 ? "text-blue-400" : "text-amber-400"}>
                  {changeYoY > 0 ? "+" : ""}
                  {changeYoY}%
                </span>
              </span>
            </>
          )}
        </div>

        {/* Plain-English Interpretation */}
        <p className="mt-2.5 text-xs text-zinc-300 line-clamp-2 leading-relaxed bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
          {interpretation}
        </p>
      </div>

      {/* Sparkline & Release Date Footer */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="w-28 shrink-0">{sparklineSvg}</div>
        <div className="text-right">
          <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">
            Release Date
          </span>
          <span className="text-[11px] font-mono text-zinc-300">
            {formatDate(releaseDate || latestDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
