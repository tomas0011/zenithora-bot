/**
 * Controlador de Poll
 * Crea encuestas genéricas de Discord
 */

import type { Request, Response } from 'express';
import type { ApiResponse, PollOption, PollMessage } from '../models/types.js';
import { PollService } from '../services/poll.service.js';
import { Logger } from '../services/logger.service.js';
import { getMessageLink } from '../utils/message-link.js';

interface PollRequest {
  question?: string;
  options?: PollOption[];
  channel_id?: string;
  channelId?: string;
  duration?: number;
  allow_multiple?: boolean;
  allow_multiple_answers?: boolean;
}

export class PollController {
  /**
   * POST /poll
   * Crea una poll genérica
   */
  static async create(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const body = req.body as PollRequest;
    
    Logger.info('HTTP', `POST ${req.path}`);

    try {
      // Validar canal
      const channelId = body.channel_id || body.channelId;
      if (!channelId) {
        Logger.warn('HTTP', `POST ${req.path} [VALIDACIÓN]`, { error: 'channel_id requerido' });

        const response: ApiResponse = {
          success: false,
          error: 'channel_id es requerido'
        };
        res.status(400).json(response);
        return;
      }

      // Validar opciones
      const options = body.options || [];
      if (options.length === 0) {
        Logger.warn('HTTP', `POST ${req.path} [VALIDACIÓN]`, { error: 'options requerido' });

        const response: ApiResponse = {
          success: false,
          error: 'options es requerido'
        };
        res.status(400).json(response);
        return;
      }

      Logger.debug('HTTP', 'Creando poll genérica', { channelId, question: body.question, options: options.length });

      // Crear poll
      const message = await PollService.publish(channelId, {
        question: body.question || '📊 Encuesta',
        options,
        duration: body.duration || 24,
        allow_multiple: body.allow_multiple ?? body.allow_multiple_answers ?? false
      }) as PollMessage;

      const duration = Date.now() - startTime;
      Logger.http('POST', req.path, 201, duration, { channelId });
      Logger.command('poll', channelId, undefined, true, { question: body.question, options: options.length });

      const response: ApiResponse = {
        success: true,
        message: 'Poll creada',
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
      Logger.command('poll', body.channel_id || body.channelId || '', undefined, false, { error: errorMessage });
      
      const response: ApiResponse = {
        success: false,
        error: errorMessage
      };

      res.status(500).json(response);
    }
  }
}

export default PollController;