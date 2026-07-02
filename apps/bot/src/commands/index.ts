import type { Command } from "../types";
import { facturaCommand } from "./factura";
import { presupuestoCommand } from "./presupuesto";
import { permitirCommand } from "./permitir";
import { revocarCommand } from "./revocar";
import { permitidosCommand } from "./permitidos";

export const commands: Command[] = [
  facturaCommand,
  presupuestoCommand,
  permitirCommand,
  revocarCommand,
  permitidosCommand,
];
