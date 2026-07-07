import { createDocumentCommand } from "./documentCommand";

export const facturaCommand = createDocumentCommand({
  name: "factura",
  description: "Publica el PDF de una factura por su número",
  numeroDescription: "Número de factura, ej. FAC-2026-0001",
  type: "INVOICE",
});
