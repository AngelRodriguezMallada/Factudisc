import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";

async function main() {
  const rest = new REST().setToken(config.discordToken);
  const body = commands.map((c) => c.data.toJSON());

  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);

  await rest.put(route, { body });

  console.log(
    `Registrados ${body.length} comandos ${
      config.guildId
        ? `en el servidor ${config.guildId} (disponibles al instante)`
        : "globalmente (pueden tardar hasta 1 hora en propagarse)"
    }.`
  );
}

main().catch((err) => {
  console.error("No se pudieron registrar los comandos:", err);
  process.exit(1);
});
