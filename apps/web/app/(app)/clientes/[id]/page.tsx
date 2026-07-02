import { notFound } from "next/navigation";
import { prisma } from "@facturadiscord/db";
import { ClientForm } from "@/components/ClientForm";
import { updateClientAction, deleteClientAction } from "../actions";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  const boundUpdate = updateClientAction.bind(null, id);
  const boundDelete = deleteClientAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Editar cliente</h1>
        <form action={boundDelete}>
          <button type="submit" className="btn-danger">Eliminar</button>
        </form>
      </div>
      <div className="card p-6">
        <ClientForm action={boundUpdate} defaultValues={client} submitLabel="Guardar cambios" />
      </div>
    </div>
  );
}
