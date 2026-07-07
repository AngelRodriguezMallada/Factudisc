import {
  getAccountIdForGuild,
  getMembershipForDiscordUser,
  getMembershipsForDiscordUser,
  type MembershipInfo,
} from "@facturadiscord/db";
import { config } from "./config";

export function isSuperAdmin(userId: string): boolean {
  return userId === config.superAdminDiscordId;
}

export { getAccountIdForGuild, getMembershipForDiscordUser };

/** Cuentas de las que el usuario es OWNER. */
export async function getOwnedAccounts(discordId: string): Promise<MembershipInfo[]> {
  const memberships = await getMembershipsForDiscordUser(discordId);
  return memberships.filter((m) => m.role === "OWNER");
}
