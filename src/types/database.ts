export type UserRole = "admin" | "employee";
export type ProposalStatus = "draft" | "sent" | "accepted" | "archived";

export interface Agency {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  agency_id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
}

export interface BrandingSettings {
  id: string;
  agency_id: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  font_family: string;
  footer_text: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_branch: string | null;
  bank_upi_id: string | null;
  show_bank_on_documents: boolean;
  updated_at: string;
}

export interface Client {
  id: string;
  agency_id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  address: string | null;
  business_category: string | null;
  industry_tags: string[] | null;
  notes: string | null;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  agency_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  agency_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: ProposalStatus;
  gst_rate: number;
  payment_terms: Record<string, unknown> | null;
  timeline: Record<string, unknown> | null;
  complimentary_services: string | null;
  custom_notes: string | null;
  proposal_date: string | null;
  cost_sheet_date: string | null;
  invoice_date: string | null;
  due_date: string | null;
  invoice_number: string | null;
  last_invoice_exported_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentInclusion {
  include_in_proposal: boolean;
  include_in_invoice: boolean;
  include_in_cost_sheet: boolean;
}

export interface ProposalPhase extends DocumentInclusion {
  id: string;
  proposal_id: string;
  name: string;
  sort_order: number;
}

export interface ProposalGroup extends DocumentInclusion {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  amount: number;
  sort_order: number;
}

export interface ProposalSectionLibrary {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  default_amount: number;
  category: string | null;
}

export interface PdfDocument {
  id: string;
  agency_id: string;
  proposal_id: string | null;
  document_type: string;
  storage_path: string;
  generated_at: string;
}

export interface ProposalWithRelations extends Proposal {
  client: Client;
  phases: (ProposalPhase & { groups: ProposalGroup[] })[];
}

export interface BankDetails {
  accountName: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  branch: string | null;
  upiId: string | null;
  showOnDocuments: boolean;
}

export interface BrandingTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  logoUrl: string | null;
  footerText: string;
  agencyName: string;
  bank: BankDetails | null;
}
