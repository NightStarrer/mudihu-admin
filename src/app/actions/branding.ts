"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";

export async function updateBrandingAction(data: {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  font_family: string;
  footer_text: string;
  logo_url?: string | null;
}) {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("branding_settings")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("agency_id", profile.agency_id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings/branding");
}

export async function uploadLogoAction(formData: FormData) {
  const { profile } = await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("logo") as File;

  if (!file?.size) throw new Error("No file provided");

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${profile.agency_id}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("branding-logos")
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("branding-logos").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("branding_settings")
    .update({
      logo_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("agency_id", profile.agency_id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/dashboard/settings/branding");
  return publicUrl;
}
