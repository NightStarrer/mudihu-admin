import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalDocument } from "@/components/pdf/proposal-document";
import type { BrandingTokens, ProposalWithRelations } from "@/types/database";

export async function renderProposalPdf(
  proposal: ProposalWithRelations,
  branding: BrandingTokens
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <ProposalDocument proposal={proposal} branding={branding} />
  );
  return Buffer.from(buffer);
}
