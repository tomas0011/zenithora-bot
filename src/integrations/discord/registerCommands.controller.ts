/**
 * Controlador de Registro de Comandos de Discord
 * Registra los comandos slash de la aplicación en Discord
 */

import type { Request, Response } from 'express';
import { Routes, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { Logger } from '../../services/logger.service.js';
import type { ApiResponse } from '../../models/types.js';

const DISCORD_API = 'https://discord.com/api/v10';

/**
 * Interfaz para respuesta de comandos
 */
interface CommandResponse {
  id: string;
  name: string;
  description: string;
}

/**
 * Obtiene el token de Discord
 */
function getDiscordToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error('DISCORD_BOT_TOKEN no configurado');
  }
  return token;
}

/**
 * Obtiene el client ID de Discord
 */
function getClientId(): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    throw new Error('DISCORD_CLIENT_ID no configurado');
  }
  return clientId;
}

/**
 * Realiza una petición a la API de Discord
 */
async function discordRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const token = getDiscordToken();

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ZenitoraBot/1.0'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  const content = await response.text();
  return content ? JSON.parse(content) : {} as T;
}

/**
 * Define los comandos a registrar
 */
function getCommands(): RESTPostAPIApplicationCommandsJSONBody[] {
  return [
    {
      name: 'zb',
      description: 'Comandos principales de Zenitora',
      options: [
        {
          name: 'advice',
          description: 'Recibe un consejo aleatorio',
          type: 1 // Subcommand
        }
      ]
    }
  ];
}

/**
 * POST /integrations/discord/register-commands
 * Registra los comandos slash en Discord
 */
export async function registerCommands(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();

  try {
    Logger.info('HTTP', `POST ${req.path}`);

    const clientId = getClientId();
    const commands = getCommands();

    // Construir URL para registrar comandos globales
    const url = `${DISCORD_API}/applications/${clientId}/commands`;

    Logger.debug('HTTP', 'Registrando comandos', {
      clientId,
      commands: commands.length
    });

    // Verificar comandos existentes (para idempotencia)
    const existingCommands = await discordRequest<CommandResponse[]>(
      'GET',
      url
    );

    // Buscar si ya existe el comando 'zb'
    const existingZb = existingCommands.find((c) => c.name === 'zb');

    if (existingZb) {
      Logger.info('HTTP', 'Comando /zb ya existe, eliminando para actualizar');

      // Eliminar comando existente
      await discordRequest(
        'DELETE',
        `${url}/${existingZb.id}`
      );
    }

    // Registrar nuevo comando (o actualizar)
    const registeredCommands: CommandResponse[] = [];

    for (const cmd of commands) {
      const result = await discordRequest<CommandResponse>(
        'POST',
        url,
        cmd
      );
      registeredCommands.push(result);
    }

    const duration = Date.now() - startTime;
    Logger.http('POST', req.path, 201, duration, { commands: registeredCommands.length });

    const response: ApiResponse = {
      success: true,
      message: 'Comandos registrados exitosamente',
      data: {
        commands: registeredCommands
      }
    };

    res.status(201).json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    Logger.error('HTTP', `POST ${req.path} [ERROR]`, errorMessage);

    const response: ApiResponse = {
      success: false,
      error: errorMessage
    };

    res.status(500).json(response);
  }
}

export default { registerCommands };