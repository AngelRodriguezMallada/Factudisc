import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/discord";

export async function GET() {
  const state = randomBytes(16).toString("hex");

  cookies().set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
