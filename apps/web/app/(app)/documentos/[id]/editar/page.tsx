import { notFound } from "next/navigation";
import { prisma } from "@facturadiscord/db";
import { DocumentForm } from "@/components/DocumentForm";
import { requireAccount } from "@/lib/auth";

export default async function EditDocumentPage({ params }: { params: { id: string } }) {
  const { accountId } = await requireAccount();
  const id = Number(params.id);
  const [document, clients, company, paymentMethods] = await Promise.all([
    prisma.document.findFirst({
      where: { id, accountId },
      include: {
        lines: { orderBy: { position: "asc" } },
        paymentOptions: { orderBy: { position: "asc" } },
      },
    }),
    prisma.client.findMany({ where: { accountId }, orderBy: { name: "asc" } }),
    prisma.companyProfile.findUnique({ where: { accountId } }),
    prisma.paymentMethod.findMany({ where: { accountId }, orderBy: { position: "asc" } }),
  ]);

  if (!document) notFound();

  // Reconstruye qué métodos actuales coinciden con los guardados (por tipo+detalle).
  const selectedKeys = new Set(document.paymentOptions.map((p) => `${p.type}|${p.details}`));
  const selectedMethodIds = paymentMethods
    .filter((m) => selectedKeys.has(`${m.type}|${m.details}`))
    .map((m) => m.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Editar {document.number}</h1>
      <DocumentForm
        documentType={document.type}
        clients={clients}
        defaultTaxRate={company ? Number(company.defaultTaxRate) : 21}
        paymentMethods={paymentMethods.map((p) => ({
          id: p.id,
          type: p.type,
          label: p.label,
          details: p.details,
        }))}
        initialValues={{
          id: document.id,
          clientId: document.clientId,
          status: document.status,
          issueDate: document.issueDate.toISOString().slice(0, 10),
          dueDate: document.dueDate ? document.dueDate.toISOString().slice(0, 10) : "",
          notes: document.notes ?? "",
          paymentMethodIds: selectedMethodIds,
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
