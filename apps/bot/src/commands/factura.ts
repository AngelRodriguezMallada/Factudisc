import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";
import { handleDocumentCommand } from "../lib/sendDocument";

export const facturaCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("factura")
    .setDescription("Publica el PDF de una factura por su número")
    .addStringOption((opt) =>
      opt.setName("numero").setDescription("Número de factura, ej. FAC-2026-0001").setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Enviar por DM a este usuario en vez de publicarlo en el canal")
    ),
  requiresAllowlist: true,
  execute: (interaction) => handleDocumentCommand(interaction, "INVOICE"),
};
