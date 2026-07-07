import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { isOwner, isAllowed } from "./permissions";
import type { Command } from "./types";

const commandMap = new Collection<string, Command>();
for (const command of commands) {
  commandMap.set(command.data.name, command);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Bot conectado como ${c.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction);
    return;
  }
  if (interaction.isChatInputCommand()) {
    await handleCommand(interaction);
  }
});

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  if (command.ownerOnly && !isOwner(interaction.user.id)) {
    await interaction.reply({ content: "Solo el dueño del bot puede usar este comando.", ephemeral: true });
    return;
  }

  if (command.requiresAllowlist) {
    const allowed = await isAllowed(interaction.user.id);
    if (!allowed) {
      await interaction.reply({ content: "No tienes permiso para usar este bot.", ephemeral: true });
      return;
    }
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error ejecutando /${interaction.commandName}:`, err);
    const payload = { content: "Ha ocurrido un error al ejecutar el comando.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

async function handleAutocomplete(interaction: AutocompleteInteraction) {
  const command = commandMap.get(interaction.commandName);
  if (!command?.autocomplete) return;

  // No sugerimos nada a quien no tiene permiso, para no filtrar números de documentos.
  if (command.requiresAllowlist && !(await isAllowed(interaction.user.id))) {
    await interaction.respond([]).catch(() => {});
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (err) {
    console.error(`Error en autocompletado de /${interaction.commandName}:`, err);
    await interaction.respond([]).catch(() => {});
  }
}

// Errores no controlados: los registramos en vez de dejar que tumben el proceso
// (PM2 reiniciaría, pero perderíamos el contexto del fallo).
process.on("unhandledRejection", (reason) => {
  console.error("Promesa rechazada sin manejar:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Excepción no capturada:", err);
});

// Apagado ordenado para que PM2 pueda reiniciar/parar limpiamente.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`Recibida señal ${signal}, cerrando el bot...`);
    client.destroy();
    process.exit(0);
  });
}

client.login(config.discordToken).catch((err) => {
  console.error("No se pudo iniciar sesión en Discord:", err);
  process.exit(1);
});
