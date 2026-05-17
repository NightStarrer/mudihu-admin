import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchProposalWithRelations } from "@/lib/proposals/fetch-proposal";
import { toBrandingTokens } from "@/lib/branding/tokens";
import { renderProposalPdf } from "@/lib/pdf/render";
import type { Agency, BrandingSettings } from "@/types/database";

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

    const { proposalId } = await request.json();
    if (!proposalId) {
      return NextResponse.json({ error: "proposalId required" }, { status: 400 });
    }

    const proposal = await fetchProposalWithRelations(proposalId);
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

    const pdfBuffer = await renderProposalPdf(proposal, tokens);
    const fileName = `proposals/${proposalId}/${Date.now()}.pdf`;

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
          document_type: "proposal",
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
