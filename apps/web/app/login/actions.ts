"use server";

import { redirect } from "next/navigation";
import { prisma, getMembershipsForUser, pickDefaultAccountId } from "@facturadiscord/db";
import { getSession } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { isSuperAdminDiscordId } from "@/lib/auth";

export async function passwordLoginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Introduce usuario y contraseña." };
  }

  const user = await prisma.user.findUnique({ where: { loginUsername: username } });
  if (!user || !user.passwordHash) {
    return { error: "Credenciales incorrectas." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Credenciales incorrectas." };
  }

  const memberships = await getMembershipsForUser(user.id);
  const defaultAccountId = pickDefaultAccountId(memberships);

  if (defaultAccountId === null && !isSuperAdminDiscordId(user.discordId)) {
    redirect("/sin-acceso");
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.discordId = user.discordId;
  session.accountId = defaultAccountId ?? undefined;
  await session.save();

  redirect(defaultAccountId === null ? "/admin" : "/");
}
