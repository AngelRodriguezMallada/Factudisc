import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facturadiscord",
  description: "Facturas y presupuestos profesionales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
