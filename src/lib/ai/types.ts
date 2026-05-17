import type { ClientProjectBrief } from "@/types/client-project-brief";

export interface ProposalSuggestionRequest {
  businessCategory: string | null;
  industryTags: string[];
  projectBrief: ClientProjectBrief | null;
  proposalTitle?: string;
  librarySections?: {
    id: string;
    title: string;
    description: string | null;
    default_amount: number;
    category: string | null;
  }[];
}

export interface ProposalSuggestion {
  title: string;
  description: string;
  suggestedAmount: number;
  category: string;
  librarySectionId?: string;
}

export type SuggestionSource = "rules" | "llm" | "llm_disabled";

export interface ProposalSuggestionResult {
  suggestions: ProposalSuggestion[];
  source: SuggestionSource;
}
