import Link from "next/link";
import { prisma } from "@facturadiscord/db";
import { formatCurrency } from "@/lib/money";
import { requireAccount } from "@/lib/auth";

export default async function DashboardPage() {
  const { accountId } = await requireAccount();

  const [invoiceCount, quoteCount, clientCount, unpaidInvoices, recentDocuments] = await Promise.all([
    prisma.document.count({ where: { accountId, type: "INVOICE" } }),
    prisma.document.count({ where: { accountId, type: "QUOTE" } }),
    prisma.client.count({ where: { accountId } }),
    prisma.document.findMany({
      where: { accountId, type: "INVOICE", status: { in: ["SENT", "DRAFT"] } },
      select: { total: true },
    }),
    prisma.document.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { client: true },
    }),
  ]);

  const pendingTotal = unpaidInvoices.reduce((sum, d) => sum + Number(d.total), 0);

  const cards = [
    { label: "Facturas", value: invoiceCount, href: "/documentos?type=INVOICE" },
    { label: "Presupuestos", value: quoteCount, href: "/documentos?type=QUOTE" },
    { label: "Clientes", value: clientCount, href: "/clientes" },
    { label: "Pendiente de cobro", value: formatCurrency(pendingTotal), href: "/documentos?type=INVOICE" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Panel</h1>
        <div className="flex gap-3">
          <Link href="/documentos/nuevo?type=QUOTE" className="btn-secondary">
            Nuevo presupuesto
          </Link>
          <Link href="/documentos/nuevo?type=INVOICE" className="btn-primary">
            Nueva factura
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-5 hover:border-accent transition-colors">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-2xl font-semibold text-ink mt-1">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-medium text-ink">Actividad reciente</h2>
        </div>
        {recentDocuments.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Todavía no has creado ninguna factura o presupuesto.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentDocuments.map((doc) => (
              <li key={doc.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <Link href={`/documentos/${doc.id}`} className="hover:text-accent">
                  <span className="font-medium">{doc.number}</span>
                  <span className="text-slate-500"> · {doc.client.name}</span>
                </Link>
                <span className="text-slate-500">{formatCurrency(Number(doc.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
