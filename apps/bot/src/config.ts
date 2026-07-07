import path from "node:path";
import dotenv from "dotenv";

// El proceso se ejecuta con distintos cwd según cómo se invoque (npm -w cambia el cwd
// al del workspace), así que cargamos el .env de la raíz del monorepo explícitamente.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env.`);
  }
  return value;
}

export const config = {
  discordToken: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildId: process.env.DISCORD_GUILD_ID || undefined,
  // El super-admin crea cuentas y da acceso. Compatibilidad con OWNER_DISCORD_ID.
  superAdminDiscordId: process.env.SUPER_ADMIN_DISCORD_ID || required("OWNER_DISCORD_ID"),
};
