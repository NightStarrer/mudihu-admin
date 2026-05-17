import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
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
    <>
      <DashboardShell userName={displayName} role={session.profile.role}>
        {children}
      </DashboardShell>
      <Toaster richColors position="top-center" />
    </>
  );
}
