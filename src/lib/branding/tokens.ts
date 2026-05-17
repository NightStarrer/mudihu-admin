import type { Agency, BrandingSettings, BrandingTokens } from "@/types/database";

export const DEFAULT_BRANDING: BrandingTokens = {
  primaryColor: "#7B1E3A",
  secondaryColor: "#0A0A0A",
  backgroundColor: "#F8F5F0",
  fontFamily: "Helvetica",
  logoUrl: null,
  footerText: "MuDiHu — Muttugodu Digital Hub | Confidential",
  agencyName: "MuDiHu",
  bank: null,
};

function toBankDetails(settings: BrandingSettings): BrandingTokens["bank"] {
  const hasAny =
    settings.bank_account_name ||
    settings.bank_name ||
    settings.bank_account_number ||
    settings.bank_ifsc;

  if (!hasAny) return null;

  return {
    accountName: settings.bank_account_name,
    bankName: settings.bank_name,
    accountNumber: settings.bank_account_number,
    ifsc: settings.bank_ifsc,
    branch: settings.bank_branch,
    upiId: settings.bank_upi_id,
    showOnDocuments: settings.show_bank_on_documents ?? true,
  };
}

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
    bank: toBankDetails(settings),
  };
}
