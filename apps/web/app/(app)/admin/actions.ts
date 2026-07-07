"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@facturadiscord/db";
import { requireSuperAdmin } from "@/lib/auth";

const DISCORD_ID_RE = /^\d{5,25}$/;

async function ensureUser(discordId: string) {
  return prisma.user.upsert({
    where: { discordId },
    update: {},
    // username provisional hasta que el usuario entre por OAuth.
    create: { discordId, username: discordId },
  });
}

export async function createAccountAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireSuperAdmin();

  const name = String(formData.get("name") || "").trim();
  const ownerDiscordId = String(formData.get("ownerDiscordId") || "").trim();

  if (!name) return { error: "El nombre de la cuenta es obligatorio." };
  if (!DISCORD_ID_RE.test(ownerDiscordId)) {
    return { error: "El ID de Discord del owner no es válido (solo dígitos)." };
  }

  const account = await prisma.account.create({ data: { name } });
  const owner = await ensureUser(ownerDiscordId);
  await prisma.accountMember.create({
    data: { accountId: account.id, userId: owner.id, role: "OWNER" },
  });

  revalidatePath("/admin");
  return {};
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
