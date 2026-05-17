export type PrimaryGoal =
  | "brand_presence"
  | "lead_generation"
  | "online_sales"
  | "bookings"
  | "support"
  | "other";

export type SiteType =
  | "static"
  | "dynamic"
  | "web_app"
  | "landing_only";

export type CommerceType =
  | "none"
  | "catalog_only"
  | "full_ecommerce"
  | "subscriptions";

export type CmsPreference =
  | "no_preference"
  | "wordpress"
  | "headless"
  | "custom"
  | "none";

export type AuthLevel =
  | "none"
  | "admin_only"
  | "customers"
  | "roles";

export type BudgetTier = "low" | "medium" | "high" | "enterprise";

export type TimelineExpectation =
  | "urgent"
  | "standard"
  | "flexible";

export interface ClientProjectBrief {
  primary_goal: PrimaryGoal | null;
  site_type: SiteType | null;
  commerce: CommerceType | null;
  requirements_text: string | null;
  must_have_features: string[];
  nice_to_have_features: string[];
  content_types: string[];
  cms_preference: CmsPreference | null;
  integrations: string[];
  auth_level: AuthLevel | null;
  budget_tier: BudgetTier | null;
  timeline_expectation: TimelineExpectation | null;
}

export const EMPTY_PROJECT_BRIEF: ClientProjectBrief = {
  primary_goal: null,
  site_type: null,
  commerce: null,
  requirements_text: null,
  must_have_features: [],
  nice_to_have_features: [],
  content_types: [],
  cms_preference: null,
  integrations: [],
  auth_level: null,
  budget_tier: null,
  timeline_expectation: null,
};

const PRIMARY_GOALS = new Set<string>([
  "brand_presence",
  "lead_generation",
  "online_sales",
  "bookings",
  "support",
  "other",
]);

const SITE_TYPES = new Set<string>([
  "static",
  "dynamic",
  "web_app",
  "landing_only",
]);

const COMMERCE_TYPES = new Set<string>([
  "none",
  "catalog_only",
  "full_ecommerce",
  "subscriptions",
]);

const CMS_PREFERENCES = new Set<string>([
  "no_preference",
  "wordpress",
  "headless",
  "custom",
  "none",
]);

const AUTH_LEVELS = new Set<string>([
  "none",
  "admin_only",
  "customers",
  "roles",
]);

const BUDGET_TIERS = new Set<string>(["low", "medium", "high", "enterprise"]);

const TIMELINE_EXPECTATIONS = new Set<string>([
  "urgent",
  "standard",
  "flexible",
]);

function asEnum<T extends string>(
  value: unknown,
  allowed: Set<string>
): T | null {
  if (typeof value !== "string" || !allowed.has(value)) return null;
  return value as T;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function parseProjectBrief(raw: unknown): ClientProjectBrief {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_PROJECT_BRIEF };
  }
  const o = raw as Record<string, unknown>;
  return {
    primary_goal: asEnum(o.primary_goal, PRIMARY_GOALS),
    site_type: asEnum(o.site_type, SITE_TYPES),
    commerce: asEnum(o.commerce, COMMERCE_TYPES),
    requirements_text:
      typeof o.requirements_text === "string" ? o.requirements_text : null,
    must_have_features: asStringArray(o.must_have_features),
    nice_to_have_features: asStringArray(o.nice_to_have_features),
    content_types: asStringArray(o.content_types),
    cms_preference: asEnum(o.cms_preference, CMS_PREFERENCES),
    integrations: asStringArray(o.integrations),
    auth_level: asEnum(o.auth_level, AUTH_LEVELS),
    budget_tier: asEnum(o.budget_tier, BUDGET_TIERS),
    timeline_expectation: asEnum(o.timeline_expectation, TIMELINE_EXPECTATIONS),
  };
}

export function isBriefComplete(brief: ClientProjectBrief): boolean {
  return brief.primary_goal !== null && brief.site_type !== null;
}
