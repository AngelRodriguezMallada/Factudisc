"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@facturadiscord/db";
import { clientSchema } from "@/lib/validation";

function parseClientForm(formData: FormData) {
  return clientSchema.parse({
    name: formData.get("name"),
    taxId: formData.get("taxId"),
    address: formData.get("address"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
}

export async function createClientAction(_prevState: { error?: string } | undefined, formData: FormData) {
  try {
    const data = parseClientForm(formData);
    await prisma.client.create({ data: normalize(data) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo crear el cliente" };
  }
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateClientAction(
  id: number,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  try {
    const data = parseClientForm(formData);
    await prisma.client.update({ where: { id }, data: normalize(data) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo actualizar el cliente" };
  }
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteClientAction(id: number) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clientes");
  redirect("/clientes");
}

function normalize(data: ReturnType<typeof clientSchema.parse>) {
  return {
    name: data.name,
    taxId: data.taxId || null,
    address: data.address || null,
    email: data.email || null,
    phone: data.phone || null,
  };
}
