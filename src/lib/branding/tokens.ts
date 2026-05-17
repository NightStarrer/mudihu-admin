import type { Agency, BrandingSettings, BrandingTokens } from "@/types/database";

export const DEFAULT_BRANDING: BrandingTokens = {
  primaryColor: "#7B1E3A",
  secondaryColor: "#0A0A0A",
  backgroundColor: "#F8F5F0",
  fontFamily: "Helvetica",
  logoUrl: null,
  footerText: "MuDiHu — Muttugodu Digital Hub | Confidential",
  agencyName: "MuDiHu",
};

export function toBrandingTokens(
  settings: BrandingSettings | null,
  agency: Agency | null
): BrandingTokens {
  if (!settings) return DEFAULT_BRANDING;

  return {
    primaryColor: settings.primary_color,
    secondaryColor: settings.secondary_color,
    backgroundColor: settings.background_color,
    fontFamily: settings.font_family,
    logoUrl: settings.logo_url,
    footerText: settings.footer_text ?? DEFAULT_BRANDING.footerText,
    agencyName: agency?.name ?? "MuDiHu",
  };
}
