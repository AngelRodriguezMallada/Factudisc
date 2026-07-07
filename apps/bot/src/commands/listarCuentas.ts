import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@facturadiscord/db";
import type { Command } from "../types";

export const listarCuentasCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("listar-cuentas")
    .setDescription("(Super-admin) Lista las cuentas de la plataforma"),
  scope: "superadmin",
  execute: async (interaction) => {
    const accounts = await prisma.account.findMany({
      orderBy: { id: "asc" },
      include: {
        members: { where: { role: "OWNER" }, include: { user: true } },
        _count: { select: { documents: true, clients: true, discordLinks: true } },
      },
    });

    if (accounts.length === 0) {
      await interaction.reply({ content: "No hay cuentas todavía.", ephemeral: true });
      return;
    }

    const lines = accounts.map((a) => {
      const owners = a.members.map((m) => `<@${m.user.discordId}>`).join(", ") || "—";
      return `• **#${a.id} ${a.name}** — owner: ${owners} · ${a._count.documents} docs · ${a._count.discordLinks} server(s)`;
    });

    await interaction.reply({ content: lines.join("\n").slice(0, 1900), ephemeral: true });
  },
};
