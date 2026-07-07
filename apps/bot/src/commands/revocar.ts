import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const revocarCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("revocar")
    .setDescription("(Owner) Quita el acceso de un usuario a esta cuenta")
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a revocar").setRequired(true)),
  scope: "accountOwner",
  execute: async (interaction, accountId) => {
    const user = interaction.options.getUser("usuario", true);

    const dbUser = await prisma.user.findUnique({ where: { discordId: user.id } });
    if (!dbUser) {
      await interaction.reply({ content: `${user.username} no tenía acceso.`, ephemeral: true });
      return;
    }

    // No se puede revocar a un OWNER (eso lo gestiona el super-admin).
    const result = await prisma.accountMember.deleteMany({
      where: { accountId, userId: dbUser.id, role: { not: "OWNER" } },
    });

    await interaction.reply({
      content:
        result.count > 0
          ? `Se ha revocado el acceso de ${user.username}.`
          : `${user.username} no tenía acceso como miembro (o es owner).`,
      ephemeral: true,
    });
  },
};
