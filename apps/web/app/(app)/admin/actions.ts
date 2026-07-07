"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@facturadiscord/db";
import { requireSuperAdmin } from "@/lib/auth";
import { hashPassword, validateCredentials } from "@/lib/password";

const DISCORD_ID_RE = /^\d{5,25}$/;

async function ensureUser(discordId: string) {
  return prisma.user.upsert({
    where: { discordId },
    update: {},
    // username provisional hasta que el usuario entre por OAuth.
    create: { discordId, username: discordId },
  });
}

/** Asigna usuario/contraseña a un usuario. Devuelve mensaje de error o null. */
async function applyCredentials(userId: number, username: string, password: string): Promise<string | null> {
  const validationError = validateCredentials(username, password);
  if (validationError) return validationError;

  const clash = await prisma.user.findUnique({ where: { loginUsername: username } });
  if (clash && clash.id !== userId) {
    return "Ese nombre de usuario ya está en uso.";
  }

  await prisma.user.update({
    where: { id: userId },
    data: { loginUsername: username, passwordHash: await hashPassword(password) },
  });
  return null;
}

export async function createAccountAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireSuperAdmin();

  const name = String(formData.get("name") || "").trim();
  const ownerDiscordId = String(formData.get("ownerDiscordId") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name) return { error: "El nombre de la cuenta es obligatorio." };
  if (!DISCORD_ID_RE.test(ownerDiscordId)) {
    return { error: "El ID de Discord del owner no es válido (solo dígitos)." };
  }

  const account = await prisma.account.create({ data: { name } });
  const owner = await ensureUser(ownerDiscordId);
  await prisma.accountMember.create({
    data: { accountId: account.id, userId: owner.id, role: "OWNER" },
  });

  // Credenciales de acceso web opcionales para el owner.
  if (username || password) {
    const credError = await applyCredentials(owner.id, username, password);
    if (credError) {
      // La cuenta se creó; avisamos de que faltan las credenciales.
      revalidatePath("/admin");
      return { error: `Cuenta creada, pero no se asignaron credenciales: ${credError}` };
    }
  }

  revalidatePath("/admin");
  return {};
}

export async function setCredentialsAction(
  _prevState: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  await requireSuperAdmin();

  const userId = Number(formData.get("userId"));
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!Number.isInteger(userId)) return { error: "Usuario no válido." };

  const credError = await applyCredentials(userId, username, password);
  if (credError) return { error: credError };

  revalidatePath("/admin");
  return { ok: true };
}

export async function grantAccessAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireSuperAdmin();

  const accountId = Number(formData.get("accountId"));
  const discordId = String(formData.get("discordId") || "").trim();
  const role = formData.get("role") === "OWNER" ? "OWNER" : "MEMBER";

  if (!Number.isInteger(accountId)) return { error: "Cuenta no válida." };
  if (!DISCORD_ID_RE.test(discordId)) {
    return { error: "El ID de Discord no es válido (solo dígitos)." };
  }

  const user = await ensureUser(discordId);
  await prisma.accountMember.upsert({
    where: { accountId_userId: { accountId, userId: user.id } },
    update: { role },
    create: { accountId, userId: user.id, role },
  });

  revalidatePath("/admin");
  return {};
}

export async function revokeAccessAction(memberId: number) {
  await requireSuperAdmin();
  await prisma.accountMember.delete({ where: { id: memberId } });
  revalidatePath("/admin");
}

export async function deleteAccountAction(accountId: number) {
  await requireSuperAdmin();
  await prisma.account.delete({ where: { id: accountId } });
  revalidatePath("/admin");
}
