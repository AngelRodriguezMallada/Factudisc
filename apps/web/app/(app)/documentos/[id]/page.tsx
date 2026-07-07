import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@facturadiscord/db";
import { StatusBadge, DOCUMENT_STATUSES } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/money";
import { requireAccount } from "@/lib/auth";
import { convertToInvoiceAction, updateStatusAction, deleteDocumentAction } from "../actions";

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const { accountId } = await requireAccount();
  const id = Number(params.id);
  const document = await prisma.document.findFirst({
    where: { id, accountId },
    include: { client: true, lines: { orderBy: { position: "asc" } }, convertedTo: true },
  });

  if (!document) notFound();

  const boundConvert = convertToInvoiceAction.bind(null, document.id);
  const boundDelete = deleteDocumentAction.bind(null, document.id);
  const commandName = document.type === "INVOICE" ? "factura" : "presupuesto";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">{document.number}</h1>
            <StatusBadge status={document.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">{document.client.name}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/documentos/${document.id}/editar`} className="btn-secondary">Editar</Link>
          <a href={`/api/documents/${document.id}/pdf`} target="_blank" rel="noreferrer" className="btn-primary">
            Ver / Descargar PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card overflow-hidden" style={{ height: 600 }}>
            <iframe src={`/api/documents/${document.id}/pdf`} className="w-full h-full" title="Vista previa PDF" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5 space-y-3">
            <h2 className="font-medium text-ink">Resumen</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(document.subtotal))}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA</span>
                <span>{formatCurrency(Number(document.taxAmount))}</span>
              </div>
              <div className="flex justify-between font-semibold text-ink pt-1 border-t border-slate-200">
                <span>Total</span>
                <span>{formatCurrency(Number(document.total))}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-medium text-ink">Estado</h2>
            <form action={updateStatusAction} className="flex gap-2">
              <input type="hidden" name="id" value={document.id} />
              <select name="status" defaultValue={document.status} className="input">
                {DOCUMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" className="btn-secondary shrink-0">Actualizar</button>
            </form>
          </div>

          {document.type === "QUOTE" && !document.convertedTo ? (
            <div className="card p-5 space-y-2">
              <h2 className="font-medium text-ink">Convertir a factura</h2>
              <p className="text-xs text-slate-500">Genera una factura nueva con las mismas líneas.</p>
              <form action={boundConvert}>
                <button type="submit" className="btn-primary w-full">Convertir a factura</button>
              </form>
            </div>
          ) : null}

          {document.convertedTo ? (
            <div className="card p-5 space-y-2">
              <h2 className="font-medium text-ink">Factura generada</h2>
              <Link href={`/documentos/${document.convertedTo.id}`} className="text-accent hover:underline text-sm">
                {document.convertedTo.number}
              </Link>
            </div>
          ) : null}

          <div className="card p-5 space-y-2">
            <h2 className="font-medium text-ink">Enviar por Discord</h2>
            <p className="text-xs text-slate-500">
              Ejecuta este comando en el servidor de Discord donde está el bot para publicar el PDF en el canal:
            </p>
            <code className="block bg-slate-100 rounded px-2 py-1.5 text-xs text-ink">
              /{commandName} numero:{document.number}
            </code>
            <p className="text-xs text-slate-500">Añade la opción <code>usuario</code> para enviarlo por DM.</p>
          </div>

          <div className="card p-5">
            <form action={boundDelete}>
              <button type="submit" className="btn-danger w-full">Eliminar documento</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
