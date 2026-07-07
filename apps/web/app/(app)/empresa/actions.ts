"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@facturadiscord/db";
import { companySchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";

export async function updateCompanyAction(_prevState: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  await requireSession();
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

    const existing = await prisma.companyProfile.findFirst();
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

    if (existing) {
      await prisma.companyProfile.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.companyProfile.create({ data: payload });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar" };
  }

  revalidatePath("/empresa");
  return { ok: true };
}
