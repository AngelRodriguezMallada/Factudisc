"use client";

import { useFormState, useFormStatus } from "react-dom";

type ClientFormAction = (
  prevState: { error?: string } | undefined,
  formData: FormData
) => Promise<{ error?: string } | undefined>;

interface ClientFormProps {
  action: ClientFormAction;
  defaultValues?: {
    name?: string;
    taxId?: string | null;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  submitLabel?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Guardando..." : label}
    </button>
  );
}

export function ClientForm({ action, defaultValues, submitLabel = "Guardar" }: ClientFormProps) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div>
        <label className="label" htmlFor="name">Nombre / Razón social</label>
        <input className="input" id="name" name="name" defaultValue={defaultValues?.name} required />
      </div>
      <div>
        <label className="label" htmlFor="taxId">NIF / CIF</label>
        <input className="input" id="taxId" name="taxId" defaultValue={defaultValues?.taxId ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="address">Dirección</label>
        <input className="input" id="address" name="address" defaultValue={defaultValues?.address ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Teléfono</label>
          <input className="input" id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </div>
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
