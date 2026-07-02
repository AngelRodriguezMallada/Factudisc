import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@facturadiscord/db";
import { documentSchema } from "@/lib/validation";
import { computeTotals } from "@/lib/money";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos no válidos" }, { status: 400 });
  }
  const data = parsed.data;
  const totals = computeTotals(data.lines);

  await prisma.documentLine.deleteMany({ where: { documentId: id } });
  await prisma.document.update({
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
    },
  });

  return NextResponse.json({ id, number: existing.number });
}
