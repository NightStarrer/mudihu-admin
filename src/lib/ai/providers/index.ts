import { runRulesEngine } from "@/lib/ai/rules-engine";
import type {
  ProposalSuggestionRequest,
  ProposalSuggestionResult,
} from "@/lib/ai/types";
import { getLlmSuggestions } from "@/lib/ai/providers/llm-stub";

export async function getProposalSuggestions(
  request: ProposalSuggestionRequest
): Promise<ProposalSuggestionResult> {
  const ruleSuggestions = runRulesEngine(request);

  if (
    process.env.AI_PROVIDER === "openai" &&
    process.env.OPENAI_API_KEY
  ) {
    const llm = await getLlmSuggestions(request);
    if (llm.suggestions.length > 0) {
      return llm;
    }
  }

  return { suggestions: ruleSuggestions, source: "rules" };
}
