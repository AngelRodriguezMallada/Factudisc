import Link from "next/link";
import { prisma } from "@facturadiscord/db";
import { StatusBadge, DOCUMENT_STATUSES } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/money";

interface PageProps {
  searchParams: { type?: string; status?: string };
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const type = searchParams.type === "QUOTE" ? "QUOTE" : "INVOICE";
  const statusFilter = searchParams.status;

  const documents = await prisma.document.findMany({
    where: {
      type,
      ...(statusFilter ? { status: statusFilter as any } : {}),
    },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  const label = type === "INVOICE" ? "Facturas" : "Presupuestos";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{label}</h1>
        <Link href={`/documentos/nuevo?type=${type}`} className="btn-primary">
          Nuevo {type === "INVOICE" ? "factura" : "presupuesto"}
        </Link>
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href={`/documentos?type=${type}`}
          className={`btn-secondary ${!statusFilter ? "border-accent text-accent" : ""}`}
        >
          Todos
        </Link>
        {DOCUMENT_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/documentos?type=${type}&status=${s}`}
            className={`btn-secondary ${statusFilter === s ? "border-accent text-accent" : ""}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        {documents.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No hay {label.toLowerCase()} todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Número</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/documentos/${doc.id}`} className="font-medium text-ink hover:text-accent">
                      {doc.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{doc.client.name}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {new Date(doc.issueDate).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatCurrency(Number(doc.total))}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={doc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
