import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions/logout";
import { switchAccountAction } from "@/lib/actions/account";

const NAV_LINKS = [
  { href: "/", label: "Panel" },
  { href: "/documentos?type=INVOICE", label: "Facturas" },
  { href: "/documentos?type=QUOTE", label: "Presupuestos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/empresa", label: "Empresa" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const session = await getSession();
  const activeAccountId = session.accountId;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold text-ink">
              factuRM
            </Link>
            <nav className="flex gap-5 text-sm text-slate-600">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-accent">
                  {link.label}
                </Link>
              ))}
              {user.isSuperAdmin ? (
                <Link href="/admin" className="hover:text-accent font-medium text-accent">
                  Admin
                </Link>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user.memberships.length > 1 ? (
              <form action={switchAccountAction} className="flex items-center gap-2">
                <select name="accountId" defaultValue={activeAccountId} className="input py-1 text-sm">
                  {user.memberships.map((m) => (
                    <option key={m.accountId} value={m.accountId}>
                      {m.accountName}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-secondary text-sm">Cambiar</button>
              </form>
            ) : null}
            <form action={logoutAction} className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{user.username}</span>
              <button type="submit" className="btn-secondary">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
