import { createDocumentCommand } from "./documentCommand";

export const presupuestoCommand = createDocumentCommand({
  name: "presupuesto",
  description: "Publica el PDF de un presupuesto por su número",
  numeroDescription: "Número de presupuesto, ej. PRE-2026-0001",
  type: "QUOTE",
});
