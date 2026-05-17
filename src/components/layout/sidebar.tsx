"use client";

import { SidebarNav } from "@/components/layout/sidebar-nav";

/** @deprecated Use DashboardShell — kept for compatibility */
export function Sidebar({ userName, role }: { userName: string; role: string }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/60 bg-sidebar">
      <SidebarNav userName={userName} role={role} />
    </aside>
  );
}
