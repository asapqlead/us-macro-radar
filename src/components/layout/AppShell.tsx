"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/layout/SettingsModal";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isSettingsOpen, setSettingsOpen } = useSidebar();

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ease-out">
        {children}
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
