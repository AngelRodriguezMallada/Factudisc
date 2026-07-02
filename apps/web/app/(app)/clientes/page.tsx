import Link from "next/link";
import { prisma } from "@facturadiscord/db";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Clientes</h1>
        <Link href="/clientes/nuevo" className="btn-primary">Nuevo cliente</Link>
      </div>

      <div className="card overflow-hidden">
        {clients.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Todavía no has añadido ningún cliente.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">NIF/CIF</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Teléfono</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-5 py-3 font-medium text-ink">{client.name}</td>
                  <td className="px-5 py-3 text-slate-600">{client.taxId || "-"}</td>
                  <td className="px-5 py-3 text-slate-600">{client.email || "-"}</td>
                  <td className="px-5 py-3 text-slate-600">{client.phone || "-"}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/clientes/${client.id}`} className="text-accent hover:underline">
                      Editar
                    </Link>
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
