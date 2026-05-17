"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";

export async function createClientAction(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      agency_id: profile.agency_id,
      company_name: formData.get("company_name") as string,
      contact_person: (formData.get("contact_person") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      gst_number: (formData.get("gst_number") as string) || null,
      address: (formData.get("address") as string) || null,
      business_category: (formData.get("business_category") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/clients");
  return data.id;
}

export async function updateClientAction(id: string, formData: FormData) {
  await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("clients")
    .update({
      company_name: formData.get("company_name") as string,
      contact_person: (formData.get("contact_person") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      gst_number: (formData.get("gst_number") as string) || null,
      address: (formData.get("address") as string) || null,
      business_category: (formData.get("business_category") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
}

export async function deleteClientAction(id: string) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/clients");
}

export async function addClientNoteAction(clientId: string, content: string) {
  const { profile, userId } = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("client_notes").insert({
    client_id: clientId,
    agency_id: profile.agency_id,
    content,
    created_by: userId,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/clients/${clientId}`);
}
