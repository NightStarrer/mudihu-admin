"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  addPhaseAction,
  addGroupAction,
  deleteGroupAction,
  deletePhaseAction,
  insertFromLibraryAction,
  updateGroupAction,
  updateGroupInclusionAction,
  updatePhaseAction,
  updatePhaseInclusionAction,
  updateProposalMetaAction,
} from "@/app/actions/proposals";
import {
  calculateProposalTotals,
  discountFromProposal,
  formatMoney,
} from "@/lib/proposals/calculate-totals";
import { discountSummaryLine } from "@/lib/proposals/discount";
import { CoverLetterCard } from "@/components/proposals/cover-letter-card";
import { DiscountFields } from "@/components/proposals/discount-fields";
import { DocumentDatesCard } from "@/components/proposals/document-dates-card";
import { currencySymbolForUi } from "@/lib/money/currency";
import type { PdfDocumentType } from "@/lib/proposals/document-types";
import { DocumentInclusionToggles } from "@/components/proposals/document-inclusion-toggles";
import type {
  ProposalSectionLibrary,
  ProposalWithRelations,
} from "@/types/database";
import { toast } from "sonner";
import { Plus, Trash2, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import { getProposalSuggestions } from "@/lib/ai/providers/index";
import { clientBriefHref } from "@/components/clients/client-detail-tabs";
import { parseProjectBrief } from "@/types/client-project-brief";
import type { ProposalSuggestion } from "@/lib/ai/types";
import type { SuggestionSource } from "@/lib/ai/types";

export function ProposalBuilder({
  proposal,
  library,
}: {
  proposal: ProposalWithRelations;
  library: ProposalSectionLibrary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [exporting, setExporting] = useState<PdfDocumentType | null>(null);
  const [suggestions, setSuggestions] = useState<ProposalSuggestion[]>([]);
  const [suggestionSource, setSuggestionSource] =
    useState<SuggestionSource | null>(null);

  const currency = proposal.client.currency_code ?? "INR";
  const fmt = (n: number) => formatMoney(n, currency);
  const gstRate = Number(proposal.gst_rate);
  const discount = discountFromProposal(proposal);
  const proposalTotals = calculateProposalTotals(
    proposal.phases,
    gstRate,
    "proposal",
    discount
  );
  const invoiceTotals = calculateProposalTotals(
    proposal.phases,
    gstRate,
    "invoice",
    discount
  );
  const costSheetTotals = calculateProposalTotals(
    proposal.phases,
    gstRate,
    "cost_sheet",
    discount
  );

  async function handleExportPdf(documentType: PdfDocumentType) {
    if (!proposal.phases.some((p) => p.groups.length > 0)) {
      toast.error("Add at least one development area before exporting");
      return;
    }
    setExporting(documentType);
    try {
      const res = await fetch("/api/pdf/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id, documentType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      window.open(data.url, "_blank");
      toast.success("PDF generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  const firstPhaseId = proposal.phases[0]?.id;

  async function loadSuggestions() {
    const result = await getProposalSuggestions({
      businessCategory: proposal.client.business_category,
      industryTags: proposal.client.industry_tags ?? [],
      proposalTitle: proposal.title,
      projectBrief: parseProjectBrief(proposal.client.project_brief),
      librarySections: library.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        default_amount: Number(l.default_amount),
        category: l.category,
      })),
    });
    setSuggestions(result.suggestions);
    setSuggestionSource(result.source);
    if (!result.suggestions.length) {
      toast.info("No suggestions yet — complete the client project brief");
    } else {
      toast.success(
        result.source === "rules"
          ? "Suggestions from project brief"
          : "AI suggestions ready"
      );
    }
  }

  async function applySuggestion(s: ProposalSuggestion) {
    if (!firstPhaseId) {
      toast.error("Add a phase first");
      return;
    }
    startTransition(async () => {
      if (s.librarySectionId) {
        await insertFromLibraryAction(
          firstPhaseId,
          proposal.id,
          s.librarySectionId
        );
      } else {
        await addGroupAction(firstPhaseId, proposal.id, {
          title: s.title,
          description: s.description,
          amount: s.suggestedAmount,
        });
      }
      router.refresh();
      toast.success("Added to proposal");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <CoverLetterCard
          proposalId={proposal.id}
          customNotes={proposal.custom_notes}
        />

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Proposal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                defaultValue={proposal.title}
                onBlur={(e) =>
                  startTransition(async () => {
                    await updateProposalMetaAction(proposal.id, {
                      title: e.target.value,
                    });
                    router.refresh();
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                defaultValue={proposal.description ?? ""}
                rows={3}
                onBlur={(e) =>
                  startTransition(async () => {
                    await updateProposalMetaAction(proposal.id, {
                      description: e.target.value || null,
                    });
                    router.refresh();
                  })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  defaultValue={proposal.status}
                  onValueChange={(v) => {
                    if (!v) return;
                    startTransition(async () => {
                      await updateProposalMetaAction(proposal.id, {
                        status: v as typeof proposal.status,
                      });
                      router.refresh();
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>GST %</Label>
                <Input
                  type="number"
                  defaultValue={proposal.gst_rate}
                  min={0}
                  max={100}
                  onBlur={(e) =>
                    startTransition(async () => {
                      await updateProposalMetaAction(proposal.id, {
                        gst_rate: Number(e.target.value),
                      });
                      router.refresh();
                    })
                  }
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Client: <strong>{proposal.client.company_name}</strong>
              {" · "}
              Currency: <strong>{currency}</strong> (
              {currencySymbolForUi(currency)})
            </p>
          </CardContent>
        </Card>

        <DocumentDatesCard proposal={proposal} />

        <DiscountFields
          proposalId={proposal.id}
          discountType={proposal.discount_type ?? "none"}
          discountValue={Number(proposal.discount_value ?? 0)}
          discountLabel={proposal.discount_label}
        />

        {proposal.phases.map((phase) => (
          <Card key={phase.id} className="border-border/60">
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  defaultValue={phase.name}
                  className="w-full font-semibold sm:max-w-xs"
                  onBlur={(e) =>
                    startTransition(async () => {
                      await updatePhaseAction(phase.id, proposal.id, {
                        name: e.target.value,
                      });
                      router.refresh();
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deletePhaseAction(phase.id, proposal.id);
                      router.refresh();
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Include phase in
                </p>
                <DocumentInclusionToggles
                  compact
                  disabled={pending}
                  values={{
                    include_in_proposal: phase.include_in_proposal,
                    include_in_invoice: phase.include_in_invoice,
                    include_in_cost_sheet: phase.include_in_cost_sheet,
                  }}
                  onChange={(key, checked) =>
                    startTransition(async () => {
                      await updatePhaseInclusionAction(phase.id, proposal.id, {
                        [key]: checked,
                      });
                      router.refresh();
                    })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {phase.groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-lg border border-border/60 bg-muted/30 p-4"
                >
                  <Input
                    defaultValue={group.title}
                    className="mb-2 font-medium"
                    onBlur={(e) =>
                      startTransition(async () => {
                        await updateGroupAction(group.id, proposal.id, {
                          title: e.target.value,
                        });
                        router.refresh();
                      })
                    }
                  />
                  <Textarea
                    defaultValue={group.description ?? ""}
                    placeholder="Describe interconnected scope and scalability…"
                    rows={2}
                    className="mb-2 text-sm"
                    onBlur={(e) =>
                      startTransition(async () => {
                        await updateGroupAction(group.id, proposal.id, {
                          description: e.target.value || null,
                        });
                        router.refresh();
                      })
                    }
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label className="text-xs">Amount (₹)</Label>
                      <Input
                        type="number"
                        className="w-full min-w-0 sm:w-32"
                        defaultValue={group.amount}
                        min={0}
                        onBlur={(e) =>
                          startTransition(async () => {
                            await updateGroupAction(group.id, proposal.id, {
                              amount: Number(e.target.value),
                            });
                            router.refresh();
                          })
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        startTransition(async () => {
                          await deleteGroupAction(group.id, proposal.id);
                          router.refresh();
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 space-y-1.5 border-t border-border/40 pt-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Include line item in
                    </p>
                    <DocumentInclusionToggles
                      compact
                      disabled={pending}
                      values={{
                        include_in_proposal: group.include_in_proposal,
                        include_in_invoice: group.include_in_invoice,
                        include_in_cost_sheet: group.include_in_cost_sheet,
                      }}
                      onChange={(key, checked) =>
                        startTransition(async () => {
                          await updateGroupInclusionAction(
                            group.id,
                            proposal.id,
                            { [key]: checked }
                          );
                          router.refresh();
                        })
                      }
                    />
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-2">
                <AddGroupButton phaseId={phase.id} proposalId={proposal.id} />
                <Select
                  onValueChange={(libId) => {
                    const id = String(libId ?? "");
                    if (!id) return;
                    startTransition(async () => {
                      await insertFromLibraryAction(
                        phase.id,
                        proposal.id,
                        id
                      );
                      router.refresh();
                    });
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Insert from library" />
                  </SelectTrigger>
                  <SelectContent>
                    {library.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await addPhaseAction(
                proposal.id,
                `Phase ${proposal.phases.length + 1}`
              );
              router.refresh();
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add phase
        </Button>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Terms & notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment terms</Label>
              <Textarea
                defaultValue={
                  (proposal.payment_terms as { text?: string })?.text ?? ""
                }
                rows={2}
                onBlur={(e) =>
                  startTransition(async () => {
                    await updateProposalMetaAction(proposal.id, {
                      payment_terms: e.target.value,
                    });
                    router.refresh();
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Complimentary services</Label>
              <Textarea
                defaultValue={proposal.complimentary_services ?? ""}
                rows={2}
                onBlur={(e) =>
                  startTransition(async () => {
                    await updateProposalMetaAction(proposal.id, {
                      complimentary_services: e.target.value || null,
                    });
                    router.refresh();
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-primary/20 bg-card shadow-md lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-xs font-medium text-muted-foreground">
              Proposal total
            </p>
            {proposalTotals.phaseTotals.map((pt) => (
              <div key={pt.phaseId} className="flex justify-between">
                <span className="text-muted-foreground">{pt.phaseName}</span>
                <span>{fmt(pt.subtotal)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(proposalTotals.subtotal)}</span>
            </div>
            {proposalTotals.discountAmount > 0 ? (
              <>
                <div className="flex justify-between text-primary">
                  <span>
                    {discountSummaryLine(discount, proposalTotals.discountAmount)}
                  </span>
                  <span>- {fmt(proposalTotals.discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">After discount</span>
                  <span>{fmt(proposalTotals.afterDiscount)}</span>
                </div>
              </>
            ) : null}
            <div className="flex justify-between">
              <span>GST ({proposal.gst_rate}%)</span>
              <span>{fmt(proposalTotals.gstAmount)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{fmt(proposalTotals.total)}</span>
            </div>

            <Separator />

            <p className="text-xs font-medium text-muted-foreground">
              Invoice (included items)
            </p>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(invoiceTotals.subtotal)}</span>
            </div>
            {invoiceTotals.discountAmount > 0 ? (
              <div className="flex justify-between text-primary">
                <span>
                  {discountSummaryLine(discount, invoiceTotals.discountAmount)}
                </span>
                <span>- {fmt(invoiceTotals.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>GST ({proposal.gst_rate}%)</span>
              <span>{fmt(invoiceTotals.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Amount due</span>
              <span className="text-primary">{fmt(invoiceTotals.total)}</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full bg-primary"
                onClick={() => handleExportPdf("proposal")}
                disabled={exporting !== null}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting === "proposal" ? "Generating…" : "Export proposal"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleExportPdf("invoice")}
                disabled={exporting !== null}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting === "invoice" ? "Generating…" : "Export invoice"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleExportPdf("cost_sheet")}
                disabled={exporting !== null}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting === "cost_sheet"
                  ? "Generating…"
                  : "Export cost sheet"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cost sheet total: {fmt(costSheetTotals.total)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              AI suggestions
              <Badge variant="outline" className="text-xs">
                Preview
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" onClick={loadSuggestions}>
              Get suggestions
            </Button>
            {suggestionSource ? (
              <p className="text-xs text-muted-foreground capitalize">
                Source: {suggestionSource.replace("_", " ")}
              </p>
            ) : null}
            {suggestions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                <Link
                  href={clientBriefHref(proposal.client.id)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Complete client brief
                </Link>{" "}
                for better suggestions.
              </p>
            ) : null}
            {suggestions.map((s, i) => (
              <div key={i} className="space-y-2 rounded border p-2 text-xs">
                <p className="font-medium">{s.title}</p>
                <p className="text-muted-foreground">{s.description}</p>
                <p className="mt-1">{fmt(s.suggestedAmount)}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 w-full"
                  disabled={pending || !firstPhaseId}
                  onClick={() => applySuggestion(s)}
                >
                  Add to proposal
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AddGroupButton({
  phaseId,
  proposalId,
}: {
  phaseId: string;
  proposalId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await addGroupAction(phaseId, proposalId, {
            title: "New development area",
            description:
              "Describe how this area connects to the broader platform foundation.",
            amount: 0,
          });
          router.refresh();
        })
      }
    >
      <Plus className="mr-1 h-3 w-3" />
      Add area
    </Button>
  );
}
