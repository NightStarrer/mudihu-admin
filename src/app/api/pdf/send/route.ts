import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { fetchProposalWithRelations } from "@/lib/proposals/fetch-proposal";
import { toBrandingTokens } from "@/lib/branding/tokens";
import { renderProposalPdf } from "@/lib/pdf/render";
import type { Agency, BrandingSettings, ProposalInvoice } from "@/types/database";
import type { PdfDocumentType } from "@/lib/proposals/document-types";
import type { PdfInvoiceOverride } from "@/lib/pdf/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      return NextResponse.json(
        { error: "Email is not configured (RESEND_API_KEY, RESEND_FROM_EMAIL)" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const proposalId = body.proposalId as string;
    const documentType = (body.documentType ?? "invoice") as PdfDocumentType;
    const invoiceId = body.invoiceId as string | undefined;
    const toEmail = (body.toEmail as string)?.trim();

    if (!proposalId || !toEmail) {
      return NextResponse.json(
        { error: "proposalId and toEmail required" },
        { status: 400 }
      );
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

    let invoiceOverride: PdfInvoiceOverride | undefined;
    let filename = `${documentType}-${proposalId.slice(0, 8)}.pdf`;
    let subject = `${proposal.title} — ${documentType}`;

    if (invoiceId && documentType === "invoice") {
      const { data: invoice, error: invError } = await supabase
        .from("proposal_invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("proposal_id", proposalId)
        .single();

      if (invError || !invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const inv = invoice as ProposalInvoice;
      const phase = proposal.phases.find((p) => p.id === inv.phase_id);
      if (!phase) {
        return NextResponse.json({ error: "Phase not found" }, { status: 404 });
      }

      proposal = {
        ...proposal,
        phases: [{ ...phase, include_in_invoice: true }],
        invoice_number: inv.invoice_number,
        invoice_date: inv.invoice_date,
        due_date: inv.due_date,
      };

      invoiceOverride = {
        invoiceNumber: inv.invoice_number,
        invoiceDate: inv.invoice_date,
        dueDate: inv.due_date,
        amountSubtotal: Number(inv.amount_subtotal),
        amountGst: Number(inv.amount_gst),
        amountTotal: Number(inv.amount_total),
        billingPercent: Number(inv.billing_percent),
        phaseName: phase.name,
      };

      filename = `invoice-${inv.invoice_number}.pdf`;
      subject = `Invoice ${inv.invoice_number} — ${proposal.title}`;
    }

    const pdfBuffer = await renderProposalPdf(
      proposal,
      tokens,
      documentType,
      invoiceOverride
    );

    const resend = new Resend(apiKey);
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      text: `Please find attached the ${documentType.replace("_", " ")} for ${proposal.client.company_name}.`,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    if (invoiceId) {
      await supabase
        .from("proposal_invoices")
        .update({ status: "sent", updated_at: new Date().toISOString() })
        .eq("id", invoiceId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PDF email error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email failed" },
      { status: 500 }
    );
  }
}
