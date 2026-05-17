import type {
  ProposalSuggestion,
  ProposalSuggestionRequest,
} from "@/lib/ai/types";

const INDUSTRY_HINTS: Record<string, ProposalSuggestion[]> = {
  dentist: [
    {
      title: "Local SEO & Google Business Optimization",
      description: "Improve local visibility and appointment discovery.",
      suggestedAmount: 12000,
      category: "marketing",
    },
    {
      title: "WhatsApp Appointment Automation",
      description: "Automated reminders and patient follow-ups.",
      suggestedAmount: 15000,
      category: "operations",
    },
    {
      title: "Review Management System",
      description: "Collect and showcase patient testimonials.",
      suggestedAmount: 8000,
      category: "experience",
    },
  ],
};

const TITLE_KEYWORDS: {
  keywords: string[];
  suggestion: Omit<ProposalSuggestion, "suggestedAmount"> & {
    amountKey?: string;
  };
}[] = [
  {
    keywords: ["ui", "ux", "frontend"],
    suggestion: {
      title: "UI/UX & Frontend Platform Development",
      description: "Design system, responsive interfaces, and client-facing experience.",
      category: "foundation",
    },
  },
  {
    keywords: ["backend", "api", "scalability"],
    suggestion: {
      title: "Backend Scalability Foundation",
      description: "API architecture, database design, and extensibility.",
      category: "foundation",
    },
  },
  {
    keywords: ["seo", "google business", "local"],
    suggestion: {
      title: "Local SEO & Google Business Optimization",
      description: "Local visibility, GMB setup, and citation consistency.",
      category: "marketing",
    },
  },
  {
    keywords: ["lead", "crm", "admin"],
    suggestion: {
      title: "Lead Management & Admin Operations",
      description: "CRM workflows, notifications, and operational dashboards.",
      category: "operations",
    },
  },
  {
    keywords: ["customer", "experience", "engagement"],
    suggestion: {
      title: "Customer Experience Features",
      description: "User journeys, engagement flows, and conversion optimization.",
      category: "experience",
    },
  },
];

function matchLibrary(
  title: string,
  library: ProposalSuggestionRequest["librarySections"]
): ProposalSuggestion | null {
  if (!library?.length) return null;
  const lower = title.toLowerCase();
  const item = library.find(
    (l) =>
      l.title.toLowerCase() === lower ||
      l.title.toLowerCase().includes(lower) ||
      lower.includes(l.title.toLowerCase())
  );
  if (!item) return null;
  return {
    title: item.title,
    description: item.description ?? "",
    suggestedAmount: Number(item.default_amount),
    category: item.category ?? "general",
    librarySectionId: item.id,
  };
}

function suggestionFromLibraryOrDefault(
  partial: Omit<ProposalSuggestion, "suggestedAmount"> & {
    suggestedAmount?: number;
  },
  library: ProposalSuggestionRequest["librarySections"]
): ProposalSuggestion {
  const fromLib = matchLibrary(partial.title, library);
  if (fromLib) return fromLib;
  return {
    ...partial,
    suggestedAmount: partial.suggestedAmount ?? 15000,
  };
}

function dedupeByTitle(items: ProposalSuggestion[]): ProposalSuggestion[] {
  const seen = new Set<string>();
  return items.filter((s) => {
    const key = s.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function runRulesEngine(
  request: ProposalSuggestionRequest
): ProposalSuggestion[] {
  const brief = request.projectBrief;
  const library = request.librarySections;
  const out: ProposalSuggestion[] = [];

  const categoryKey = request.businessCategory?.toLowerCase().trim() ?? "";
  if (categoryKey && INDUSTRY_HINTS[categoryKey]) {
    for (const hint of INDUSTRY_HINTS[categoryKey]) {
      out.push(suggestionFromLibraryOrDefault(hint, library));
    }
  }

  if (brief) {
    if (brief.commerce === "full_ecommerce" || brief.commerce === "subscriptions") {
      out.push(
        suggestionFromLibraryOrDefault(
          {
            title: "Backend Scalability Foundation",
            description: "E-commerce APIs, inventory, and order management.",
            category: "foundation",
          },
          library
        )
      );
      if (brief.must_have_features.includes("payments")) {
        out.push({
          title: "Payment Gateway Integration",
          description: "Secure checkout with Razorpay or similar.",
          suggestedAmount: 12000,
          category: "foundation",
        });
      }
    }

    if (brief.site_type === "static" && brief.commerce === "none") {
      out.push(
        suggestionFromLibraryOrDefault(
          {
            title: "UI/UX & Frontend Platform Development",
            description: "Marketing site with fast static delivery.",
            category: "foundation",
          },
          library
        ),
        suggestionFromLibraryOrDefault(
          {
            title: "Local SEO & Google Business Optimization",
            description: "Search visibility for a brochure-style site.",
            category: "marketing",
          },
          library
        )
      );
    }

    if (brief.site_type === "dynamic" || brief.site_type === "web_app") {
      out.push(
        suggestionFromLibraryOrDefault(
          {
            title: "UI/UX & Frontend Platform Development",
            description: "Dynamic interfaces and content management.",
            category: "foundation",
          },
          library
        ),
        suggestionFromLibraryOrDefault(
          {
            title: "Backend Scalability Foundation",
            description: "Server-side logic and data layer.",
            category: "foundation",
          },
          library
        )
      );
    }

    if (brief.integrations.includes("whatsapp")) {
      out.push({
        title: "WhatsApp Appointment Automation",
        description: "Automated messaging and follow-ups via WhatsApp.",
        suggestedAmount: 15000,
        category: "operations",
      });
    }

    if (brief.integrations.includes("gmb") || brief.integrations.includes("google_analytics")) {
      out.push(
        suggestionFromLibraryOrDefault(
          {
            title: "Local SEO & Google Business Optimization",
            description: "GMB and analytics setup.",
            category: "marketing",
          },
          library
        )
      );
    }

    if (
      brief.primary_goal === "lead_generation" ||
      brief.must_have_features.includes("contact_forms")
    ) {
      out.push(
        suggestionFromLibraryOrDefault(
          {
            title: "Lead Management & Admin Operations",
            description: "Capture and manage inbound leads.",
            category: "operations",
          },
          library
        )
      );
    }

    if (brief.primary_goal === "bookings" || brief.must_have_features.includes("booking")) {
      out.push({
        title: "Online Booking System",
        description: "Appointment scheduling and calendar integration.",
        suggestedAmount: 18000,
        category: "experience",
      });
    }

    if (brief.auth_level === "customers" || brief.auth_level === "roles") {
      out.push({
        title: "User Authentication & Profiles",
        description: "Secure login, registration, and role-based access.",
        suggestedAmount: 14000,
        category: "foundation",
      });
    }
  }

  if (library?.length) {
    for (const rule of TITLE_KEYWORDS) {
      const libMatch = library.find((l) =>
        rule.keywords.some((k) => l.title.toLowerCase().includes(k))
      );
      if (libMatch) {
        out.push({
          title: libMatch.title,
          description: libMatch.description ?? rule.suggestion.description,
          suggestedAmount: Number(libMatch.default_amount),
          category: libMatch.category ?? rule.suggestion.category,
          librarySectionId: libMatch.id,
        });
      }
    }
  }

  return dedupeByTitle(out);
}
