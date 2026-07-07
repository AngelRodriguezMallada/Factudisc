import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma, getMembershipsForUser, pickDefaultAccountId } from "@facturadiscord/db";
import { exchangeCodeForUser } from "@/lib/discord";
import { getSession } from "@/lib/session";
import { isSuperAdminDiscordId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = cookies().get("oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=state", req.url));
  }
  cookies().delete("oauth_state");

  let discordUser;
  try {
    discordUser = await exchangeCodeForUser(code);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  const displayName = discordUser.global_name || discordUser.username;
  const user = await prisma.user.upsert({
    where: { discordId: discordUser.id },
    update: { username: displayName, avatar: discordUser.avatar ?? null },
    create: { discordId: discordUser.id, username: displayName, avatar: discordUser.avatar ?? null },
  });

  const memberships = await getMembershipsForUser(user.id);
  const defaultAccountId = pickDefaultAccountId(memberships);

  // Sin cuenta y sin ser super-admin => sin acceso.
  if (defaultAccountId === null && !isSuperAdminDiscordId(user.discordId)) {
    return NextResponse.redirect(new URL("/sin-acceso", req.url));
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.discordId = user.discordId;
  session.accountId = defaultAccountId ?? undefined;
  await session.save();

  // El super-admin sin cuenta propia va directo al panel de administración.
  const destination = defaultAccountId === null ? "/admin" : "/";
  return NextResponse.redirect(new URL(destination, req.url));
}
