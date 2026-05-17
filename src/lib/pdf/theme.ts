import { StyleSheet } from "@react-pdf/renderer";
import type { BrandingTokens } from "@/types/database";

export function createPdfStyles(branding: BrandingTokens) {
  return StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 56,
      paddingHorizontal: 40,
      fontFamily: branding.fontFamily,
      fontSize: 10,
      color: branding.secondaryColor,
      backgroundColor: branding.backgroundColor,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: branding.primaryColor,
    },
    logoBox: {
      width: 40,
      height: 40,
      backgroundColor: branding.primaryColor,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "bold",
    },
    agencyName: {
      fontSize: 16,
      fontWeight: "bold",
      color: branding.primaryColor,
    },
    docType: {
      fontSize: 9,
      color: "#666",
      marginTop: 2,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: branding.secondaryColor,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 11,
      color: "#555",
      marginBottom: 20,
      lineHeight: 1.5,
    },
    clientBlock: {
      marginBottom: 20,
      padding: 12,
      backgroundColor: "#ffffff",
      borderRadius: 4,
    },
    phaseTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginTop: 16,
      marginBottom: 8,
    },
    groupRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#e8e4df",
    },
    groupTitle: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 2,
    },
    groupDesc: {
      fontSize: 8,
      color: "#666",
      maxWidth: "70%",
      lineHeight: 1.4,
    },
    amount: {
      fontSize: 10,
      fontWeight: "bold",
      color: branding.primaryColor,
    },
    totalsBox: {
      marginTop: 20,
      padding: 14,
      backgroundColor: "#ffffff",
      borderRadius: 4,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    grandTotal: {
      fontSize: 14,
      fontWeight: "bold",
      color: branding.primaryColor,
    },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 40,
      right: 40,
      fontSize: 7,
      color: "#888",
      textAlign: "center",
      borderTopWidth: 1,
      borderTopColor: "#ddd",
      paddingTop: 8,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "bold",
      marginTop: 12,
      marginBottom: 4,
    },
    bodyText: {
      fontSize: 9,
      lineHeight: 1.5,
      color: "#444",
    },
  });
}

export function formatPdfINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
