import { prisma } from "@facturadiscord/db";
import { DocumentForm } from "@/components/DocumentForm";

interface PageProps {
  searchParams: { type?: string };
}

export default async function NewDocumentPage({ searchParams }: PageProps) {
  const type = searchParams.type === "QUOTE" ? "QUOTE" : "INVOICE";

  const [clients, company] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.companyProfile.findFirst(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">
        Nuevo {type === "INVOICE" ? "factura" : "presupuesto"}
      </h1>
      {clients.length === 0 ? (
        <p className="text-sm text-slate-500">
          Necesitas crear al menos un cliente antes de emitir un documento.{" "}
          <a href="/clientes/nuevo" className="text-accent hover:underline">Crear cliente</a>
        </p>
      ) : (
        <DocumentForm
          documentType={type}
          clients={clients}
          defaultTaxRate={company ? Number(company.defaultTaxRate) : 21}
        />
      )}
    </div>
  );
}
