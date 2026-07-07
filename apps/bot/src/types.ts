import type { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";

export interface Command {
  data: { name: string; toJSON(): unknown };
  ownerOnly?: boolean;
  requiresAllowlist?: boolean;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
