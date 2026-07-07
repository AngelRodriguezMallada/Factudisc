"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@facturadiscord/db";
import { clientSchema } from "@/lib/validation";
import { requireAccount } from "@/lib/auth";

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
  const { accountId } = await requireAccount();
  try {
    const data = parseClientForm(formData);
    await prisma.client.create({ data: { accountId, ...normalize(data) } });
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
  const { accountId } = await requireAccount();
  try {
    const data = parseClientForm(formData);
    // updateMany permite filtrar por accountId (evita editar clientes de otra cuenta).
    const result = await prisma.client.updateMany({
      where: { id, accountId },
      data: normalize(data),
    });
    if (result.count === 0) {
      return { error: "Cliente no encontrado." };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo actualizar el cliente" };
  }
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteClientAction(id: number) {
  const { accountId } = await requireAccount();

  const client = await prisma.client.findFirst({ where: { id, accountId } });
  if (!client) {
    throw new Error("Cliente no encontrado.");
  }

  const documentCount = await prisma.document.count({ where: { clientId: id } });
  if (documentCount > 0) {
    throw new Error(
      `No se puede borrar el cliente porque tiene ${documentCount} documento(s) asociado(s).`
    );
  }

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
