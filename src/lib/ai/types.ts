export interface ProposalSuggestionRequest {
  businessCategory: string | null;
  industryTags: string[];
  proposalTitle?: string;
}

export interface ProposalSuggestion {
  title: string;
  description: string;
  suggestedAmount: number;
  category: string;
}

export interface ProposalSuggestionResult {
  suggestions: ProposalSuggestion[];
}
