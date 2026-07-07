"use client";

import { useFormState, useFormStatus } from "react-dom";
import { passwordLoginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export function PasswordLoginForm() {
  const [state, formAction] = useFormState(passwordLoginAction, undefined);

  return (
    <form action={formAction} className="space-y-3 text-left">
      <div>
        <label className="label" htmlFor="username">Usuario</label>
        <input className="input" id="username" name="username" type="text" autoComplete="username" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Contraseña</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
