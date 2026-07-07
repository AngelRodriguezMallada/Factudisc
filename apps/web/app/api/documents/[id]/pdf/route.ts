import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@facturadiscord/db";
import { renderDocumentPdf, buildPdfData } from "@facturadiscord/pdf";
import { requireAccount } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { accountId } = await requireAccount();

  const id = Number(params.id);
  const document = await prisma.document.findFirst({
    where: { id, accountId },
    include: {
      client: true,
      lines: { orderBy: { position: "asc" } },
      paymentOptions: { orderBy: { position: "asc" } },
    },
  });
  const company = await prisma.companyProfile.findUnique({ where: { accountId } });

  if (!document || !company) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const pdfData = buildPdfData(document, document.client, company);
  const buffer = await renderDocumentPdf(pdfData);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${document.number}.pdf"`,
    },
  });
}
