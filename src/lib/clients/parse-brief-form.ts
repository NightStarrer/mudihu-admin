import type { ClientProjectBrief } from "@/types/client-project-brief";
import { parseProjectBrief } from "@/types/client-project-brief";

function getAll(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((v): v is string => typeof v === "string");
}

function optionalString(formData: FormData, name: string): string | null {
  const v = (formData.get(name) as string)?.trim();
  return v || null;
}

export function parseBriefFromFormData(formData: FormData): ClientProjectBrief {
  const base = parseProjectBrief({
    primary_goal: optionalString(formData, "primary_goal"),
    site_type: optionalString(formData, "site_type"),
    commerce: optionalString(formData, "commerce"),
    requirements_text: optionalString(formData, "requirements_text"),
    must_have_features: getAll(formData, "must_have_features"),
    nice_to_have_features: getAll(formData, "nice_to_have_features"),
    content_types: getAll(formData, "content_types"),
    cms_preference: optionalString(formData, "cms_preference"),
    integrations: getAll(formData, "integrations"),
    auth_level: optionalString(formData, "auth_level"),
    budget_tier: optionalString(formData, "budget_tier"),
    timeline_expectation: optionalString(formData, "timeline_expectation"),
  });
  return base;
}

export function parseIndustryTags(formData: FormData): string[] {
  const raw = (formData.get("industry_tags") as string)?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
