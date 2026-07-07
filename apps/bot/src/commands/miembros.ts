import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const miembrosCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("miembros")
    .setDescription("(Owner) Lista los usuarios con acceso a esta cuenta"),
  scope: "accountOwner",
  execute: async (interaction, accountId) => {
    const members = await prisma.accountMember.findMany({
      where: { accountId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    const lines = members.map(
      (m) => `• <@${m.user.discordId}>${m.role === "OWNER" ? " (owner)" : ""}`
    );

    await interaction.reply({
      content: lines.length > 0 ? lines.join("\n") : "No hay miembros todavía.",
      ephemeral: true,
    });
  },
};
