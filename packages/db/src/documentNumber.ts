import { prisma } from "./index";
import { DocumentType } from "../generated/client/index.js";

const PREFIXES: Record<DocumentType, string> = {
  INVOICE: "FAC",
  QUOTE: "PRE",
};

export async function generateNextDocumentNumber(type: DocumentType): Promise<string> {
  const year = new Date().getFullYear();

  const counter = await prisma.$transaction(async (tx) => {
    const existing = await tx.documentCounter.findUnique({
      where: { type_year: { type, year } },
    });

    if (existing) {
      return tx.documentCounter.update({
        where: { id: existing.id },
        data: { lastNumber: { increment: 1 } },
      });
    }

    return tx.documentCounter.create({
      data: { type, year, lastNumber: 1 },
    });
  });

  const padded = String(counter.lastNumber).padStart(4, "0");
  return `${PREFIXES[type]}-${year}-${padded}`;
}
