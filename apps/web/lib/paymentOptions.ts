import { prisma } from "@facturadiscord/db";

export interface PaymentOptionCreate {
  type: "TRANSFER" | "PAYPAL" | "BIZUM" | "CASH" | "CARD" | "OTHER";
  label: string | null;
  details: string;
  position: number;
}

/**
 * A partir de los métodos de pago seleccionados (por id) de una cuenta, genera
 * los datos snapshot para DocumentPaymentOption. Ignora ids que no pertenezcan
 * a la cuenta. Respeta el orden en que se pasaron los ids.
 */
export async function buildPaymentOptionCreates(
  accountId: number,
  methodIds: number[]
): Promise<PaymentOptionCreate[]> {
  if (methodIds.length === 0) return [];

  const methods = await prisma.paymentMethod.findMany({
    where: { accountId, id: { in: methodIds } },
  });
  const byId = new Map(methods.map((m) => [m.id, m]));

  return methodIds
    .map((id) => byId.get(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m, index) => ({
      type: m.type,
      label: m.label,
      details: m.details,
      position: index,
    }));
}
