"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPaymentMethodAction, deletePaymentMethodAction } from "./actions";

interface PaymentMethodItem {
  id: number;
  type: string;
  label?: string | null;
  details: string;
}

const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "Transferencia",
  PAYPAL: "PayPal",
  BIZUM: "Bizum",
  CASH: "Efectivo",
  CARD: "Tarjeta",
  OTHER: "Otro",
};

const DETAILS_PLACEHOLDER: Record<string, string> = {
  TRANSFER: "IBAN ES00 0000 0000 0000 0000 0000",
  PAYPAL: "https://paypal.me/tuusuario",
  BIZUM: "600 000 000",
  CASH: "En mano",
  CARD: "Datáfono / TPV",
  OTHER: "Detalles del método",
};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Añadiendo..." : "Añadir método"}
    </button>
  );
}

export function PaymentMethodsManager({ methods }: { methods: PaymentMethodItem[] }) {
  const [state, formAction] = useFormState(createPaymentMethodAction, undefined);

  return (
    <div className="space-y-4 max-w-xl">
      {methods.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no has añadido ningún método de pago.</p>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
          {methods.map((method) => (
            <li key={method.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                <span className="font-medium text-ink">
                  {method.label || PAYMENT_LABEL[method.type] || method.type}
                </span>
                <span className="block text-slate-500">{method.details}</span>
              </span>
              <form action={deletePaymentMethodAction.bind(null, method.id)}>
                <button type="submit" className="text-red-500 hover:text-red-700 text-sm">
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="label" htmlFor="pm-type">Tipo</label>
          <select id="pm-type" name="type" className="input" defaultValue="TRANSFER">
            {Object.entries(PAYMENT_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pm-label">Etiqueta (opcional)</label>
          <input id="pm-label" name="label" className="input" placeholder="p. ej. Cuenta principal" />
        </div>
        <div>
          <label className="label" htmlFor="pm-details">Datos</label>
          <input id="pm-details" name="details" className="input" placeholder={DETAILS_PLACEHOLDER.TRANSFER} required />
        </div>
        {state?.error ? <p className="text-sm text-red-600 md:col-span-3">{state.error}</p> : null}
        <div className="md:col-span-3">
          <AddButton />
        </div>
      </form>
    </div>
  );
}
