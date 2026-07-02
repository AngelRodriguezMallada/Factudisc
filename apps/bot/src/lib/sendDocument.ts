import { AttachmentBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma, type DocumentType } from "@facturadiscord/db";
import { renderDocumentPdf, buildPdfData } from "@facturadiscord/pdf";

const KIND_LABEL: Record<DocumentType, string> = {
  INVOICE: "factura",
  QUOTE: "presupuesto",
};

export async function handleDocumentCommand(interaction: ChatInputCommandInteraction, type: DocumentType) {
  const numero = interaction.options.getString("numero", true).trim();
  const targetUser = interaction.options.getUser("usuario");

  await interaction.deferReply();

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
