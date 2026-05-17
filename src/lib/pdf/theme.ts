import { StyleSheet } from "@react-pdf/renderer";
import type { BrandingTokens } from "@/types/database";

export function createPdfStyles(branding: BrandingTokens) {
  return StyleSheet.create({
    page: {
      paddingTop: 52,
      paddingBottom: 60,
      paddingHorizontal: 44,
      fontFamily: branding.fontFamily,
      fontSize: 10,
      color: branding.secondaryColor,
      backgroundColor: branding.backgroundColor,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
      paddingBottom: 14,
      borderBottomWidth: 2,
      borderBottomColor: branding.primaryColor,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    headerRight: {
      alignItems: "flex-end",
      minWidth: 140,
    },
    logoBox: {
      width: 44,
      height: 44,
      backgroundColor: branding.primaryColor,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "bold",
    },
    agencyName: {
      fontSize: 15,
      fontWeight: "bold",
      color: branding.primaryColor,
    },
    docType: {
      fontSize: 10,
      color: "#555",
      marginTop: 3,
      letterSpacing: 0.3,
    },
    metaLabel: {
      fontSize: 7,
      color: "#888",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    metaValue: {
      fontSize: 9,
      color: branding.secondaryColor,
      marginBottom: 6,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: branding.secondaryColor,
      marginBottom: 6,
      lineHeight: 1.25,
    },
    subtitle: {
      fontSize: 10,
      color: "#555",
      marginBottom: 18,
      lineHeight: 1.45,
    },
    clientBlock: {
      marginBottom: 22,
      padding: 14,
      backgroundColor: "#ffffff",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#e8e4df",
    },
    clientLabel: {
      fontSize: 8,
      fontWeight: "bold",
      color: "#888",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 6,
    },
    clientName: {
      fontSize: 12,
      fontWeight: "bold",
      color: branding.secondaryColor,
      marginBottom: 3,
    },
    phaseTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginTop: 18,
      marginBottom: 10,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: branding.primaryColor,
    },
    groupRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ebe7e2",
    },
    groupTitle: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 3,
      color: branding.secondaryColor,
    },
    groupDesc: {
      fontSize: 8,
      color: "#666",
      lineHeight: 1.4,
    },
    amount: {
      fontSize: 10,
      fontWeight: "bold",
      color: branding.primaryColor,
      minWidth: 72,
      textAlign: "right",
    },
    totalsBox: {
      marginTop: 22,
      padding: 16,
      backgroundColor: "#ffffff",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#e8e4df",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
      fontSize: 9,
    },
    grandTotal: {
      fontSize: 13,
      fontWeight: "bold",
      color: branding.primaryColor,
    },
    footer: {
      position: "absolute",
      bottom: 28,
      left: 44,
      right: 44,
      fontSize: 7,
      color: "#888",
      textAlign: "center",
      borderTopWidth: 1,
      borderTopColor: "#ddd",
      paddingTop: 8,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginTop: 14,
      marginBottom: 6,
    },
    bodyText: {
      fontSize: 9,
      lineHeight: 1.5,
      color: "#444",
    },
    datesRow: {
      flexDirection: "row",
      gap: 24,
      marginBottom: 16,
      padding: 10,
      backgroundColor: "#ffffff",
      borderRadius: 6,
    },
    dateCell: {
      flex: 1,
    },
  });
}

/** @deprecated Use formatPdfMoney from @/lib/money/currency */
export function formatPdfINR(amount: number) {
  const n = amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return `Rs. ${n}`;
}
