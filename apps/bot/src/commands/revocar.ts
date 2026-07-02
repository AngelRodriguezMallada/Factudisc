import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const revocarCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("revocar")
    .setDescription("(Solo el dueño) Quita el permiso a un usuario para usar el bot")
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a revocar").setRequired(true)),
  ownerOnly: true,
  execute: async (interaction) => {
    const user = interaction.options.getUser("usuario", true);

    const result = await prisma.allowedDiscordUser.deleteMany({ where: { discordId: user.id } });

    await interaction.reply({
      content:
        result.count > 0
          ? `Se ha revocado el permiso de ${user.username}.`
          : `${user.username} no estaba en la lista de permitidos.`,
      ephemeral: true,
    });
  },
};
