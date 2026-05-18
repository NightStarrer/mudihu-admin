"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateBrandingAction,
  uploadLogoAction,
} from "@/app/actions/branding";
import type { BrandingSettings } from "@/types/database";
import { toast } from "sonner";

export function BrandingForm({
  branding,
}: {
  branding: BrandingSettings | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  async function handleBrandingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateBrandingAction({
        primary_color: fd.get("primary_color") as string,
        secondary_color: fd.get("secondary_color") as string,
        background_color: fd.get("background_color") as string,
        font_family: fd.get("font_family") as string,
        footer_text: fd.get("footer_text") as string,
        logo_url: branding?.logo_url ?? null,
        bank_account_name: (fd.get("bank_account_name") as string) || null,
        bank_name: (fd.get("bank_name") as string) || null,
        bank_account_number: (fd.get("bank_account_number") as string) || null,
        bank_ifsc: (fd.get("bank_ifsc") as string) || null,
        bank_branch: (fd.get("bank_branch") as string) || null,
        bank_upi_id: (fd.get("bank_upi_id") as string) || null,
        gpay_name: (fd.get("gpay_name") as string) || null,
        gpay_number: (fd.get("gpay_number") as string) || null,
        show_bank_on_documents: fd.get("show_bank_on_documents") === "on",
      });
      toast.success("Branding updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("logo", file);
    setLogoLoading(true);
    try {
      await uploadLogoAction(fd);
      toast.success("Logo uploaded");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLogoLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-primary text-xl font-bold text-primary-foreground">
          {branding?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logo_url}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          ) : (
            "MH"
          )}
        </div>
        <div>
          <Label htmlFor="logo">Logo upload</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            className="mt-1 max-w-xs"
            disabled={logoLoading}
            onChange={handleLogoUpload}
          />
          {logoLoading ? (
            <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            Placeholder until you provide the official MuDiHu logo.
          </p>
        </div>
      </div>

      <form onSubmit={handleBrandingSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary (maroon)</Label>
            <Input
              id="primary_color"
              name="primary_color"
              type="color"
              defaultValue={branding?.primary_color ?? "#7B1E3A"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary_color">Secondary (black)</Label>
            <Input
              id="secondary_color"
              name="secondary_color"
              type="color"
              defaultValue={branding?.secondary_color ?? "#0A0A0A"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="background_color">Background (cream)</Label>
            <Input
              id="background_color"
              name="background_color"
              type="color"
              defaultValue={branding?.background_color ?? "#F8F5F0"}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="font_family">PDF font family</Label>
          <Input
            id="font_family"
            name="font_family"
            defaultValue={branding?.font_family ?? "Helvetica"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer_text">PDF footer text</Label>
          <Textarea
            id="footer_text"
            name="footer_text"
            defaultValue={
              branding?.footer_text ??
              "MuDiHu — Muttugodu Digital Hub | Confidential"
            }
            rows={2}
          />
        </div>

        <div className="border-t border-border/60 pt-6">
          <h3 className="text-sm font-semibold">Bank account (invoices & cost sheets)</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Shown on invoice and cost sheet PDFs when filled in. Proposals use your
            logo from above; upload a logo to replace the MH placeholder.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank_account_name">Account holder name</Label>
              <Input
                id="bank_account_name"
                name="bank_account_name"
                defaultValue={branding?.bank_account_name ?? ""}
                placeholder="MuDiHu — Muttugodu Digital Hub"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_number">Account number</Label>
              <Input
                id="bank_account_number"
                name="bank_account_number"
                defaultValue={branding?.bank_account_number ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank name</Label>
              <Input
                id="bank_name"
                name="bank_name"
                defaultValue={branding?.bank_name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_branch">Branch</Label>
              <Input
                id="bank_branch"
                name="bank_branch"
                defaultValue={branding?.bank_branch ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_ifsc">IFSC code</Label>
              <Input
                id="bank_ifsc"
                name="bank_ifsc"
                defaultValue={branding?.bank_ifsc ?? ""}
                placeholder="SBIN0001234"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank_upi_id">UPI ID (optional)</Label>
              <Input
                id="bank_upi_id"
                name="bank_upi_id"
                defaultValue={branding?.bank_upi_id ?? ""}
                placeholder="name@upi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpay_name">GPay name</Label>
              <Input
                id="gpay_name"
                name="gpay_name"
                defaultValue={branding?.gpay_name ?? ""}
                placeholder="MuDiHu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpay_number">GPay number</Label>
              <Input
                id="gpay_number"
                name="gpay_number"
                defaultValue={branding?.gpay_number ?? ""}
                placeholder="9876543210"
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                name="show_bank_on_documents"
                defaultChecked={branding?.show_bank_on_documents ?? true}
                className="size-4 accent-primary"
              />
              <span className="text-sm text-muted-foreground">
                Include payment details on invoice and cost sheet PDFs
              </span>
            </label>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-primary sm:w-auto">
          {loading ? "Saving…" : "Save branding"}
        </Button>
      </form>
    </div>
  );
}
