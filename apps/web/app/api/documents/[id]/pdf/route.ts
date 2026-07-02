import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@facturadiscord/db";
import { renderDocumentPdf, buildPdfData } from "@facturadiscord/pdf";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  const [document, company] = await Promise.all([
    prisma.document.findUnique({
      where: { id },
      include: { client: true, lines: { orderBy: { position: "asc" } } },
    }),
    prisma.companyProfile.findFirst(),
  ]);

  if (!document || !company) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const pdfData = buildPdfData(document, document.client, company);
  const buffer = await renderDocumentPdf(pdfData);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${document.number}.pdf"`,
    },
  });
}
