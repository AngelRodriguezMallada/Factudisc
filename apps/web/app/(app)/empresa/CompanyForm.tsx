"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateCompanyAction } from "./actions";

interface CompanyDefaults {
  name?: string;
  taxId?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  iban?: string | null;
  logoUrl?: string | null;
  defaultTaxRate?: number;
  notes?: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export function CompanyForm({ defaults }: { defaults: CompanyDefaults }) {
  const [state, formAction] = useFormState(updateCompanyAction, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <div>
        <label className="label" htmlFor="name">Nombre de la empresa</label>
        <input className="input" id="name" name="name" defaultValue={defaults.name} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="taxId">NIF / CIF</label>
          <input className="input" id="taxId" name="taxId" defaultValue={defaults.taxId ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="defaultTaxRate">IVA por defecto (%)</label>
          <input className="input" id="defaultTaxRate" name="defaultTaxRate" type="number" step="0.01" defaultValue={defaults.defaultTaxRate ?? 21} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="address">Dirección</label>
        <input className="input" id="address" name="address" defaultValue={defaults.address ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" defaultValue={defaults.email ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Teléfono</label>
          <input className="input" id="phone" name="phone" defaultValue={defaults.phone ?? ""} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="iban">IBAN</label>
        <input className="input" id="iban" name="iban" defaultValue={defaults.iban ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="logoUrl">URL del logo</label>
        <input className="input" id="logoUrl" name="logoUrl" placeholder="https://..." defaultValue={defaults.logoUrl ?? ""} />
        <p className="text-xs text-slate-500 mt-1">Se usará en la cabecera de las facturas y presupuestos en PDF.</p>
      </div>
      <div>
        <label className="label" htmlFor="notes">Notas / condiciones por defecto</label>
        <textarea className="input" id="notes" name="notes" rows={3} defaultValue={defaults.notes ?? ""} />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-600">Guardado correctamente.</p> : null}
      <SubmitButton />
    </form>
  );
}
