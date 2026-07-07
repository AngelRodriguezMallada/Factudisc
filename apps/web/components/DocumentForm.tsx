"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { computeTotals, formatCurrency, type LineInput } from "@/lib/money";
import { DOCUMENT_STATUSES } from "./StatusBadge";

interface ClientOption {
  id: number;
  name: string;
}

interface DocumentFormInitialValues {
  id?: number;
  clientId?: number;
  status?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  lines?: LineInput[];
}

interface DocumentFormProps {
  documentType: "INVOICE" | "QUOTE";
  clients: ClientOption[];
  defaultTaxRate: number;
  initialValues?: DocumentFormInitialValues;
}

function emptyLine(defaultTaxRate: number): LineInput {
  return { description: "", quantity: 1, unitPrice: 0, taxRate: defaultTaxRate };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function DocumentForm({ documentType, clients, defaultTaxRate, initialValues }: DocumentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);

  const [clientId, setClientId] = useState<number | "">(initialValues?.clientId ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "DRAFT");
  const [issueDate, setIssueDate] = useState(initialValues?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [lines, setLines] = useState<LineInput[]>(
    initialValues?.lines && initialValues.lines.length > 0 ? initialValues.lines : [emptyLine(defaultTaxRate)]
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  function updateLine(index: number, patch: Partial<LineInput>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(defaultTaxRate)]);
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Selecciona un cliente.");
      return;
    }

    const payload = {
      type: documentType,
      clientId,
      status,
      issueDate,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
      lines,
    };

    setSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/documents/${initialValues!.id}` : "/api/documents", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No se pudo guardar el documento.");
        setSubmitting(false);
        return;
      }
      router.push(`/documentos/${json.id}`);
      router.refresh();
    } catch {
      setError("Error de red al guardar.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="clientId">Cliente</label>
            <select
              id="clientId"
              className="input"
              value={clientId}
              onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Estado</label>
            <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {DOCUMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="issueDate">Fecha de emisión</label>
            <input id="issueDate" type="date" className="input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="dueDate">
              {documentType === "INVOICE" ? "Fecha de vencimiento" : "Válido hasta"}
            </label>
            <input id="dueDate" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="notes">Notas</label>
          <textarea id="notes" className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-ink">Líneas</h2>
          <button type="button" onClick={addLine} className="btn-secondary text-sm">
            + Añadir línea
          </button>
        </div>
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
              <input
                className="input col-span-5"
                placeholder="Descripción"
                value={line.description}
                onChange={(e) => updateLine(idx, { description: e.target.value })}
                required
              />
              <input
                className="input col-span-2"
                type="number"
                min={0}
                step="0.0001"
                placeholder="Cant."
                value={line.quantity}
                onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                required
              />
              <input
                className="input col-span-2"
                type="number"
                min={0}
                step="0.0001"
                placeholder="Precio"
                value={line.unitPrice}
                onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value) })}
                required
              />
              <input
                className="input col-span-2"
                type="number"
                min={0}
                max={100}
                step="0.01"
                placeholder="IVA %"
                value={line.taxRate}
                onChange={(e) => updateLine(idx, { taxRate: Number(e.target.value) })}
                required
              />
              <button
                type="button"
                onClick={() => removeLine(idx)}
                className="col-span-1 text-red-500 hover:text-red-700 text-sm py-2"
                disabled={lines.length === 1}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>IVA</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-ink pt-1 border-t border-slate-200">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-3">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : `Crear ${documentType === "INVOICE" ? "factura" : "presupuesto"}`}
        </button>
      </div>
    </form>
  );
}
