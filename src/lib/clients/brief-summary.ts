import type { ClientProjectBrief } from "@/types/client-project-brief";
import {
  COMMERCE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SITE_TYPE_OPTIONS,
  labelForOption,
} from "@/lib/clients/brief-options";
import { isBriefComplete } from "@/types/client-project-brief";

export function summarizeProjectBrief(brief: ClientProjectBrief): string | null {
  if (!isBriefComplete(brief)) return null;

  const parts: string[] = [];

  if (brief.primary_goal) {
    parts.push(
      `Goal: ${labelForOption(PRIMARY_GOAL_OPTIONS, brief.primary_goal)}`
    );
  }
  if (brief.site_type) {
    parts.push(
      `Site: ${labelForOption(SITE_TYPE_OPTIONS, brief.site_type)}`
    );
  }
  if (brief.commerce) {
    parts.push(
      `Commerce: ${labelForOption(COMMERCE_OPTIONS, brief.commerce)}`
    );
  }
  if (brief.must_have_features.length) {
    parts.push(`Must-have: ${brief.must_have_features.join(", ")}`);
  }

  return parts.join(" · ");
}
