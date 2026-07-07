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
import {
  isSuperAdmin,
  getAccountIdForGuild,
  getMembershipForDiscordUser,
  getOwnedAccounts,
} from "./permissions";
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

type Resolution = { accountId: number } | { error: string };

/** Resuelve la cuenta y comprueba permisos según el scope del comando. */
async function resolveAccount(
  userId: string,
  guildId: string | null,
  command: Command
): Promise<Resolution> {
  if (command.scope === "superadmin") {
    if (!isSuperAdmin(userId)) return { error: "Solo el super-admin puede usar este comando." };
    return { accountId: 0 };
  }

  if (command.scope === "ownerSelf") {
    const owned = await getOwnedAccounts(userId);
    if (owned.length === 0) {
      return {
        error: "No eres owner de ninguna cuenta. Pide acceso al administrador o entra en la web.",
      };
    }
    return { accountId: owned[0].accountId };
  }

  // account | accountOwner
  if (!guildId) return { error: "Usa este comando dentro de un servidor de Discord." };
  const accountId = await getAccountIdForGuild(guildId);
  if (accountId === null) {
    return { error: "Este servidor no está vinculado a ninguna cuenta. Un owner debe usar `/vincular`." };
  }
  const membership = await getMembershipForDiscordUser(userId, accountId);
  if (!membership) {
    return { error: "No tienes acceso a la cuenta de este servidor." };
  }
  if (command.scope === "accountOwner" && membership.role !== "OWNER") {
    return { error: "Solo el owner de la cuenta puede usar este comando." };
  }
  return { accountId };
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  const resolution = await resolveAccount(interaction.user.id, interaction.guildId, command);
  if ("error" in resolution) {
    await interaction.reply({ content: resolution.error, ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction, resolution.accountId);
  } catch (err) {
    console.error(`Error ejecutando /${interaction.commandName}:`, err);
    const message = err instanceof Error ? err.message : "Ha ocurrido un error al ejecutar el comando.";
    const payload = { content: message, ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: message }).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

async function handleAutocomplete(interaction: AutocompleteInteraction) {
  const command = commandMap.get(interaction.commandName);
  if (!command?.autocomplete) return;

  const resolution = await resolveAccount(interaction.user.id, interaction.guildId, command);
  if ("error" in resolution) {
    await interaction.respond([]).catch(() => {});
    return;
  }

  try {
    await command.autocomplete(interaction, resolution.accountId);
  } catch (err) {
    console.error(`Error en autocompletado de /${interaction.commandName}:`, err);
    await interaction.respond([]).catch(() => {});
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("Promesa rechazada sin manejar:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Excepción no capturada:", err);
});

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
