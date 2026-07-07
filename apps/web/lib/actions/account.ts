"use server";

import { revalidatePath } from "next/cache";
import { getMembershipsForUser } from "@facturadiscord/db";
import { getSession } from "@/lib/session";

/** Cambia la cuenta activa de la sesión, validando que el usuario pertenece a ella. */
export async function switchAccountAction(formData: FormData) {
  const session = await getSession();
  if (!session.userId) return;

  const accountId = Number(formData.get("accountId"));
  const memberships = await getMembershipsForUser(session.userId);
  if (!memberships.some((m) => m.accountId === accountId)) {
    return;
  }

  session.accountId = accountId;
  await session.save();
  revalidatePath("/", "layout");
}
