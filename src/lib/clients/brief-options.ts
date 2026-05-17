export const PRIMARY_GOAL_OPTIONS = [
  { value: "brand_presence", label: "Brand presence" },
  { value: "lead_generation", label: "Lead generation" },
  { value: "online_sales", label: "Online sales" },
  { value: "bookings", label: "Bookings / appointments" },
  { value: "support", label: "Customer support" },
  { value: "other", label: "Other" },
] as const;

export const SITE_TYPE_OPTIONS = [
  { value: "static", label: "Static website" },
  { value: "dynamic", label: "Dynamic website" },
  { value: "web_app", label: "Web application" },
  { value: "landing_only", label: "Landing page only" },
] as const;

export const COMMERCE_OPTIONS = [
  { value: "none", label: "No commerce" },
  { value: "catalog_only", label: "Product catalog (no checkout)" },
  { value: "full_ecommerce", label: "Full e-commerce" },
  { value: "subscriptions", label: "Subscriptions" },
] as const;

export const CMS_OPTIONS = [
  { value: "no_preference", label: "No preference" },
  { value: "wordpress", label: "WordPress" },
  { value: "headless", label: "Headless CMS" },
  { value: "custom", label: "Custom build" },
  { value: "none", label: "No CMS needed" },
] as const;

export const AUTH_LEVEL_OPTIONS = [
  { value: "none", label: "No user accounts" },
  { value: "admin_only", label: "Admin only" },
  { value: "customers", label: "Customer accounts" },
  { value: "roles", label: "Multiple roles" },
] as const;

export const BUDGET_TIER_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "enterprise", label: "Enterprise" },
] as const;

export const TIMELINE_OPTIONS = [
  { value: "urgent", label: "Urgent (< 4 weeks)" },
  { value: "standard", label: "Standard (1–3 months)" },
  { value: "flexible", label: "Flexible" },
] as const;

export const FEATURE_OPTIONS = [
  { value: "contact_forms", label: "Contact forms" },
  { value: "live_chat", label: "Live chat" },
  { value: "payments", label: "Online payments" },
  { value: "user_login", label: "User login" },
  { value: "search", label: "Site search" },
  { value: "multilingual", label: "Multilingual" },
  { value: "blog", label: "Blog / news" },
  { value: "booking", label: "Booking system" },
  { value: "reviews", label: "Reviews / testimonials" },
  { value: "analytics", label: "Analytics dashboard" },
] as const;

export const CONTENT_TYPE_OPTIONS = [
  { value: "services", label: "Services" },
  { value: "portfolio", label: "Portfolio" },
  { value: "products", label: "Products" },
  { value: "team", label: "Team / about" },
  { value: "menu", label: "Menu / catalog" },
  { value: "docs", label: "Documentation" },
  { value: "faq", label: "FAQ" },
] as const;

export const INTEGRATION_OPTIONS = [
  { value: "razorpay", label: "Razorpay" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "google_maps", label: "Google Maps" },
  { value: "google_analytics", label: "Google Analytics" },
  { value: "crm", label: "CRM" },
  { value: "email_marketing", label: "Email marketing" },
  { value: "gmb", label: "Google Business Profile" },
] as const;

export function labelForOption(
  options: readonly { value: string; label: string }[],
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
