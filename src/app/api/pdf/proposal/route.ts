import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchProposalWithRelations } from "@/lib/proposals/fetch-proposal";
import { toBrandingTokens } from "@/lib/branding/tokens";
import { renderProposalPdf } from "@/lib/pdf/render";
import type { Agency, BrandingSettings } from "@/types/database";
import {
  filterPhasesForDocument,
  type PdfDocumentType,
} from "@/lib/proposals/document-types";

const VALID_TYPES: PdfDocumentType[] = ["proposal", "invoice", "cost_sheet"];

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const proposalId = body.proposalId as string | undefined;
    const documentType = (body.documentType ?? "proposal") as PdfDocumentType;

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId required" }, { status: 400 });
    }

    if (!VALID_TYPES.includes(documentType)) {
      return NextResponse.json({ error: "Invalid documentType" }, { status: 400 });
    }

    let proposal = await fetchProposalWithRelations(proposalId);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.agency_id !== proposal.agency_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [{ data: branding }, { data: agency }] = await Promise.all([
      supabase
        .from("branding_settings")
        .select("*")
        .eq("agency_id", profile.agency_id)
        .single(),
      supabase
        .from("agencies")
        .select("*")
        .eq("id", profile.agency_id)
        .single(),
    ]);

    const tokens = toBrandingTokens(
      branding as BrandingSettings | null,
      agency as Agency | null
    );

    if (documentType === "invoice") {
      const now = new Date().toISOString();
      const stamp: Record<string, unknown> = {
        last_invoice_exported_at: now,
      };
      if (!proposal.invoice_date) {
        stamp.invoice_date = now.slice(0, 10);
      }
      if (!proposal.invoice_number) {
        const y = new Date().getFullYear();
        const m = String(new Date().getMonth() + 1).padStart(2, "0");
        stamp.invoice_number = `INV-${y}${m}-${proposalId.slice(0, 6).toUpperCase()}`;
      }
      await supabase.from("proposals").update(stamp).eq("id", proposalId);
      proposal = (await fetchProposalWithRelations(proposalId)) ?? proposal;
    }

    const included = filterPhasesForDocument(proposal.phases, documentType);
    if (!included.length) {
      return NextResponse.json(
        {
          error:
            "No phases or line items are included for this document type. Check inclusion toggles on the proposal.",
        },
        { status: 400 }
      );
    }

    const pdfBuffer = await renderProposalPdf(proposal, tokens, documentType);
    const fileName = `proposals/${proposalId}/${documentType}-${Date.now()}.pdf`;

    let downloadUrl: string;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      const { error: uploadError } = await admin.storage
        .from("pdf-exports")
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!uploadError) {
        const { data: signed } = await admin.storage
          .from("pdf-exports")
          .createSignedUrl(fileName, 3600);

        downloadUrl = signed?.signedUrl ?? "";

        await admin.from("pdf_documents").insert({
          agency_id: profile.agency_id,
          proposal_id: proposalId,
          document_type: documentType,
          storage_path: fileName,
        });
      } else {
        downloadUrl = bufferToDataUrl(pdfBuffer);
      }
    } else {
      downloadUrl = bufferToDataUrl(pdfBuffer);
    }

    return NextResponse.json({ url: downloadUrl });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF generation failed" },
      { status: 500 }
    );
  }
}

function bufferToDataUrl(buffer: Buffer) {
  return `data:application/pdf;base64,${buffer.toString("base64")}`;
}
