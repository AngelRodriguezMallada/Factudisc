import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const permitirCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("permitir")
    .setDescription("(Owner) Da acceso a un usuario para usar el bot en esta cuenta")
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a permitir").setRequired(true)),
  scope: "accountOwner",
  execute: async (interaction, accountId) => {
    const user = interaction.options.getUser("usuario", true);

    const dbUser = await prisma.user.upsert({
      where: { discordId: user.id },
      update: { username: user.username },
      create: { discordId: user.id, username: user.username },
    });

    await prisma.accountMember.upsert({
      where: { accountId_userId: { accountId, userId: dbUser.id } },
      update: {},
      create: { accountId, userId: dbUser.id, role: "MEMBER" },
    });

    await interaction.reply({ content: `${user.username} ya puede usar el bot en esta cuenta.`, ephemeral: true });
  },
};
