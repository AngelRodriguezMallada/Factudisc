import { SlashCommandBuilder } from "discord.js";
import type { DocumentType } from "@facturadiscord/db";
import type { Command } from "../types";
import { handleDocumentCommand, handleDocumentAutocomplete } from "../lib/sendDocument";

interface DocumentCommandConfig {
  name: string;
  description: string;
  numeroDescription: string;
  type: DocumentType;
}

// Factura y presupuesto solo se diferencian en los textos y el tipo, así que
// compartimos la construcción del comando para no duplicar lógica.
export function createDocumentCommand(cfg: DocumentCommandConfig): Command {
  return {
    data: new SlashCommandBuilder()
      .setName(cfg.name)
      .setDescription(cfg.description)
      .addStringOption((opt) =>
        opt
          .setName("numero")
          .setDescription(cfg.numeroDescription)
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addUserOption((opt) =>
        opt
          .setName("usuario")
          .setDescription("Enviar por DM a este usuario en vez de publicarlo en el canal")
      ),
    requiresAllowlist: true,
    execute: (interaction) => handleDocumentCommand(interaction, cfg.type),
    autocomplete: (interaction) => handleDocumentAutocomplete(interaction, cfg.type),
  };
}
