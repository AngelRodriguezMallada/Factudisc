"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createAccountAction, grantAccessAction, setCredentialsAction } from "./actions";

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
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
      <div>
        <label className="label" htmlFor="acc-name">Nombre de la cuenta</label>
        <input id="acc-name" name="name" className="input" placeholder="Empresa de Ana" required />
      </div>
      <div>
        <label className="label" htmlFor="acc-owner">Discord ID del owner</label>
        <input id="acc-owner" name="ownerDiscordId" className="input" placeholder="123456789012345678" required />
      </div>
      <div>
        <label className="label" htmlFor="acc-user">Usuario web (opcional)</label>
        <input id="acc-user" name="username" className="input" placeholder="ana" autoComplete="off" />
      </div>
      <div>
        <label className="label" htmlFor="acc-pass">Contraseña (opcional)</label>
        <input id="acc-pass" name="password" type="password" className="input" autoComplete="new-password" />
      </div>
      <div className="md:col-span-2">
        <SubmitButton label="Crear cuenta" />
      </div>
      {state?.error ? <p className="text-sm text-red-600 md:col-span-2">{state.error}</p> : null}
    </form>
  );
}

export function SetCredentialsForm({ userId, hasCredentials }: { userId: number; hasCredentials: boolean }) {
  const [state, formAction] = useFormState(setCredentialsAction, undefined);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div>
        <label className="label" htmlFor={`cred-user-${userId}`}>
          {hasCredentials ? "Cambiar usuario" : "Usuario web"}
        </label>
        <input id={`cred-user-${userId}`} name="username" className="input" placeholder="usuario" autoComplete="off" required />
      </div>
      <div>
        <label className="label" htmlFor={`cred-pass-${userId}`}>Contraseña</label>
        <input id={`cred-pass-${userId}`} name="password" type="password" className="input" autoComplete="new-password" required />
      </div>
      <SubmitButton label="Guardar credenciales" />
      {state?.error ? <p className="text-sm text-red-600 w-full">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-600 w-full">Credenciales guardadas.</p> : null}
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
