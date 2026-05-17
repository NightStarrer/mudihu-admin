import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createPdfStyles } from "@/lib/pdf/theme";
import { getDocumentDate, formatPdfDateShort } from "@/lib/pdf/dates";
import { formatPdfMoney } from "@/lib/money/currency";
import type { BrandingTokens, ProposalWithRelations } from "@/types/database";
import {
  calculateProposalTotals,
  discountFromProposal,
} from "@/lib/proposals/calculate-totals";
import { discountSummaryLine } from "@/lib/proposals/discount";
import {
  filterPhasesForDocument,
  PDF_DOCUMENT_LABELS,
  type PdfDocumentType,
} from "@/lib/proposals/document-types";

function BankDetailsBlock({
  branding,
  styles,
}: {
  branding: BrandingTokens;
  styles: ReturnType<typeof createPdfStyles>;
}) {
  const bank = branding.bank;
  if (!bank?.showOnDocuments) return null;

  const lines: string[] = [];
  if (bank.accountName) lines.push(`Account name: ${bank.accountName}`);
  if (bank.bankName) lines.push(`Bank: ${bank.bankName}`);
  if (bank.branch) lines.push(`Branch: ${bank.branch}`);
  if (bank.accountNumber) lines.push(`Account no.: ${bank.accountNumber}`);
  if (bank.ifsc) lines.push(`IFSC: ${bank.ifsc}`);
  if (bank.upiId) lines.push(`UPI: ${bank.upiId}`);

  if (!lines.length) return null;

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionLabel}>Payment details</Text>
      {lines.map((line, i) => (
        <Text key={i} style={styles.bodyText}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function ProposalDocument({
  proposal,
  branding,
  documentType = "proposal",
}: {
  proposal: ProposalWithRelations;
  branding: BrandingTokens;
  documentType?: PdfDocumentType;
}) {
  const styles = createPdfStyles(branding);
  const labels = PDF_DOCUMENT_LABELS[documentType];
  const currency = proposal.client.currency_code ?? "INR";
  const fmt = (n: number) => formatPdfMoney(n, currency);
  const phases = filterPhasesForDocument(proposal.phases, documentType);
  const discount = discountFromProposal(proposal);
  const totals = calculateProposalTotals(
    proposal.phases,
    Number(proposal.gst_rate),
    documentType,
    discount
  );
  const paymentTerms =
    (proposal.payment_terms as { text?: string })?.text ?? "";
  const showBank =
    documentType === "invoice" || documentType === "cost_sheet";
  const documentDate = getDocumentDate(proposal, documentType);
  const generatedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const customMessage = proposal.custom_notes?.trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            {branding.logoUrl ? (
              <Image src={branding.logoUrl} style={{ width: 42, height: 42 }} />
            ) : (
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>MH</Text>
              </View>
            )}
            <View>
              <Text style={styles.agencyName}>{branding.agencyName}</Text>
              <Text style={styles.docType}>{labels.title}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.metaLabel}>Document date</Text>
            <Text style={styles.metaValue}>{documentDate}</Text>
            {documentType === "invoice" && proposal.invoice_number ? (
              <>
                <Text style={styles.metaLabel}>Invoice no.</Text>
                <Text style={styles.metaValue}>{proposal.invoice_number}</Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{proposal.title}</Text>
          {proposal.description ? (
            <Text style={styles.subtitle}>{proposal.description}</Text>
          ) : null}
        </View>

        {customMessage ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{customMessage}</Text>
          </View>
        ) : null}

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Prepared for</Text>
            <Text style={styles.infoLineStrong}>
              {proposal.client.company_name}
            </Text>
            {proposal.client.contact_person ? (
              <Text style={styles.infoLine}>{proposal.client.contact_person}</Text>
            ) : null}
            {proposal.client.email ? (
              <Text style={styles.infoLine}>{proposal.client.email}</Text>
            ) : null}
            {proposal.client.gst_number ? (
              <Text style={styles.infoLine}>GSTIN: {proposal.client.gst_number}</Text>
            ) : null}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Details</Text>
            <Text style={styles.infoLine}>
              Currency: {currency}
            </Text>
            {documentType === "proposal" && proposal.proposal_date ? (
              <Text style={styles.infoLine}>
                Valid from: {formatPdfDateShort(proposal.proposal_date)}
              </Text>
            ) : null}
            {documentType === "cost_sheet" && proposal.cost_sheet_date ? (
              <Text style={styles.infoLine}>
                Cost sheet date: {formatPdfDateShort(proposal.cost_sheet_date)}
              </Text>
            ) : null}
            {documentType === "invoice" && proposal.invoice_date ? (
              <Text style={styles.infoLine}>
                Invoice date: {formatPdfDateShort(proposal.invoice_date)}
              </Text>
            ) : null}
            {documentType === "invoice" && proposal.due_date ? (
              <Text style={styles.infoLine}>
                Due date: {formatPdfDateShort(proposal.due_date)}
              </Text>
            ) : null}
          </View>
        </View>

        {phases.length === 0 ? (
          <Text style={styles.bodyText}>
            No line items are marked for inclusion in this document. Update
            inclusion settings on the proposal and export again.
          </Text>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, { width: 76, textAlign: "right" }]}>
                Amount
              </Text>
            </View>
            {phases.map((phase) => (
              <View key={phase.id}>
                <Text style={styles.phaseTitle}>{phase.name}</Text>
                {phase.groups.map((group) => (
                  <View key={group.id} style={styles.groupRow}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.groupTitle}>{group.title}</Text>
                      {group.description ? (
                        <Text style={styles.groupDesc}>{group.description}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.amount}>
                      {fmt(Number(group.amount))}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <View style={styles.totalsBox}>
          {totals.phaseTotals.map((pt) => (
            <View key={pt.phaseId} style={styles.totalRow}>
              <Text>{pt.phaseName}</Text>
              <Text>{fmt(pt.subtotal)}</Text>
            </View>
          ))}
          <View style={styles.totalDivider}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{fmt(totals.subtotal)}</Text>
            </View>
            {totals.discountAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text>
                  {discountSummaryLine(discount, totals.discountAmount)}
                </Text>
                <Text>- {fmt(totals.discountAmount)}</Text>
              </View>
            ) : null}
            {totals.discountAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text>Amount after discount</Text>
                <Text>{fmt(totals.afterDiscount)}</Text>
              </View>
            ) : null}
            <View style={styles.totalRow}>
              <Text>GST ({proposal.gst_rate}%)</Text>
              <Text>{fmt(totals.gstAmount)}</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: 6 }]}>
              <Text style={styles.grandTotal}>{labels.totalLabel}</Text>
              <Text style={styles.grandTotal}>{fmt(totals.total)}</Text>
            </View>
          </View>
        </View>

        {showBank ? (
          <BankDetailsBlock branding={branding} styles={styles} />
        ) : null}

        {paymentTerms ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Payment terms</Text>
            <Text style={styles.bodyText}>{paymentTerms}</Text>
          </View>
        ) : null}

        {proposal.complimentary_services ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Complimentary services</Text>
            <Text style={styles.bodyText}>{proposal.complimentary_services}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {branding.footerText} · Generated {generatedAt}
        </Text>
      </Page>
    </Document>
  );
}
