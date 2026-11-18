"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Calendar,
  Compass,
  FileText,
  Layers,
  Settings,
  X,
} from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isAction?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Layers },
  { name: "Economic Calendar", href: "/calendar", icon: Calendar },
  { name: "Indicators", href: "/indicators", icon: Activity },
  { name: "Market Regime", href: "/regime", icon: Compass },
  { name: "Weekly Brief", href: "/brief", icon: FileText },
  { name: "Settings", icon: Settings, isAction: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    isCollapsed,
    isMobileOpen,
    setMobileOpen,
    isSettingsOpen,
    setSettingsOpen,
  } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Close mobile sidebar on Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, setMobileOpen]);

  const renderContent = (isMobile: boolean = false) => (
    <div className="flex h-full flex-col justify-between select-none">
            <div className="space-y-2">
              {/* Top Logo Area (Replaces "Application" header) */}
              {isMobile ? (
                <div className="flex items-center justify-between px-3 pt-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-2">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:bg-blue-600/20 dark:border-blue-500/30 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                      <Compass className="h-4 w-4" strokeWidth={2.2} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white">
                          US Macro Radar
                        </span>
                        <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1 py-0.2 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400">
                          FRED
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                        Institutional Terminal
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 active:scale-95 transition-transform"
                    aria-label="Close navigation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="px-3 pt-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-2">
                  <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:bg-blue-600/20 dark:border-blue-500/30 dark:text-blue-400 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-600/30 group-hover:border-blue-500/40 transition-all flex items-center justify-center shadow-2xs">
                      <Compass className="h-4 w-4" strokeWidth={2.2} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          US Macro Radar
                        </span>
                        <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1 py-0.2 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400">
                          FRED
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                        Institutional Terminal
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Navigation List with Bold Labels */}
              <nav className="space-y-1 px-2" aria-label="Main navigation">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href ? pathname === item.href : isSettingsOpen;

                  if (item.isAction) {
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setSettingsOpen(true);
                          if (isMobile) setMobileOpen(false);
                        }}
                        className={cn(
                          "w-full group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left outline-none font-bold tracking-tight",
                          "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/60",
                          "active:scale-[0.98] transition-[background-color,color,transform] duration-150 ease-out",
                          "focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                          isActive &&
                      "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs"
                        )}
                      >
                        <Icon
                          className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105"
                          strokeWidth={isActive ? 2.4 : 2}
                        />
                        <span className="truncate">{item.name}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href!}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm outline-none font-bold tracking-tight",
                        "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/60",
                        "active:scale-[0.98] transition-[background-color,color,transform] duration-150 ease-out",
                        "focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                        isActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs"
                            : ""
                )}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105"
                        strokeWidth={isActive ? 2.4 : 2}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Subtle Bottom Status / Version */}
            <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                  <span className="font-mono text-[11px] font-semibold tracking-tight">FRED API Feed</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    Live
                  </span>
              </div>
            </div>
          </div>
        );

        return (
        <>
          {/* Desktop Sticky Sidebar */}
          <aside
            aria-label="Sidebar navigation"
            className={cn(
              "hidden md:block sticky top-0 h-screen shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-30",
              "transition-[width,opacity] duration-200 ease-out",
              isCollapsed
                ? "w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none"
                : "w-60 opacity-100"
            )}
          >
            <div className="w-60 h-full">{renderContent(false)}</div>
          </aside>

          {/* Mobile Drawer (Overlay) */}
          {isMobileOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 ease-out"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer Slide-Over */}
              <div
                className={cn(
                  "relative w-64 max-w-[80vw] h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-2 shadow-2xl",
                  "transform transition-transform duration-200 ease-out translate-x-0"
                )}
              >
                {renderContent(true)}
              </div>
            </div>
          )}
        </>
        );
}
