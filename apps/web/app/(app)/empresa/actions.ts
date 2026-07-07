"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@facturadiscord/db";
import { companySchema, paymentMethodSchema } from "@/lib/validation";
import { requireAccountOwner } from "@/lib/auth";

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
