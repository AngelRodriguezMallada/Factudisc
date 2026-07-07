import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  userId?: number;
  username?: string;
  discordId?: string;
  /** Cuenta activa del usuario en esta sesión. */
  accountId?: number;
}

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me-32chars";

// Se resuelve en cada petición (no al importar el módulo) para no romper el build
// cuando SESSION_SECRET aún no está definida en el entorno de compilación.
function resolveSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET debe estar definida y tener al menos 32 caracteres en producción."
    );
  }
  return DEV_FALLBACK_SECRET;
}

export function getSessionOptions(): SessionOptions {
  return {
    cookieName: "facturadiscord_session",
    password: resolveSecret(),
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  };
}

export async function getSession() {
  const cookieStore = cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}
