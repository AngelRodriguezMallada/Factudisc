import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const crearCuentaCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("crear-cuenta")
    .setDescription("(Super-admin) Crea una cuenta y asigna su owner")
    .addStringOption((opt) =>
      opt.setName("nombre").setDescription("Nombre de la cuenta / empresa").setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("owner").setDescription("Usuario de Discord que será el owner").setRequired(true)
    ),
  scope: "superadmin",
  execute: async (interaction) => {
    const name = interaction.options.getString("nombre", true).trim();
    const owner = interaction.options.getUser("owner", true);

    const account = await prisma.account.create({ data: { name } });
    const dbUser = await prisma.user.upsert({
      where: { discordId: owner.id },
      update: { username: owner.username },
      create: { discordId: owner.id, username: owner.username },
    });
    await prisma.accountMember.create({
      data: { accountId: account.id, userId: dbUser.id, role: "OWNER" },
    });

    await interaction.reply({
      content: `✅ Cuenta **${name}** (#${account.id}) creada con ${owner.username} como owner. Que use \`/vincular\` en su servidor.`,
      ephemeral: true,
    });
  },
};
