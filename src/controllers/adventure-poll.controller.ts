/**
 * Controlador de Poll de Aventuras
 * Crea encuestas para votar aventuras
 */

import type { Request, Response } from 'express';
import type { ApiResponse, PollOption, PollMessage } from '../models/types.js';
import { PollService } from '../services/poll.service.js';
import { ConfigService } from '../services/config.service.js';
import { Logger } from '../services/logger.service.js';
import { getMessageLink } from '../utils/message-link.js';

interface AdventureRequest {
  question?: string;
  options?: PollOption[];
  aventuras?: PollOption[];
  channel_id?: string;
  channelId?: string;
  duration?: number;
  allow_multiple?: boolean;
  allow_multiple_answers?: boolean;
}

export class AdventurePollController {
  /**
   * POST /poll/adventure
   * Crea una poll de aventuras
   */
  static async create(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const body = req.body as AdventureRequest;
    
    Logger.info('HTTP', `POST ${req.path}`);

    try {
      // Determinar opciones (soporta "aventuras" como en el script original)
      const options = body.aventuras || body.options || [];

      // Determinar canal (usa votaciones por defecto)
      const channelId =
        body.channel_id ||
        body.channelId ||
        ConfigService.getChannel('votaciones');

      // Determinar pregunta
      const question = body.question || '🎲 ¿Qué aventura jugamos?';

      Logger.debug('HTTP', 'Creando poll de aventura', { channelId, question, options: options.length });

      // Crear poll
      const message = await PollService.publish(channelId, {
        question,
        options,
        duration: body.duration || 72,
        allow_multiple: body.allow_multiple ?? body.allow_multiple_answers ?? true
      }) as PollMessage;

      const duration = Date.now() - startTime;
      Logger.http('POST', req.path, 201, duration, { channelId });
      Logger.command('aventure', channelId, undefined, true, { question, options: options.length });

      const response: ApiResponse = {
        success: true,
        message: 'Poll de aventura creada',
        data: {
          poll_message: getMessageLink(message),
          channel_id: channelId
        }
      };

      res.status(201).json(response);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      Logger.error('HTTP', `POST ${req.path} [ERROR]`, errorMessage);
      Logger.command('aventure', body.channel_id || body.channelId || '', undefined, false, { error: errorMessage });
      
      const response: ApiResponse = {
        success: false,
        error: errorMessage
      };

      res.status(500).json(response);
    }
  }
}

export default AdventurePollController;