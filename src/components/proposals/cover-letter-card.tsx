"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProposalMetaAction } from "@/app/actions/proposals";

const EXAMPLE = `Hello,

We are pleased to present this proposal for your consideration.

In view of our ongoing relationship, we have applied a substantial discount to the investment outlined below. We look forward to partnering with you on this project.`;

export function CoverLetterCard({
  proposalId,
  customNotes,
}: {
  proposalId: string;
  customNotes: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Cover letter</CardTitle>
        <p className="text-sm text-muted-foreground">
          Personal introduction shown at the top of every exported PDF — right
          under the project title. Use it for greetings, context, or to mention
          relationship discounts in prose (amounts go in the discount section
          below).
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="cover_letter">Your message</Label>
          <Textarea
            id="cover_letter"
            defaultValue={customNotes ?? ""}
            rows={6}
            disabled={pending}
            placeholder={EXAMPLE}
            className="min-h-[140px] bg-background text-sm leading-relaxed"
            onBlur={(e) =>
              startTransition(async () => {
                await updateProposalMetaAction(proposalId, {
                  custom_notes: e.target.value.trim() || null,
                });
                router.refresh();
              })
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: Start with &quot;Hello,&quot; and keep line breaks — they appear
          in the PDF. Leave empty to omit this section.
        </p>
      </CardContent>
    </Card>
  );
}
