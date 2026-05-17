import {
  Document,
  Page,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import { createPdfStyles, formatPdfINR } from "@/lib/pdf/theme";
import type { BrandingTokens, ProposalWithRelations } from "@/types/database";
import {
  calculateProposalTotals,
} from "@/lib/proposals/calculate-totals";

export function ProposalDocument({
  proposal,
  branding,
}: {
  proposal: ProposalWithRelations;
  branding: BrandingTokens;
}) {
  const styles = createPdfStyles(branding);
  const totals = calculateProposalTotals(
    proposal.phases,
    Number(proposal.gst_rate)
  );
  const paymentTerms =
    (proposal.payment_terms as { text?: string })?.text ?? "";

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
              <Text style={styles.docType}>Project Proposal</Text>
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
        </View>

        {proposal.phases.map((phase) => (
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
        ))}

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
            <Text style={styles.grandTotal}>Total investment</Text>
            <Text style={styles.grandTotal}>{formatPdfINR(totals.total)}</Text>
          </View>
        </View>

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
