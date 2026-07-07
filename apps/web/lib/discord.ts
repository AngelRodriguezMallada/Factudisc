const DISCORD_API = "https://discord.com/api";

export function getDiscordOAuthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Faltan variables de OAuth de Discord: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET y DISCORD_OAUTH_REDIRECT_URI."
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildAuthorizeUrl(state: string): string {
  const { clientId, redirectUri } = getDiscordOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
    prompt: "consent",
  });
  return `${DISCORD_API}/oauth2/authorize?${params.toString()}`;
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
}

export async function exchangeCodeForUser(code: string): Promise<DiscordUser> {
  const { clientId, clientSecret, redirectUri } = getDiscordOAuthConfig();

  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Discord token exchange falló (${tokenRes.status}).`);
  }
  const token = (await tokenRes.json()) as { access_token: string; token_type: string };

  const userRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `${token.token_type} ${token.access_token}` },
  });
  if (!userRes.ok) {
    throw new Error(`No se pudo obtener el usuario de Discord (${userRes.status}).`);
  }
  return (await userRes.json()) as DiscordUser;
}
