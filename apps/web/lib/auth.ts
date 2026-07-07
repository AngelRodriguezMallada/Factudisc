import { redirect } from "next/navigation";
import { getSession, type SessionData } from "./session";

/**
 * Garantiza que hay una sesión iniciada antes de ejecutar una Server Action.
 *
 * Los Server Actions de Next.js son endpoints POST invocables públicamente: el
 * guard de `(app)/layout.tsx` solo protege el renderizado de la página, no la
 * ejecución de la acción. Hay que comprobar la sesión explícitamente en cada una.
 */
export async function requireSession(): Promise<SessionData & { userId: number }> {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  return session as SessionData & { userId: number };
}
