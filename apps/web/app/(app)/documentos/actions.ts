"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, generateNextDocumentNumber } from "@facturadiscord/db";
import { requireSession } from "@/lib/auth";

export async function convertToInvoiceAction(quoteId: number) {
  await requireSession();
  const quote = await prisma.document.findUnique({ where: { id: quoteId }, include: { lines: true } });
  if (!quote || quote.type !== "QUOTE") {
    throw new Error("Presupuesto no encontrado");
  }

  const number = await generateNextDocumentNumber("INVOICE");
  const invoice = await prisma.document.create({
    data: {
      type: "INVOICE",
      number,
      status: "DRAFT",
      clientId: quote.clientId,
      issueDate: new Date(),
      notes: quote.notes,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      convertedFromId: quote.id,
      lines: {
        create: quote.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
          position: l.position,
        })),
      },
    },
  });

  revalidatePath("/documentos");
  redirect(`/documentos/${invoice.id}`);
}

const VALID_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "PAID", "EXPIRED"] as const;
type DocumentStatus = (typeof VALID_STATUSES)[number];

export async function updateStatusAction(formData: FormData) {
  await requireSession();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !VALID_STATUSES.includes(status as DocumentStatus)) {
    throw new Error("Datos no válidos");
  }
  await prisma.document.update({ where: { id }, data: { status: status as DocumentStatus } });
  revalidatePath(`/documentos/${id}`);
  revalidatePath("/documentos");
}

export async function deleteDocumentAction(id: number) {
  await requireSession();
  await prisma.document.delete({ where: { id } });
  revalidatePath("/documentos");
  redirect("/documentos");
}
