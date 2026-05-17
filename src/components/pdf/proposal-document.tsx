import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createPdfStyles } from "@/lib/pdf/theme";
import { getDocumentDate, formatPdfDateShort } from "@/lib/pdf/dates";
import { formatPdfMoney } from "@/lib/money/currency";
import type { BrandingTokens, ProposalWithRelations } from "@/types/database";
import { calculateProposalTotals } from "@/lib/proposals/calculate-totals";
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
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionLabel}>Payment details</Text>
      {lines.map((line, i) => (
        <Text key={i} style={styles.bodyText}>
          {line}
        </Text>
      ))}
    </View>
  );
}

function MetaBlock({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createPdfStyles>;
}) {
  return (
    <View>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
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
  const totals = calculateProposalTotals(
    proposal.phases,
    Number(proposal.gst_rate),
    documentType
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            {branding.logoUrl ? (
              <Image src={branding.logoUrl} style={{ width: 44, height: 44 }} />
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
            <MetaBlock label="Document date" value={documentDate} styles={styles} />
            {documentType === "invoice" && proposal.invoice_number ? (
              <MetaBlock
                label="Invoice no."
                value={proposal.invoice_number}
                styles={styles}
              />
            ) : null}
            <MetaBlock label="Currency" value={currency} styles={styles} />
          </View>
        </View>

        <Text style={styles.title}>{proposal.title}</Text>
        {proposal.description ? (
          <Text style={styles.subtitle}>{proposal.description}</Text>
        ) : null}

        {(documentType === "invoice" && proposal.due_date) ||
        documentType !== "invoice" ? (
          <View style={styles.datesRow}>
            {documentType === "invoice" && proposal.due_date ? (
              <View style={styles.dateCell}>
                <Text style={styles.metaLabel}>Due date</Text>
                <Text style={styles.metaValue}>
                  {formatPdfDateShort(proposal.due_date)}
                </Text>
              </View>
            ) : null}
            {proposal.proposal_date && documentType === "proposal" ? (
              <View style={styles.dateCell}>
                <Text style={styles.metaLabel}>Valid from</Text>
                <Text style={styles.metaValue}>
                  {formatPdfDateShort(proposal.proposal_date)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.clientBlock}>
          <Text style={styles.clientLabel}>Prepared for</Text>
          <Text style={styles.clientName}>{proposal.client.company_name}</Text>
          {proposal.client.contact_person ? (
            <Text style={styles.bodyText}>{proposal.client.contact_person}</Text>
          ) : null}
          {proposal.client.email ? (
            <Text style={styles.bodyText}>{proposal.client.email}</Text>
          ) : null}
          {proposal.client.gst_number ? (
            <Text style={styles.bodyText}>
              GSTIN: {proposal.client.gst_number}
            </Text>
          ) : null}
        </View>

        {phases.length === 0 ? (
          <Text style={styles.bodyText}>
            No line items are marked for inclusion in this document. Update
            inclusion settings on the proposal and export again.
          </Text>
        ) : (
          phases.map((phase) => (
            <View key={phase.id} wrap={false}>
              <Text style={styles.phaseTitle}>{phase.name}</Text>
              {phase.groups.map((group) => (
                <View key={group.id} style={styles.groupRow}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
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
          ))
        )}

        <View style={styles.totalsBox}>
          {totals.phaseTotals.map((pt) => (
            <View key={pt.phaseId} style={styles.totalRow}>
              <Text>{pt.phaseName}</Text>
              <Text>{fmt(pt.subtotal)}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text>Subtotal</Text>
            <Text>{fmt(totals.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>GST ({proposal.gst_rate}%)</Text>
            <Text>{fmt(totals.gstAmount)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={styles.grandTotal}>{labels.totalLabel}</Text>
            <Text style={styles.grandTotal}>{fmt(totals.total)}</Text>
          </View>
        </View>

        {showBank ? (
          <BankDetailsBlock branding={branding} styles={styles} />
        ) : null}

        {paymentTerms ? (
          <View>
            <Text style={styles.sectionLabel}>Payment terms</Text>
            <Text style={styles.bodyText}>{paymentTerms}</Text>
          </View>
        ) : null}

        {proposal.complimentary_services ? (
          <View>
            <Text style={styles.sectionLabel}>Complimentary services</Text>
            <Text style={styles.bodyText}>{proposal.complimentary_services}</Text>
          </View>
        ) : null}

        {proposal.custom_notes ? (
          <View>
            <Text style={styles.sectionLabel}>Additional notes</Text>
            <Text style={styles.bodyText}>{proposal.custom_notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {branding.footerText}
          {" · "}
          Generated {generatedAt}
          {proposal.last_invoice_exported_at && documentType === "invoice"
            ? ` · Last exported ${formatPdfDateShort(proposal.last_invoice_exported_at.slice(0, 10))}`
            : ""}
        </Text>
      </Page>
    </Document>
  );
}
