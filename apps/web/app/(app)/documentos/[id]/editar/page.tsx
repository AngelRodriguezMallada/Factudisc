import { notFound } from "next/navigation";
import { prisma } from "@facturadiscord/db";
import { DocumentForm } from "@/components/DocumentForm";

export default async function EditDocumentPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [document, clients, company] = await Promise.all([
    prisma.document.findUnique({
      where: { id },
      include: { lines: { orderBy: { position: "asc" } } },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.companyProfile.findFirst(),
  ]);

  if (!document) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Editar {document.number}</h1>
      <DocumentForm
        documentType={document.type}
        clients={clients}
        defaultTaxRate={company ? Number(company.defaultTaxRate) : 21}
        initialValues={{
          id: document.id,
          clientId: document.clientId,
          status: document.status,
          issueDate: document.issueDate.toISOString().slice(0, 10),
          dueDate: document.dueDate ? document.dueDate.toISOString().slice(0, 10) : "",
          notes: document.notes ?? "",
          lines: document.lines.map((l) => ({
            description: l.description,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
            taxRate: Number(l.taxRate),
          })),
        }}
      />
    </div>
  );
}
