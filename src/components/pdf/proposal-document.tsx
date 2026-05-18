import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createPdfStyles } from "@/lib/pdf/theme";
import { getDocumentDate, formatPdfDateShort } from "@/lib/pdf/dates";
import { formatPdfMoney } from "@/lib/money/currency";
import type { BrandingTokens, ProposalWithRelations } from "@/types/database";
import {
  calculateProposalTotals,
  discountFromProposal,
  hasGstRate,
} from "@/lib/proposals/calculate-totals";
import { discountSummaryLine } from "@/lib/proposals/discount";
import {
  filterPhasesForDocument,
  PDF_DOCUMENT_LABELS,
  type PdfDocumentType,
} from "@/lib/proposals/document-types";
import type { PdfInvoiceOverride } from "@/lib/pdf/types";
import { getLineItemDisplay } from "@/lib/pdf/line-items";

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
  if (bank.accountNumber) lines.push(`Account no.: ${bank.accountNumber}`);
  if (bank.bankName) lines.push(`Bank: ${bank.bankName}`);
  if (bank.branch) lines.push(`Branch: ${bank.branch}`);
  if (bank.ifsc) lines.push(`IFSC: ${bank.ifsc}`);
  if (bank.upiId) lines.push(`UPI: ${bank.upiId}`);
  if (bank.gpayName || bank.gpayNumber) {
    const gpay = [bank.gpayName, bank.gpayNumber].filter(Boolean).join(" · ");
    lines.push(`GPay: ${gpay}`);
  }

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

function DocumentHeader({
  branding,
  styles,
  labels,
  documentDate,
  documentType,
  proposal,
}: {
  branding: BrandingTokens;
  styles: ReturnType<typeof createPdfStyles>;
  labels: { title: string };
  documentDate: string;
  documentType: PdfDocumentType;
  proposal: ProposalWithRelations;
}) {
  return (
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
          {documentType === "cost_sheet" ? (
            <Text style={{ fontSize: 8, color: "#888", marginTop: 2 }}>
              Internal reference — not a tax invoice
            </Text>
          ) : null}
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
  );
}

