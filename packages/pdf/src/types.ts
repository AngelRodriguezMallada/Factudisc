export type DocumentKind = "INVOICE" | "QUOTE";

export interface PdfPartyInfo {
  name: string;
  taxId?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface PdfCompanyInfo extends PdfPartyInfo {
  iban?: string | null;
  logoUrl?: string | null;
}

export interface PdfLine {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface DocumentPdfData {
  type: DocumentKind;
  number: string;
  status: string;
  issueDate: Date;
  dueDate?: Date | null;
  notes?: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  client: PdfPartyInfo;
  company: PdfCompanyInfo;
  lines: PdfLine[];
}
