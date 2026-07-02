import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { InvoiceDocument } from "./InvoiceDocument";
import type { DocumentPdfData } from "./types";

export async function renderDocumentPdf(data: DocumentPdfData): Promise<Buffer> {
  const element = React.createElement(InvoiceDocument, { data }) as React.ReactElement<DocumentProps>;
  return renderToBuffer(element);
}
