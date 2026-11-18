"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Moon,
  PanelLeft,
  RefreshCw,
  Settings,
  Sun,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSidebar } from "@/components/layout/SidebarContext";

interface HeaderProps {
  isConfigured?: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/calendar": "Economic Calendar",
  "/indicators": "Indicators",
  "/regime": "Market Regime",
  "/brief": "Weekly Brief",
};

export function Header({
  isConfigured = true,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}: HeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isCollapsed, toggleSidebar, toggleMobile, setSettingsOpen } =
    useSidebar();

  const currentLabel = ROUTE_LABELS[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-md transition-colors select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
          {/* Left: Sidebar Toggle + Title/Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sidebar Toggle Button [|] matching the reference screenshot */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  toggleMobile();
                } else {
                  toggleSidebar();
                }
              }}
              title={
                isCollapsed
                  ? "Expand sidebar (Ctrl+B)"
                  : "Collapse sidebar (Ctrl+B)"
              }
              aria-label={
                isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"
              }
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white active:scale-95 transition-[transform,background-color,color] duration-150 shadow-2xs"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            {/* Breadcrumb / Title display */}
            <div className="flex items-center gap-2">
                    {isCollapsed && (
                      <Link
                        href="/"
                        className="flex items-center gap-2 group animate-in fade-in duration-150"
                      >
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:bg-blue-600/20 dark:border-blue-500/30 dark:text-blue-400 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-600/30 transition-all flex items-center justify-center shadow-2xs">
                          <Compass className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            US Macro Radar
                          </span>
                          <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1 py-0.2 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400 hidden sm:inline">
                            FRED
                          </span>
                        </div>
                        <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">
                          /
                        </span>
              </Link>
              )}

                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                  {currentLabel}
                </span>
            </div>
          </div>

          {/* Right Controls: FRED Status, Time, Theme, Settings, Refresh */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {isConfigured ? (
                <div className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Live FRED
                </div>
                ) : (
                  <div className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20">
                    <Database className="h-3 w-3" />
                    Demo Fallback
                  </div>
            )}

                  {lastUpdated && (
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hidden xl:inline">
                        {new Date(lastUpdated).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
            )}

                      {/* Theme Toggle Button */}
                      <button
                        onClick={toggleTheme}
                        title={
                          resolvedTheme === "dark"
                            ? "Switch to Light Mode"
                            : "Switch to Dark Mode"
                        }
                        aria-label={
                          resolvedTheme === "dark"
                            ? "Switch to Light Mode"
                            : "Switch to Dark Mode"
                        }
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white active:scale-95 transition-[transform,background-color,color] duration-150 shadow-2xs"
                      >
                        {resolvedTheme === "dark" ? (
                          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
                        ) : (
                          <Moon className="h-4 w-4 text-zinc-700 transition-transform duration-200 hover:-rotate-12" />
                        )}
                      </button>

                      {/* Settings Button */}
                      <button
                        onClick={() => setSettingsOpen(true)}
                        title="Terminal Settings"
                        aria-label="Terminal Settings"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white active:scale-95 transition-[transform,background-color,color] duration-150 shadow-2xs"
                      >
                        <Settings className="h-4 w-4" />
                      </button>

                      {/* Refresh Button */}
                      {onRefresh && (
                        <button
                          onClick={onRefresh}
                          disabled={isRefreshing}
                          title="Refresh Macro Data"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white active:scale-95 transition-[transform,background-color,color] duration-150 disabled:opacity-50 shadow-2xs"
                        >
                          <RefreshCw
                            className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
                          />
                          <span className="hidden sm:inline">Refresh</span>
                        </button>
                      )}
                    </div>
        </div>
              </div>
    </header>
          );
}
