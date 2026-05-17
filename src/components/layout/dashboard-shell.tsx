"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function DashboardShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background lg:flex-row">
      <header className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-sidebar px-4 py-3 lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">MuDiHu</p>
          <p className="truncate text-xs text-muted-foreground">Operations OS</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          MH
        </div>
      </header>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          showCloseButton
          className="w-[min(100vw-2rem,18rem)] gap-0 p-0 sm:max-w-xs"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav
            userName={userName}
            role={role}
            onNavigate={() => setMobileNavOpen(false)}
            className="bg-sidebar"
          />
        </SheetContent>
      </Sheet>

      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <SidebarNav userName={userName} role={role} />
      </aside>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-7xl px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
