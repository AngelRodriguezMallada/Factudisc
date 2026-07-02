const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
  PAID: "Pagada",
  EXPIRED: "Caducado",
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  PAID: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-amber-100 text-amber-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_STYLE[status] || "bg-slate-100 text-slate-600"}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export const DOCUMENT_STATUSES = Object.keys(STATUS_LABEL);
