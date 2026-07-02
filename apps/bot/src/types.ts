import type { ChatInputCommandInteraction } from "discord.js";

export interface Command {
  data: { name: string; toJSON(): unknown };
  ownerOnly?: boolean;
  requiresAllowlist?: boolean;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
