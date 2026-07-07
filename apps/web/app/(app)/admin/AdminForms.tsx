"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createAccountAction, grantAccessAction } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Guardando..." : label}
    </button>
  );
}

export function CreateAccountForm() {
  const [state, formAction] = useFormState(createAccountAction, undefined);
  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
      <div>
        <label className="label" htmlFor="acc-name">Nombre de la cuenta</label>
        <input id="acc-name" name="name" className="input" placeholder="Empresa de Ana" required />
      </div>
      <div>
        <label className="label" htmlFor="acc-owner">Discord ID del owner</label>
        <input id="acc-owner" name="ownerDiscordId" className="input" placeholder="123456789012345678" required />
      </div>
      <SubmitButton label="Crear cuenta" />
      {state?.error ? <p className="text-sm text-red-600 md:col-span-3">{state.error}</p> : null}
    </form>
  );
}

export function GrantAccessForm({ accountId }: { accountId: number }) {
  const [state, formAction] = useFormState(grantAccessAction, undefined);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="accountId" value={accountId} />
      <div>
        <label className="label" htmlFor={`grant-${accountId}`}>Dar acceso (Discord ID)</label>
        <input id={`grant-${accountId}`} name="discordId" className="input" placeholder="123456789012345678" required />
      </div>
      <select name="role" className="input" defaultValue="MEMBER">
        <option value="MEMBER">Miembro</option>
        <option value="OWNER">Owner</option>
      </select>
      <SubmitButton label="Dar acceso" />
      {state?.error ? <p className="text-sm text-red-600 w-full">{state.error}</p> : null}
    </form>
  );
}