function LineItemsTable({
  phases,
  fmt,
  styles,
  documentType,
  proposalTitle,
}: {
  phases: ReturnType<typeof filterPhasesForDocument>;
  fmt: (n: number) => string;
  styles: ReturnType<typeof createPdfStyles>;
  documentType: PdfDocumentType;
  proposalTitle: string;
}) {
  const compact = documentType === "invoice";

  if (!phases.length) {
    return (
      <Text style={styles.bodyText}>
        No line items are marked for inclusion in this document.
      </Text>
    );
  }

  return (
    <>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Description</Text>
        <Text style={[styles.tableHeaderText, { width: 76, textAlign: "right" }]}>
          Amount
        </Text>
      </View>
      {phases.map((phase) => (
        <View key={phase.id}>
          <Text style={styles.phaseTitle}>{phase.name}</Text>
          {phase.groups.map((group) => {
            const { heading, subtext } = getLineItemDisplay(group, {
              proposalTitle,
              phaseName: phase.name,
            });
            const showSubtext =
              Boolean(subtext) &&
              !(compact && (subtext?.length ?? 0) > 140);

            return (
              <View key={group.id} style={styles.groupRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.groupTitle}>{heading}</Text>
                  {showSubtext ? (
                    <Text style={styles.groupDesc}>{subtext}</Text>
                  ) : null}
                </View>
                <Text style={styles.amount}>{fmt(Number(group.amount))}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </>
  );
}

export function ProposalDocument({
  proposal,
  branding,
  documentType = "proposal",
  invoiceOverride,
}: {
  proposal: ProposalWithRelations;
  branding: BrandingTokens;
  documentType?: PdfDocumentType;
  invoiceOverride?: PdfInvoiceOverride;
}) {
  const styles = createPdfStyles(branding);
  const gstRate = Number(proposal.gst_rate);
  const showGst = hasGstRate(gstRate);
  const baseLabels = PDF_DOCUMENT_LABELS[documentType];
  const labels = {
    ...baseLabels,
    title:
      documentType === "invoice" && !showGst ? "Invoice" : baseLabels.title,
  };
  const currency = proposal.client.currency_code ?? "INR";
  const fmt = (n: number) => formatPdfMoney(n, currency);
  const phases = filterPhasesForDocument(proposal.phases, documentType);
  const discount = discountFromProposal(proposal);
  const totals = calculateProposalTotals(
    proposal.phases,
    gstRate,
    documentType,
    discount
  );
  const paymentTerms =
    (proposal.payment_terms as { text?: string })?.text ?? "";
  const showBank =
    documentType === "invoice" || documentType === "cost_sheet";
  const documentDate = invoiceOverride
    ? formatPdfDateShort(invoiceOverride.invoiceDate)
    : getDocumentDate(proposal, documentType);
  const generatedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const customMessage = proposal.custom_notes?.trim();
  const timelineText =
    proposal.timeline && typeof proposal.timeline === "object"
      ? (proposal.timeline as { text?: string }).text
      : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          branding={branding}
          styles={styles}
          labels={labels}
          documentDate={documentDate}
          documentType={documentType}
          proposal={proposal}
        />

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{proposal.title}</Text>
          {proposal.description && documentType !== "invoice" ? (
            <Text style={styles.subtitle}>{proposal.description}</Text>
          ) : null}
          {documentType === "invoice" && invoiceOverride ? (
            <Text style={styles.subtitle}>
              Billing: {invoiceOverride.billingPercent}% of phase &quot;
              {invoiceOverride.phaseName}&quot;
            </Text>
          ) : null}
        </View>

        {documentType === "invoice" && invoiceOverride ? (
          <View
            style={{
              marginBottom: 16,
              padding: 14,
              backgroundColor: branding.primaryColor,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 8, color: "#fff", opacity: 0.85 }}>
              AMOUNT DUE
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#fff",
                marginTop: 4,
              }}
            >
              {fmt(invoiceOverride.amountTotal)}
            </Text>
            {showGst ? (
              <Text style={{ fontSize: 8, color: "#fff", marginTop: 6 }}>
                Subtotal {fmt(invoiceOverride.amountSubtotal)} + GST (
                {gstRate}%) {fmt(invoiceOverride.amountGst)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {customMessage && documentType === "proposal" ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>Message</Text>
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
            <Text style={styles.infoLine}>Currency: {currency}</Text>
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

        <LineItemsTable
          phases={phases}
          fmt={fmt}
          styles={styles}
          documentType={documentType}
          proposalTitle={proposal.title}
        />

        {invoiceOverride ? (
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal ({invoiceOverride.billingPercent}% of phase)</Text>
              <Text>{fmt(invoiceOverride.amountSubtotal)}</Text>
            </View>
            {showGst ? (
              <View style={styles.totalRow}>
                <Text>GST ({gstRate}%)</Text>
                <Text>{fmt(invoiceOverride.amountGst)}</Text>
              </View>
            ) : null}
            <View style={[styles.totalRow, { marginTop: 6 }]}>
              <Text style={styles.grandTotal}>{labels.totalLabel}</Text>
              <Text style={styles.grandTotal}>
                {fmt(invoiceOverride.amountTotal)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.totalsBox}>
            {documentType === "proposal" &&
              totals.phaseTotals.map((pt) => (
                <View key={pt.phaseId}>
                  <View style={styles.totalRow}>
                    <Text>{pt.phaseName}</Text>
                    <Text>{fmt(pt.subtotal)}</Text>
                  </View>
                  {pt.discountAmount > 0 ? (
                    <View style={styles.totalRow}>
                      <Text style={{ fontSize: 8, color: "#666" }}>
                        Phase discount
                      </Text>
                      <Text style={{ fontSize: 8, color: "#666" }}>
                        - {fmt(pt.discountAmount)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            <View style={styles.totalDivider}>
              <View style={styles.totalRow}>
                <Text>Subtotal</Text>
                <Text>{fmt(totals.subtotal)}</Text>
              </View>
              {totals.phaseDiscountTotal > 0 ? (
                <View style={styles.totalRow}>
                  <Text>Phase discounts</Text>
                  <Text>- {fmt(totals.phaseDiscountTotal)}</Text>
                </View>
              ) : null}
              {totals.globalDiscountAmount > 0 ? (
                <View style={styles.totalRow}>
                  <Text>
                    {discountSummaryLine(
                      discount,
                      totals.globalDiscountAmount
                    )}
                  </Text>
                  <Text>- {fmt(totals.globalDiscountAmount)}</Text>
                </View>
              ) : null}
              {showGst ? (
                <View style={styles.totalRow}>
                  <Text>GST ({gstRate}%)</Text>
                  <Text>{fmt(totals.gstAmount)}</Text>
                </View>
              ) : null}
              <View style={[styles.totalRow, { marginTop: 6 }]}>
                <Text style={styles.grandTotal}>{labels.totalLabel}</Text>
                <Text style={styles.grandTotal}>{fmt(totals.total)}</Text>
              </View>
            </View>
          </View>
        )}

        {showBank ? (
          <BankDetailsBlock branding={branding} styles={styles} />
        ) : null}

        {paymentTerms && documentType !== "cost_sheet" ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Payment terms</Text>
            <Text style={styles.bodyText}>{paymentTerms}</Text>
          </View>
        ) : null}

        {proposal.complimentary_services && documentType === "proposal" ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Complimentary services</Text>
            <Text style={styles.bodyText}>{proposal.complimentary_services}</Text>
          </View>
        ) : null}

        {timelineText && documentType === "proposal" ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Timeline</Text>
            <Text style={styles.bodyText}>{timelineText}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {branding.footerText}
          {documentType === "cost_sheet" ? " · Internal use only" : ""} · Generated{" "}
          {generatedAt}
        </Text>
      </Page>
    </Document>
  );
}
