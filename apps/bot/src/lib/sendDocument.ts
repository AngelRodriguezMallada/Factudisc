import {
  AttachmentBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";
import { prisma, type DocumentType } from "@facturadiscord/db";
import { renderDocumentPdf, buildPdfData } from "@facturadiscord/pdf";

const KIND_LABEL: Record<DocumentType, string> = {
  INVOICE: "factura",
  QUOTE: "presupuesto",
};

// Discord permite un máximo de 25 sugerencias de autocompletado, y cada etiqueta
// no puede superar los 100 caracteres.
const AUTOCOMPLETE_LIMIT = 25;

export async function handleDocumentAutocomplete(
  interaction: AutocompleteInteraction,
  type: DocumentType
) {
  const focused = interaction.options.getFocused().trim();

  const documents = await prisma.document.findMany({
    where: {
      type,
      ...(focused ? { number: { contains: focused } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: AUTOCOMPLETE_LIMIT,
    include: { client: true },
  });

  await interaction.respond(
    documents.map((doc) => ({
      name: `${doc.number} · ${doc.client.name}`.slice(0, 100),
      value: doc.number,
    }))
  );
}

export async function handleDocumentCommand(interaction: ChatInputCommandInteraction, type: DocumentType) {
  const numero = interaction.options.getString("numero", true).trim();
  const targetUser = interaction.options.getUser("usuario");

  // Si se envía por DM, la confirmación es privada para no llenar el canal.
  await interaction.deferReply({ ephemeral: Boolean(targetUser) });

  const document = await prisma.document.findFirst({
    where: { number: numero, type },
    include: { client: true, lines: { orderBy: { position: "asc" } } },
  });

  if (!document) {
    await interaction.editReply(`No se ha encontrado ningún/a ${KIND_LABEL[type]} con el número \`${numero}\`.`);
    return;
  }

  const company = await prisma.companyProfile.findFirst();
  if (!company) {
    await interaction.editReply("El perfil de la empresa no está configurado todavía en la web.");
    return;
  }

  const pdfData = buildPdfData(document, document.client, company);
  const buffer = await renderDocumentPdf(pdfData);
  const attachment = new AttachmentBuilder(buffer, { name: `${document.number}.pdf` });
  const label = `${KIND_LABEL[type][0].toUpperCase()}${KIND_LABEL[type].slice(1)} ${document.number} · ${document.client.name}`;

  if (targetUser) {
    try {
      await targetUser.send({ content: label, files: [attachment] });
      await interaction.editReply(`He enviado ${document.number} por DM a ${targetUser.username}.`);
    } catch {
      await interaction.editReply(
        `No he podido enviar el DM a ${targetUser.username}. Debe compartir un servidor con el bot y tener los mensajes directos abiertos.`
      );
    }
    return;
  }

  await interaction.editReply({ content: label, files: [attachment] });
}
