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
    try {
      await uploadLogoAction(fd);
      toast.success("Logo uploaded");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
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
            onChange={handleLogoUpload}
          />
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
        <Button type="submit" disabled={loading} className="bg-primary">
          {loading ? "Saving…" : "Save branding"}
        </Button>
      </form>
    </div>
  );
}
