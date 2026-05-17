import type {
  ProposalSuggestionRequest,
  ProposalSuggestionResult,
} from "@/lib/ai/types";

/** Phase 2: replace with OpenAI/Anthropic provider using project brief + library context. */
export async function getLlmSuggestions(
  _request: ProposalSuggestionRequest
): Promise<ProposalSuggestionResult> {
  return { suggestions: [], source: "llm_disabled" };
}
