"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, convertQuoteToInvoice } from "@facturadiscord/db";
import { requireAccount } from "@/lib/auth";

export async function convertToInvoiceAction(quoteId: number) {
  const { accountId } = await requireAccount();
  const invoice = await convertQuoteToInvoice(accountId, quoteId);

  revalidatePath("/documentos");
  redirect(`/documentos/${invoice.id}`);
}

const VALID_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "PAID", "EXPIRED"] as const;
type DocumentStatus = (typeof VALID_STATUSES)[number];

export async function updateStatusAction(formData: FormData) {
  const { accountId } = await requireAccount();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !VALID_STATUSES.includes(status as DocumentStatus)) {
    throw new Error("Datos no válidos");
  }
  const result = await prisma.document.updateMany({
    where: { id, accountId },
    data: { status: status as DocumentStatus },
  });
  if (result.count === 0) {
    throw new Error("Documento no encontrado.");
  }
  revalidatePath(`/documentos/${id}`);
  revalidatePath("/documentos");
}

export async function deleteDocumentAction(id: number) {
  const { accountId } = await requireAccount();
  const result = await prisma.document.deleteMany({ where: { id, accountId } });
  if (result.count === 0) {
    throw new Error("Documento no encontrado.");
  }
  revalidatePath("/documentos");
  redirect("/documentos");
}
