import { ClientForm } from "@/components/ClientForm";
import { createClientAction } from "../actions";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Nuevo cliente</h1>
      <div className="card p-6">
        <ClientForm action={createClientAction} submitLabel="Crear cliente" />
      </div>
    </div>
  );
}
