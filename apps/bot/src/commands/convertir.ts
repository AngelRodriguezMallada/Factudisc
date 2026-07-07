import { SlashCommandBuilder } from "discord.js";
import { prisma, convertQuoteToInvoice } from "@facturadiscord/db";
import type { Command } from "../types";
import { handleDocumentAutocomplete, publishDocumentPdf } from "../lib/sendDocument";

export const convertirCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("convertir")
    .setDescription("Convierte un presupuesto en factura y publica el PDF")
    .addStringOption((opt) =>
      opt
        .setName("numero")
        .setDescription("Número del presupuesto, ej. PRE-2026-0001")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Enviar la factura por DM a este usuario en vez de publicarla")
    ),
  scope: "account",
  execute: async (interaction, accountId) => {
    const numero = interaction.options.getString("numero", true).trim();
    const targetUser = interaction.options.getUser("usuario");

    await interaction.deferReply({ ephemeral: Boolean(targetUser) });

    const quote = await prisma.document.findFirst({
      where: { accountId, number: numero, type: "QUOTE" },
    });
    if (!quote) {
      await interaction.editReply(`No se ha encontrado ningún presupuesto con el número \`${numero}\`.`);
      return;
    }

    // Lanza un error legible si ya estaba convertido; lo captura el handler.
    const invoice = await convertQuoteToInvoice(accountId, quote.id);

    await publishDocumentPdf(interaction, accountId, "INVOICE", invoice.number, targetUser);
  },
  autocomplete: (interaction, accountId) => handleDocumentAutocomplete(interaction, accountId, "QUOTE"),
};
