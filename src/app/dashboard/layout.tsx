import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const displayName =
    session.profile.full_name ?? session.userId.slice(0, 8);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userName={displayName} role={session.profile.role} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
