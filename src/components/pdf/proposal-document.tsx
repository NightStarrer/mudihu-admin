import {
  Document,
  Page,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import { createPdfStyles, formatPdfINR } from "@/lib/pdf/theme";
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {branding.logoUrl ? (
              <Image src={branding.logoUrl} style={{ width: 40, height: 40 }} />
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
          <Text style={styles.docType}>
            {new Date().toLocaleDateString("en-IN")}
          </Text>
        </View>

        <Text style={styles.title}>{proposal.title}</Text>
        {proposal.description ? (
          <Text style={styles.subtitle}>{proposal.description}</Text>
        ) : null}

        <View style={styles.clientBlock}>
          <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
            Prepared for
          </Text>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>
            {proposal.client.company_name}
          </Text>
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
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    {group.description ? (
                      <Text style={styles.groupDesc}>{group.description}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.amount}>
                    {formatPdfINR(Number(group.amount))}
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
              <Text>{formatPdfINR(pt.subtotal)}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text>Subtotal</Text>
            <Text>{formatPdfINR(totals.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>GST ({proposal.gst_rate}%)</Text>
            <Text>{formatPdfINR(totals.gstAmount)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={styles.grandTotal}>{labels.totalLabel}</Text>
            <Text style={styles.grandTotal}>{formatPdfINR(totals.total)}</Text>
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
        </Text>
      </Page>
    </Document>
  );
}
