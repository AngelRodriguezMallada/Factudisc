"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@facturadiscord/db";
import { companySchema, paymentMethodSchema } from "@/lib/validation";
import { requireAccount, requireAccountOwner } from "@/lib/auth";
import { hashPassword, validateCredentials } from "@/lib/password";

export async function updateCompanyAction(_prevState: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const { accountId } = await requireAccountOwner();
  try {
    const data = companySchema.parse({
      name: formData.get("name"),
      taxId: formData.get("taxId"),
      address: formData.get("address"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      iban: formData.get("iban"),
      logoUrl: formData.get("logoUrl"),
      defaultTaxRate: formData.get("defaultTaxRate"),
      notes: formData.get("notes"),
    });

    const payload = {
      name: data.name,
      taxId: data.taxId || null,
      address: data.address || null,
      email: data.email || null,
      phone: data.phone || null,
      iban: data.iban || null,
      logoUrl: data.logoUrl || null,
      defaultTaxRate: data.defaultTaxRate,
      notes: data.notes || null,
    };

    await prisma.companyProfile.upsert({
      where: { accountId },
      update: payload,
      create: { accountId, ...payload },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar" };
  }

  revalidatePath("/empresa");
  return { ok: true };
}

export async function createPaymentMethodAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const { accountId } = await requireAccountOwner();
  try {
    const data = paymentMethodSchema.parse({
      type: formData.get("type"),
      label: formData.get("label"),
      details: formData.get("details"),
    });

    const count = await prisma.paymentMethod.count({ where: { accountId } });
    await prisma.paymentMethod.create({
      data: {
        accountId,
        type: data.type,
        label: data.label || null,
        details: data.details,
        position: count,
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo añadir el método" };
  }

  revalidatePath("/empresa");
  return {};
}

export async function deletePaymentMethodAction(id: number) {
  const { accountId } = await requireAccountOwner();
  await prisma.paymentMethod.deleteMany({ where: { id, accountId } });
  revalidatePath("/empresa");
}

/** Cada usuario puede fijar/cambiar SUS propias credenciales de acceso web. */
export async function setMyCredentialsAction(
  _prevState: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const { userId } = await requireAccount();

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  const validationError = validateCredentials(username, password);
  if (validationError) return { error: validationError };

  const clash = await prisma.user.findUnique({ where: { loginUsername: username } });
  if (clash && clash.id !== userId) {
    return { error: "Ese nombre de usuario ya está en uso." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { loginUsername: username, passwordHash: await hashPassword(password) },
  });

  revalidatePath("/empresa");
  return { ok: true };
}
