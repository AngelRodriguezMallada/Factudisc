import { SlashCommandBuilder } from "discord.js";
import { getAccountIdForGuild, linkGuildToAccount } from "@facturadiscord/db";
import type { Command } from "../types";

export const vincularCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("vincular")
    .setDescription("(Owner) Vincula este servidor de Discord a tu cuenta"),
  scope: "ownerSelf",
  execute: async (interaction, accountId) => {
    if (!interaction.guildId) {
      await interaction.reply({ content: "Usa este comando dentro de un servidor.", ephemeral: true });
      return;
    }

    const existing = await getAccountIdForGuild(interaction.guildId);
    if (existing !== null && existing !== accountId) {
      await interaction.reply({
        content: "Este servidor ya está vinculado a otra cuenta. Desvincúlalo primero.",
        ephemeral: true,
      });
      return;
    }

    await linkGuildToAccount(accountId, interaction.guildId, interaction.guild?.name ?? null, interaction.user.id);
    await interaction.reply({
      content: "✅ Servidor vinculado a tu cuenta. Ya puedes usar `/factura`, `/presupuesto` y `/convertir` aquí.",
      ephemeral: true,
    });
  },
};
