export interface LineInput {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface LineComputed extends LineInput {
  lineTotal: number;
}

export interface DocumentTotals {
  lines: LineComputed[];
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function computeTotals(lines: LineInput[]): DocumentTotals {
  const computedLines = lines.map((line) => {
    const base = round2(line.quantity * line.unitPrice);
    return { ...line, lineTotal: base };
  });

  const subtotal = round2(computedLines.reduce((sum, l) => sum + l.lineTotal, 0));
  const taxAmount = round2(
    computedLines.reduce((sum, l) => sum + l.lineTotal * (l.taxRate / 100), 0)
  );
  const total = round2(subtotal + taxAmount);

  return { lines: computedLines, subtotal, taxAmount, total };
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}
