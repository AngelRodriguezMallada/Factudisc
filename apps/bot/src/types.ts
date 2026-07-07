import type { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";

export type CommandScope =
  | "superadmin" // solo el super-admin
  | "account" // requiere que el guild esté vinculado y el usuario sea miembro
  | "accountOwner" // como account, pero el usuario debe ser OWNER de esa cuenta
  | "ownerSelf"; // resuelve la cuenta desde la membresía OWNER del usuario (p. ej. /vincular)

export interface Command {
  data: { name: string; toJSON(): unknown };
  scope: CommandScope;
  // accountId resuelto (0 para comandos de super-admin, que no lo usan).
  execute: (interaction: ChatInputCommandInteraction, accountId: number) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction, accountId: number) => Promise<void>;
}
