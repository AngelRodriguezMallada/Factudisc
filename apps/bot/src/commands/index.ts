import type { Command } from "../types";
import { facturaCommand } from "./factura";
import { presupuestoCommand } from "./presupuesto";
import { convertirCommand } from "./convertir";
import { vincularCommand } from "./vincular";
import { desvincularCommand } from "./desvincular";
import { miembrosCommand } from "./miembros";
import { permitirCommand } from "./permitir";
import { revocarCommand } from "./revocar";
import { crearCuentaCommand } from "./crearCuenta";
import { listarCuentasCommand } from "./listarCuentas";

export const commands: Command[] = [
  // Facturación (miembros de la cuenta)
  facturaCommand,
  presupuestoCommand,
  convertirCommand,
  // Gestión de la cuenta (owner)
  vincularCommand,
  desvincularCommand,
  miembrosCommand,
  permitirCommand,
  revocarCommand,
  // Plataforma (super-admin)
  crearCuentaCommand,
  listarCuentasCommand,
];
