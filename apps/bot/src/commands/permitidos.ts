import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";
import { config } from "../config";

export const permitidosCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("permitidos")
    .setDescription("(Solo el dueño) Lista los usuarios con permiso para usar el bot"),
  ownerOnly: true,
  execute: async (interaction) => {
    const entries = await prisma.allowedDiscordUser.findMany({ orderBy: { addedAt: "asc" } });

    const lines = [`• <@${config.ownerDiscordId}> (dueño)`];
    for (const entry of entries) {
      // El dueño ya aparece arriba; evitamos listarlo dos veces si además está en la BD.
      if (entry.discordId === config.ownerDiscordId) continue;
      lines.push(`• <@${entry.discordId}>${entry.label ? ` (${entry.label})` : ""}`);
    }

    await interaction.reply({ content: lines.join("\n"), ephemeral: true });
  },
};
