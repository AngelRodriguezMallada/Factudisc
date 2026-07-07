import { redirect } from "next/navigation";
import { prisma, getMembershipsForUser, pickDefaultAccountId, type MembershipInfo } from "@facturadiscord/db";
import { getSession, type SessionData } from "./session";

export function getSuperAdminDiscordId(): string | undefined {
  return process.env.SUPER_ADMIN_DISCORD_ID || process.env.OWNER_DISCORD_ID || undefined;
}

export function isSuperAdminDiscordId(discordId: string | undefined | null): boolean {
  const superId = getSuperAdminDiscordId();
  return Boolean(superId && discordId && discordId === superId);
}

export interface CurrentUser {
  userId: number;
  discordId: string;
  username: string;
  isSuperAdmin: boolean;
  memberships: MembershipInfo[];
}

/** Usuario autenticado (o null si no hay sesión válida). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;

  const memberships = await getMembershipsForUser(user.id);
  return {
    userId: user.id,
    discordId: user.discordId,
    username: user.username,
    isSuperAdmin: isSuperAdminDiscordId(user.discordId),
    memberships,
  };
}

export interface AccountContext extends CurrentUser {
  accountId: number;
  role: MembershipInfo["role"];
}

/**
 * Exige una sesión con una cuenta activa. Redirige a /login si no hay sesión,
 * o a /sin-acceso si el usuario no pertenece a ninguna cuenta.
 * Verifica que la cuenta de la sesión sigue siendo una membresía válida.
 */
export async function requireAccount(): Promise<AccountContext> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const session = await getSession();
  let membership = user.memberships.find((m) => m.accountId === session.accountId);

  // Si la cuenta de la sesión ya no es válida, cae a la cuenta por defecto.
  if (!membership) {
    const defaultId = pickDefaultAccountId(user.memberships);
    membership = user.memberships.find((m) => m.accountId === defaultId);
    if (membership) {
      session.accountId = membership.accountId;
      await session.save();
    }
  }

  if (!membership) {
    redirect("/sin-acceso");
  }

  return { ...user, accountId: membership.accountId, role: membership.role };
}

/** Como requireAccount pero exige rol OWNER en la cuenta activa. */
export async function requireAccountOwner(): Promise<AccountContext> {
  const ctx = await requireAccount();
  if (ctx.role !== "OWNER") {
    redirect("/");
  }
  return ctx;
}

/** Exige que el usuario sea el super-admin de la plataforma. */
export async function requireSuperAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.isSuperAdmin) {
    redirect("/");
  }
  return user;
}

export type { SessionData };
