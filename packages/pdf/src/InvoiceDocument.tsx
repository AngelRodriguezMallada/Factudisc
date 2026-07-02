import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { DocumentPdfData } from "./types";

const COLORS = {
  ink: "#1e293b",
  muted: "#64748b",
  accent: "#2563eb",
  border: "#e2e8f0",
  tableHead: "#f1f5f9",
  totalBg: "#0f172a",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: COLORS.ink,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  logo: {
    width: 90,
    height: 90,
    objectFit: "contain",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 2,
  },
  muted: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 1.4,
  },
  docTitleBlock: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.accent,
    letterSpacing: 1,
  },
  docNumber: {
    fontSize: 11,
    color: COLORS.ink,
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    backgroundColor: COLORS.tableHead,
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.ink,
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  partyBlock: {
    width: "48%",
  },
  partyLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 2,
  },
  datesBlock: {
    width: "48%",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dateLabel: {
    color: COLORS.muted,
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
  },
  tableHeadRow: {
    flexDirection: "row",
    backgroundColor: COLORS.tableHead,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  colDesc: { width: "46%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "16%", textAlign: "right" },
  colTax: { width: "12%", textAlign: "right" },
  colTotal: { width: "14%", textAlign: "right" },
  headCell: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: "uppercase",
  },
  totalsWrap: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsBox: {
    width: "45%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsLabel: {
    color: COLORS.muted,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.totalBg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginTop: 6,
  },
  grandTotalLabel: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
  },
  grandTotalValue: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
  },
  notesBlock: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: COLORS.muted,
  },
});

function formatCurrency(value: number): string {
  return `${value.toFixed(2)} €`;
}

function formatDate(date?: Date | null): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
  PAID: "Pagada",
  EXPIRED: "Caducado",
};

const TITLE: Record<string, string> = {
  INVOICE: "FACTURA",
  QUOTE: "PRESUPUESTO",
};

export function InvoiceDocument({ data }: { data: DocumentPdfData }) {
  const { company, client, lines } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {company.logoUrl ? <Image src={company.logoUrl} style={styles.logo} /> : null}
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.muted}>{company.taxId ? `NIF/CIF: ${company.taxId}` : ""}</Text>
            <Text style={styles.muted}>{company.address || ""}</Text>
            <Text style={styles.muted}>
              {[company.email, company.phone].filter(Boolean).join("  ·  ")}
            </Text>
          </View>
          <View style={styles.docTitleBlock}>
            <Text style={styles.docTitle}>{TITLE[data.type]}</Text>
            <Text style={styles.docNumber}>{data.number}</Text>
            <Text style={styles.statusBadge}>{STATUS_LABEL[data.status] || data.status}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Cliente</Text>
            <Text style={styles.partyName}>{client.name}</Text>
            {client.taxId ? <Text style={styles.muted}>NIF/CIF: {client.taxId}</Text> : null}
            {client.address ? <Text style={styles.muted}>{client.address}</Text> : null}
            {(client.email || client.phone) ? (
              <Text style={styles.muted}>
                {[client.email, client.phone].filter(Boolean).join("  ·  ")}
              </Text>
            ) : null}
          </View>
          <View style={styles.datesBlock}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Fecha de emisión</Text>
              <Text>{formatDate(data.issueDate)}</Text>
            </View>
            {data.dueDate ? (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  {data.type === "INVOICE" ? "Fecha de vencimiento" : "Válido hasta"}
                </Text>
                <Text>{formatDate(data.dueDate)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeadRow}>
            <Text style={[styles.colDesc, styles.headCell]}>Descripción</Text>
            <Text style={[styles.colQty, styles.headCell]}>Cant.</Text>
            <Text style={[styles.colPrice, styles.headCell]}>Precio</Text>
            <Text style={[styles.colTax, styles.headCell]}>IVA</Text>
            <Text style={[styles.colTotal, styles.headCell]}>Total</Text>
          </View>
          {lines.map((line, idx) => (
            <View
              key={idx}
              style={idx === lines.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}
            >
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(line.unitPrice)}</Text>
              <Text style={styles.colTax}>{line.taxRate}%</Text>
              <Text style={styles.colTotal}>{formatCurrency(line.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>{formatCurrency(data.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>IVA</Text>
              <Text>{formatCurrency(data.taxAmount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
            </View>
          </View>
        </View>

        {data.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesTitle}>Notas</Text>
            <Text style={styles.muted}>{data.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {company.name}
            {company.iban ? `  ·  IBAN: ${company.iban}` : ""}
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
