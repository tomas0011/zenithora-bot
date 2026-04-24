/**
 * Cliente de Discord Bot
 * Inicializa y configura el bot de Discord para escuchar interacciones
 * 
 * NOTA: Para Production, habilitar Gateway Privileged Intents en Discord Developer Portal:
 * - Discord Developer Portal → Your App → Bot → Privileged Intents
 * - Enable: MESSAGE CONTENT INTENT (si necesitas leer mensajes)
 * 
 * Para solo slash commands, Guilds es suficiente.
 */

import { Client, GatewayIntentBits, type Interaction } from 'discord.js';
import { Logger } from '../../services/logger.service.js';

let client: Client | null = null;
let isReady = false;

/**
 * Inicializa el cliente de Discord
 */
export function initializeDiscordClient(): Client {
  if (client && isReady) {
    Logger.debug('SYSTEM', 'Cliente de Discord ya inicializado');
    return client;
  }

  // Intents mínimos para recibir slash commands
  // MessageContent solo es necesario si necesitas leer mensajes(del contenido)
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds
    ]
  });

  // Evento: Bot conectado
  client.once('ready', async () => {
    if (!client) return;
    
    isReady = true;
    Logger.info('SYSTEM', `🤖 Bot conectado: ${client.user?.tag}`);
    Logger.info('SYSTEM', `📢 Servidores: ${client.guilds.cache.size}`);
  });

  // Evento: Interacción recibida
  client.on('interactionCreate', async (interaction: Interaction) => {
    await handleInteraction(interaction);
  });

  return client;
}

/**
 * Inicia el cliente de Discord (se conecta al gateway)
 */
export async function startDiscordClient(): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error('DISCORD_BOT_TOKEN no configurado');
  }

  if (!client) {
    initializeDiscordClient();
  }

  await client?.login(token);
  Logger.info('SYSTEM', 'Bot de Discord iniciado');
}

/**
 * Maneja una interacción de Discord
 */
async function handleInteraction(interaction: Interaction): Promise<void> {
  // Solo procesar comandos de chat input (slash commands)
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commandName = interaction.commandName;
  const subcommand = interaction.options.getSubcommand(false);

  Logger.info('SYSTEM', `Comando recibido: /${commandName} ${subcommand || ''}`, {
    userId: interaction.user.id,
    channelId: interaction.channelId
  });

  // Manejar comando /zb
  if (commandName === 'zb') {
    if (subcommand === 'advice') {
      await handleAdviceCommand(interaction);
    }
    return;
  }

  Logger.warn('SYSTEM', `Comando no reconocido: /${commandName}`);
}

/**
 * Maneja el comando /zb advice
 */
async function handleAdviceCommand(interaction: any): Promise<void> {
  try {
    // Diferir la respuesta inmediatamente (obligatorio para Discord)
    await interaction.deferReply();

    // Obtener detalles del usuario
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const channelId = interaction.channelId;

    // Llamar al endpoint interno del consumidor
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    const consumerUrl = `${apiUrl}/integrations/discord/consume/advice`;

    Logger.debug('SYSTEM', 'Llamando consumidor interno', { userId, username, channelId });

    const response = await fetch(consumerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        username,
        channelId
      })
    });

    const result = await response.json() as { 
      success?: boolean;
      data?: { message?: string };
      message?: string;
    };

    if (!response.ok) {
      Logger.error('SYSTEM', 'Error en consumidor', result);
      await interaction.editReply({
        content: '❌ Hubo un error al procesar tu solicitud. Intenta más tarde.'
      });
      return;
    }

    // Extraer mensaje (puede venir en result.data.message o result.message)
    const adviceMessage = result.data?.message || result.message || '¡Aquí tienes un consejo!';

    // Responder con el mensaje
    await interaction.editReply({
      content: adviceMessage
    });

    Logger.info('SYSTEM', 'Respuesta enviada', { userId, username });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    Logger.error('SYSTEM', 'Error manejando comando', errorMessage);

    // Responder con mensaje seguro en caso de error
    try {
      await interaction.editReply({
        content: '⚠️ Error al procesar. Por favor intenta más tarde.'
      });
    } catch {
      // Ignorar errores al intentar responder
    }
  }
}

/**
 * Obtiene el cliente de Discord (si está inicializado)
 */
export function getDiscordClient(): Client | null {
  return client;
}

/**
 * Verifica si el bot está conectado
 */
export function isDiscordReady(): boolean {
  return isReady && client !== null;
}

export default {
  initializeDiscordClient,
  startDiscordClient,
  getDiscordClient,
  isDiscordReady
};