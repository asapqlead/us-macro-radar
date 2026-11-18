"use client";

import React, { useEffect } from "react";
import {
  X,
  Sun,
  Moon,
  Laptop,
  Clock,
  Database,
  Keyboard,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
          "transform transition-[transform,opacity] duration-200 ease-out scale-100 opacity-100"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="settings-dialog-title"
                className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white"
              >
                Terminal Settings
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure macroeconomic workspace preferences and feeds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 active:scale-95 transition-[transform,background-color,color] duration-150"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98]",
                  theme === "light"
                    ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400 shadow-xs"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                )}
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98]",
                  theme === "dark"
                    ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400 shadow-xs"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                )}
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98]",
                  theme === "system"
                    ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400 shadow-xs"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                )}
              >
                <Laptop className="h-4 w-4" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Timezone & Catalyst Schedule */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Calendar Timezone</span>
            </label>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  UTC+7 (Asia / Bangkok & Jakarta)
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                  Dual-rendered alongside US Eastern (ET) Fed release hours
                </p>
              </div>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
          </div>

          {/* Feed & Data Provider */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              <span>Data Provider</span>
            </label>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Federal Reserve Economic Data (FRED)
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    St. Louis Fed API live feed with in-memory caching
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Keyboard className="h-3.5 w-3.5" />
              <span>Keyboard Shortcuts</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Toggle Sidebar</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] text-zinc-800 dark:text-zinc-200">
                  Ctrl+B
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">Close Dialog</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] text-zinc-800 dark:text-zinc-200">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
