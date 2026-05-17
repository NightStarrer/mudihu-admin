"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/proposals", label: "Proposals", icon: FileText },
  { href: "/dashboard/settings/branding", label: "Branding", icon: Settings },
];

export function SidebarNav({
  userName,
  role,
  onNavigate,
  className,
}: {
  userName: string;
  role: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className={cn("flex h-full flex-col", className)}>
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          MH
        </div>
        <p className="mt-3 text-sm font-semibold tracking-tight">MuDiHu</p>
        <p className="text-xs text-muted-foreground">Operations OS</p>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border/60 p-4">
        <p className="truncate text-sm font-medium">{userName}</p>
        <p className="text-xs capitalize text-muted-foreground">{role}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 h-10 w-full justify-start gap-2 text-muted-foreground sm:h-7"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </nav>
  );
}
