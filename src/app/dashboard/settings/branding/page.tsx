import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { BrandingForm } from "@/components/settings/branding-form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function BrandingSettingsPage() {
  const session = await getSessionProfile();
  const supabase = await createClient();

  const { data: branding } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("agency_id", session!.profile.agency_id)
    .single();

  const isAdmin = session!.profile.role === "admin";

  return (
    <>
      <PageHeader
        title="Branding"
        description="Logo, colors, and PDF appearance (admin only)"
      />
      {!isAdmin ? (
        <Alert>
          <AlertDescription>
            Only admins can update branding settings.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="max-w-2xl border-border/60">
          <CardContent className="pt-6">
            <BrandingForm branding={branding} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
