import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  userId?: number;
  username?: string;
}

export const sessionOptions: SessionOptions = {
  cookieName: "facturadiscord_session",
  password: process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me-32chars",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export async function getSession() {
  const cookieStore = cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
