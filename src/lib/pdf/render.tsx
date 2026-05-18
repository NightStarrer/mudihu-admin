import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalDocument } from "@/components/pdf/proposal-document";
import type { BrandingTokens, ProposalWithRelations } from "@/types/database";
import type { PdfDocumentType } from "@/lib/proposals/document-types";
import type { PdfInvoiceOverride } from "@/lib/pdf/types";

export async function renderProposalPdf(
  proposal: ProposalWithRelations,
  branding: BrandingTokens,
  documentType: PdfDocumentType = "proposal",
  invoiceOverride?: PdfInvoiceOverride
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <ProposalDocument
      proposal={proposal}
      branding={branding}
      documentType={documentType}
      invoiceOverride={invoiceOverride}
    />
  );
  return Buffer.from(buffer);
}
