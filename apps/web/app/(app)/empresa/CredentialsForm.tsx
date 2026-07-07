"use client";

import { useFormState, useFormStatus } from "react-dom";
import { setMyCredentialsAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Guardando..." : "Guardar credenciales"}
    </button>
  );
}

export function CredentialsForm({ currentUsername }: { currentUsername: string | null }) {
  const [state, formAction] = useFormState(setMyCredentialsAction, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <p className="text-sm text-slate-500">
        Define un usuario y contraseña para entrar en la web sin Discord.
        {currentUsername ? (
          <> Tu usuario actual es <code>{currentUsername}</code>.</>
        ) : null}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="cred-username">Usuario</label>
          <input
            id="cred-username"
            name="username"
            className="input"
            defaultValue={currentUsername ?? ""}
            autoComplete="off"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="cred-password">Contraseña nueva</label>
          <input
            id="cred-password"
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-600">Credenciales guardadas.</p> : null}
      <SubmitButton />
    </form>
  );
}
