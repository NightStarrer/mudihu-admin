import type {
  ProposalSuggestionRequest,
  ProposalSuggestionResult,
} from "@/lib/ai/types";

const INDUSTRY_HINTS: Record<string, ProposalSuggestionResult["suggestions"]> =
  {
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

export async function getProposalSuggestions(
  request: ProposalSuggestionRequest
): Promise<ProposalSuggestionResult> {
  const key = request.businessCategory?.toLowerCase() ?? "";
  const suggestions = INDUSTRY_HINTS[key] ?? [];

  return { suggestions };
}
