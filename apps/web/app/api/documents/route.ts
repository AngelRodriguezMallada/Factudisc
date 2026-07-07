import { NextRequest, NextResponse } from "next/server";
import { prisma, generateNextDocumentNumber } from "@facturadiscord/db";
import { documentSchema } from "@/lib/validation";
import { computeTotals } from "@/lib/money";
import { requireAccount } from "@/lib/auth";
import { buildPaymentOptionCreates } from "@/lib/paymentOptions";

export async function POST(req: NextRequest) {
  const { accountId } = await requireAccount();

  const body = await req.json();
  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos no válidos" }, { status: 400 });
  }
  const data = parsed.data;

  // El cliente debe pertenecer a la cuenta.
  const client = await prisma.client.findFirst({ where: { id: data.clientId, accountId } });
  if (!client) {
    return NextResponse.json({ error: "Cliente no válido" }, { status: 400 });
  }

  const totals = computeTotals(data.lines);
  const number = await generateNextDocumentNumber(accountId, data.type);
  const paymentOptions = await buildPaymentOptionCreates(accountId, data.paymentMethodIds);

  const document = await prisma.document.create({
    data: {
      accountId,
      type: data.type,
      number,
      status: data.status,
      clientId: data.clientId,
      issueDate: new Date(data.issueDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      lines: {
        create: totals.lines.map((l, idx) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
          position: idx,
        })),
      },
      paymentOptions: { create: paymentOptions },
    },
  });

  return NextResponse.json({ id: document.id, number: document.number });
}
