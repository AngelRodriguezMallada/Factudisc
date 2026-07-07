import { prisma } from "./index";
import { MemberRole } from "../generated/client/index.js";
import { generateNextDocumentNumber } from "./documentNumber";

export interface MembershipInfo {
  accountId: number;
  accountName: string;
  role: MemberRole;
}

/** Cuenta a la que pertenece un servidor de Discord, o null si no está vinculado. */
export async function getAccountIdForGuild(guildId: string): Promise<number | null> {
  const link = await prisma.accountDiscordLink.findUnique({ where: { guildId } });
  return link?.accountId ?? null;
}

/** Devuelve al usuario de Discord (por discordId) o null. */
export async function getUserByDiscordId(discordId: string) {
  return prisma.user.findUnique({ where: { discordId } });
}

/** Membresía de un usuario de Discord en una cuenta concreta, o null. */
export async function getMembershipForDiscordUser(
  discordId: string,
  accountId: number
): Promise<MembershipInfo | null> {
  const user = await prisma.user.findUnique({
    where: { discordId },
    include: {
      memberships: { where: { accountId }, include: { account: true } },
    },
  });
  const membership = user?.memberships[0];
  if (!membership) return null;
  return { accountId, accountName: membership.account.name, role: membership.role };
}

/** Todas las membresías de un usuario de Discord (por discordId). */
export async function getMembershipsForDiscordUser(discordId: string): Promise<MembershipInfo[]> {
  const user = await prisma.user.findUnique({ where: { discordId } });
  if (!user) return [];
  return getMembershipsForUser(user.id);
}

/** Todas las membresías de un usuario (por id interno). */
export async function getMembershipsForUser(userId: number): Promise<MembershipInfo[]> {
  const memberships = await prisma.accountMember.findMany({
    where: { userId },
    include: { account: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({
    accountId: m.accountId,
    accountName: m.account.name,
    role: m.role,
  }));
}

/** Elige la cuenta OWNER preferente; si no, la primera membresía. */
export function pickDefaultAccountId(memberships: MembershipInfo[]): number | null {
  if (memberships.length === 0) return null;
  const owned = memberships.find((m) => m.role === "OWNER");
  return (owned ?? memberships[0]).accountId;
}

/** Vincula (o revincula) un servidor de Discord a una cuenta. */
export async function linkGuildToAccount(
  accountId: number,
  guildId: string,
  guildName: string | null,
  linkedBy: string
) {
  return prisma.accountDiscordLink.upsert({
    where: { guildId },
    update: { accountId, guildName },
    create: { accountId, guildId, guildName, linkedBy },
  });
}

/**
 * Convierte un presupuesto de una cuenta en factura: copia líneas y métodos de
 * pago (snapshot), genera un número de factura para la cuenta y enlaza el origen.
 * Lógica compartida por la web y el bot.
 */
export async function convertQuoteToInvoice(accountId: number, quoteId: number) {
  const quote = await prisma.document.findFirst({
    where: { id: quoteId, accountId, type: "QUOTE" },
    include: { lines: { orderBy: { position: "asc" } }, paymentOptions: { orderBy: { position: "asc" } }, convertedTo: true },
  });
  if (!quote) {
    throw new Error("Presupuesto no encontrado en esta cuenta.");
  }
  if (quote.convertedTo) {
    throw new Error(`Este presupuesto ya se convirtió en la factura ${quote.convertedTo.number}.`);
  }

  const number = await generateNextDocumentNumber(accountId, "INVOICE");

  return prisma.document.create({
    data: {
      accountId,
      type: "INVOICE",
      number,
      status: "DRAFT",
      clientId: quote.clientId,
      issueDate: new Date(),
      notes: quote.notes,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      convertedFromId: quote.id,
      lines: {
        create: quote.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
          position: l.position,
        })),
      },
      paymentOptions: {
        create: quote.paymentOptions.map((p) => ({
          type: p.type,
          label: p.label,
          details: p.details,
          position: p.position,
        })),
      },
    },
  });
}
