import { prisma } from "@facturadiscord/db";
import { config } from "./config";

export function isOwner(userId: string): boolean {
  return userId === config.ownerDiscordId;
}

export async function isAllowed(userId: string): Promise<boolean> {
  if (isOwner(userId)) return true;
  const entry = await prisma.allowedDiscordUser.findUnique({ where: { discordId: userId } });
  return Boolean(entry);
}
