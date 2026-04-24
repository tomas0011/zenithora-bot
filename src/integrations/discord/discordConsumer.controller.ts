/**
 * Controlador de Consumidor de Discord
 * Maneja las interacciones recibidas de Discord y las procesa internamente
 */

import type { Request, Response } from 'express';
import { Logger } from '../../services/logger.service.js';
import type { ApiResponse } from '../../models/types.js';
import { AdviceService } from './advice.service.js';

/**
 * Interfaz para solicitud de advice desde Discord
 */
interface DiscordAdviceRequest {
  userId: string;
  username: string;
  channelId?: string;
}

/**
 * Interfaz para respuesta de advice
 */
interface AdviceResponse {
  message: string;
}

/**
 * POST /integrations/discord/consume/advice
 * Consumidor para el comando /zb advice
 */
export async function consumeAdvice(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();
  const body = req.body as DiscordAdviceRequest;

  try {
    Logger.info('HTTP', `POST ${req.path}`);
    Logger.debug('HTTP', 'Procesando solicitud de advice', {
      userId: body.userId,
      username: body.username
    });

    // Validar entrada (usardefaults si no vienen)
    const userId = body.userId || 'unknown';
    const username = body.username || 'Usuario';

    // Obtener advice del servicio
    const message = await AdviceService.getRandomAdvice(username);

    const duration = Date.now() - startTime;
    Logger.http('POST', req.path, 200, duration, { userId, username });
    Logger.command('zb advice', body.channelId || 'DM', userId, true);

    const response: ApiResponse<AdviceResponse> = {
      success: true,
      data: {
        message
      }
    };

    res.status(200).json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    Logger.error('HTTP', `POST ${req.path} [ERROR]`, errorMessage);
    Logger.command('zb advice', body.channelId || '', body.userId, false, { error: errorMessage });

    // En caso de error, devolver mensaje seguro
    const response: ApiResponse<AdviceResponse> = {
      success: false,
      error: errorMessage,
      data: {
        message: '⚠️ No pude generar un consejo. Pero remember: ¡tú puedes!'
      }
    };

    res.status(500).json(response);
  }
}

export default { consumeAdvice };