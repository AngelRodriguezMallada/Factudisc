import { Client, Collection, Events, GatewayIntentBits, type ChatInputCommandInteraction } from "discord.js";
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
  if (!interaction.isChatInputCommand()) return;
  await handleCommand(interaction);
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

client.login(config.discordToken);
