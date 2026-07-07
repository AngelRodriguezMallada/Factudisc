import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@facturadiscord/db";
import { documentSchema } from "@/lib/validation";
import { computeTotals } from "@/lib/money";
import { requireAccount } from "@/lib/auth";
import { buildPaymentOptionCreates } from "@/lib/paymentOptions";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { accountId } = await requireAccount();

  const id = Number(params.id);
  const existing = await prisma.document.findFirst({ where: { id, accountId } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos no válidos" }, { status: 400 });
  }
  const data = parsed.data;

  const client = await prisma.client.findFirst({ where: { id: data.clientId, accountId } });
  if (!client) {
    return NextResponse.json({ error: "Cliente no válido" }, { status: 400 });
  }

  const totals = computeTotals(data.lines);
  const paymentOptions = await buildPaymentOptionCreates(accountId, data.paymentMethodIds);

  await prisma.$transaction([
    prisma.documentLine.deleteMany({ where: { documentId: id } }),
    prisma.documentPaymentOption.deleteMany({ where: { documentId: id } }),
    prisma.document.update({
      where: { id },
      data: {
        clientId: data.clientId,
        status: data.status,
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
    }),
  ]);

  return NextResponse.json({ id, number: existing.number });
}
