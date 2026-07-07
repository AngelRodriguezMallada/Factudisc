import { logoutAction } from "@/lib/actions/logout";

export default function SinAccesoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8 text-center space-y-4">
        <h1 className="text-xl font-semibold text-ink">Todavía no tienes acceso</h1>
        <p className="text-sm text-slate-500">
          Tu cuenta de Discord no está asignada a ninguna cuenta de facturación. Pide al
          administrador que te dé acceso y vuelve a entrar.
        </p>
        <form action={logoutAction}>
          <button type="submit" className="btn-secondary">Cerrar sesión</button>
        </form>
      </div>
    </div>
  );
}
