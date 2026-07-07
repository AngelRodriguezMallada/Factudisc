import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  taxId: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export const companySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  taxId: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  iban: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  defaultTaxRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional().or(z.literal("")),
});

export const lineSchema = z.object({
  description: z.string().min(1, "Descripción requerida"),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100),
});

export const documentSchema = z.object({
  type: z.enum(["INVOICE", "QUOTE"]),
  clientId: z.coerce.number().int().positive(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "PAID", "EXPIRED"]).default("DRAFT"),
  issueDate: z.string().min(1),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paymentMethodIds: z.array(z.coerce.number().int().positive()).default([]),
  lines: z.array(lineSchema).min(1, "Añade al menos una línea"),
});

export const PAYMENT_METHOD_TYPES = ["TRANSFER", "PAYPAL", "BIZUM", "CASH", "CARD", "OTHER"] as const;

export const paymentMethodSchema = z.object({
  type: z.enum(PAYMENT_METHOD_TYPES),
  label: z.string().optional().or(z.literal("")),
  details: z.string().min(1, "Los datos del método de pago son obligatorios"),
});
