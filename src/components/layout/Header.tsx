"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Calendar,
  Compass,
  FileText,
  Layers,
  Menu,
  RefreshCw,
  Sparkles,
  X,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isConfigured?: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: Layers },
  { href: "/calendar", label: "Economic Calendar", icon: Calendar },
  { href: "/indicators", label: "Indicators", icon: Activity },
  { href: "/regime", label: "Market Regime", icon: Compass },
  { href: "/brief", label: "Weekly Brief", icon: FileText },
];

export function Header({
  isConfigured = true,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/30 group-hover:border-blue-500/50 transition-all">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    US Macro Radar
                  </span>
                  <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 font-mono text-[10px] text-blue-400">
                    FRED
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Institutional Macroeconomic Cockpit
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      isActive
                        ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Refresh & Live Status */}
          <div className="flex items-center gap-3">
            {isConfigured ? (
              <div className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live FRED
              </div>
            ) : (
              <div className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
                <Database className="h-3 w-3" />
                Demo Fallback
              </div>
            )}

            {lastUpdated && (
              <span className="text-[11px] text-zinc-400 hidden xl:inline">
                {new Date(lastUpdated).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh Macro Data"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
