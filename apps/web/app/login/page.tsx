"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm card p-8">
        <h1 className="text-xl font-semibold text-ink mb-1">Facturadiscord</h1>
        <p className="text-sm text-slate-500 mb-6">Accede a tu panel de facturación</p>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="username">Usuario</label>
            <input className="input" id="username" name="username" type="text" autoComplete="username" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state?.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
