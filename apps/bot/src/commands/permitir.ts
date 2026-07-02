import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const permitirCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("permitir")
    .setDescription("(Solo el dueño) Da permiso a un usuario para usar el bot")
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a permitir").setRequired(true)),
  ownerOnly: true,
  execute: async (interaction) => {
    const user = interaction.options.getUser("usuario", true);

    await prisma.allowedDiscordUser.upsert({
      where: { discordId: user.id },
      update: { label: user.username },
      create: { discordId: user.id, label: user.username, addedBy: interaction.user.id },
    });

    await interaction.reply({ content: `${user.username} ya puede usar el bot.`, ephemeral: true });
  },
};
