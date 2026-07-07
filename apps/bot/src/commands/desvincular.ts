import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const desvincularCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("desvincular")
    .setDescription("(Owner) Desvincula este servidor de la cuenta"),
  scope: "accountOwner",
  execute: async (interaction, accountId) => {
    if (!interaction.guildId) {
      await interaction.reply({ content: "Usa este comando dentro de un servidor.", ephemeral: true });
      return;
    }

    const result = await prisma.accountDiscordLink.deleteMany({
      where: { guildId: interaction.guildId, accountId },
    });

    await interaction.reply({
      content: result.count > 0 ? "Servidor desvinculado de la cuenta." : "Este servidor no estaba vinculado.",
      ephemeral: true,
    });
  },
};
