import { prisma } from "@facturadiscord/db";
import { requireSuperAdmin } from "@/lib/auth";
import { CreateAccountForm, GrantAccessForm, SetCredentialsForm } from "./AdminForms";
import { revokeAccessAction, deleteAccountAction } from "./actions";

export default async function AdminPage() {
  await requireSuperAdmin();

  const accounts = await prisma.account.findMany({
    orderBy: { id: "asc" },
    include: {
      members: { include: { user: true }, orderBy: { createdAt: "asc" } },
      discordLinks: true,
      _count: { select: { documents: true, clients: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Administración</h1>
        <p className="text-sm text-slate-500 mt-1">
          Crea cuentas y gestiona el acceso. No se muestra el contenido (facturas, clientes) de cada cuenta.
        </p>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="font-medium text-ink">Crear cuenta</h2>
        <CreateAccountForm />
      </div>

      <div className="space-y-4">
        <h2 className="font-medium text-ink">Cuentas ({accounts.length})</h2>
        {accounts.map((account) => (
          <div key={account.id} className="card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-ink">{account.name}</h3>
                <p className="text-xs text-slate-500">
                  {account._count.documents} documentos · {account._count.clients} clientes ·{" "}
                  {account.discordLinks.length} servidor(es) de Discord
                </p>
              </div>
              <form action={deleteAccountAction.bind(null, account.id)}>
                <button type="submit" className="btn-danger text-sm">Eliminar cuenta</button>
              </form>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Miembros</p>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {account.members.map((member) => (
                  <li key={member.id} className="px-4 py-3 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span>
                        <span className="font-medium text-ink">{member.user.username}</span>
                        <span className="text-slate-500"> · {member.user.discordId} · {member.role}</span>
                        {member.user.loginUsername ? (
                          <span className="text-slate-500"> · usuario web: <code>{member.user.loginUsername}</code></span>
                        ) : (
                          <span className="text-amber-600"> · sin usuario web</span>
                        )}
                      </span>
                      <form action={revokeAccessAction.bind(null, member.id)}>
                        <button type="submit" className="text-red-500 hover:text-red-700 text-sm">Quitar</button>
                      </form>
                    </div>
                    <SetCredentialsForm userId={member.user.id} hasCredentials={Boolean(member.user.loginUsername)} />
                  </li>
                ))}
              </ul>
            </div>

            {account.discordLinks.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Servidores vinculados</p>
                <ul className="text-sm text-slate-600 space-y-0.5">
                  {account.discordLinks.map((link) => (
                    <li key={link.id}>{link.guildName || link.guildId} <span className="text-slate-400">({link.guildId})</span></li>
                  ))}
                </ul>
              </div>
            ) : null}

            <GrantAccessForm accountId={account.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
