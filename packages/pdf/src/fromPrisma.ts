import type { DocumentPdfData } from "./types";

type Numeric = number | string | { toString(): string };

function num(v: Numeric | null | undefined): number {
  return v === null || v === undefined ? 0 : Number(v);
}

interface PrismaLineLike {
  description: string;
  quantity: Numeric;
  unitPrice: Numeric;
  taxRate: Numeric;
  lineTotal: Numeric;
}

interface PrismaPartyLike {
  name: string;
  taxId?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface PrismaCompanyLike extends PrismaPartyLike {
  iban?: string | null;
  logoUrl?: string | null;
}

interface PrismaDocumentLike {
  type: "INVOICE" | "QUOTE";
  number: string;
  status: string;
  issueDate: Date;
  dueDate?: Date | null;
  notes?: string | null;
  subtotal: Numeric;
  taxAmount: Numeric;
  total: Numeric;
  lines: PrismaLineLike[];
}

export function buildPdfData(
  document: PrismaDocumentLike,
  client: PrismaPartyLike,
  company: PrismaCompanyLike
): DocumentPdfData {
  return {
    type: document.type,
    number: document.number,
    status: document.status,
    issueDate: document.issueDate,
    dueDate: document.dueDate ?? null,
    notes: document.notes ?? null,
    subtotal: num(document.subtotal),
    taxAmount: num(document.taxAmount),
    total: num(document.total),
    client: {
      name: client.name,
      taxId: client.taxId,
      address: client.address,
      email: client.email,
      phone: client.phone,
    },
    company: {
      name: company.name,
      taxId: company.taxId,
      address: company.address,
      email: company.email,
      phone: company.phone,
      iban: company.iban,
      logoUrl: company.logoUrl,
    },
    lines: document.lines.map((l) => ({
      description: l.description,
      quantity: num(l.quantity),
      unitPrice: num(l.unitPrice),
      taxRate: num(l.taxRate),
      lineTotal: num(l.lineTotal),
    })),
  };
}
