import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions/logout";

const NAV_LINKS = [
  { href: "/", label: "Panel" },
  { href: "/documentos?type=INVOICE", label: "Facturas" },
  { href: "/documentos?type=QUOTE", label: "Presupuestos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/empresa", label: "Empresa" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold text-ink">
              Facturadiscord
            </Link>
            <nav className="flex gap-5 text-sm text-slate-600">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-accent">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action={logoutAction} className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{session.username}</span>
            <button type="submit" className="btn-secondary">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
