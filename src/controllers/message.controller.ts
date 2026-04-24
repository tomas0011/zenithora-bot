/**
 * Controlador de Mensaje Directo
 * Envía mensajes directos a canales
 */

import type { Request, Response } from 'express';
import type { ApiResponse, PollMessage } from '../models/types.js';
import { MessageService } from '../services/message.service.js';
import { Logger } from '../services/logger.service.js';
import { getMessageLink } from '../utils/message-link.js';

interface MessageRequest {
  content: string;
  channel_id?: string;
  channelId?: string;
}

export class MessageController {
  /**
   * POST /message
   * Envía un mensaje directo
   */
  static async send(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const body = req.body as MessageRequest;
    
    Logger.info('HTTP', `POST ${req.path}`);

    try {
      // Validar contenido
      if (!body.content) {
        Logger.warn('HTTP', `POST ${req.path} [VALIDACIÓN]`, { error: 'content requerido' });

        const response: ApiResponse = {
          success: false,
          error: 'content es requerido'
        };
        res.status(400).json(response);
        return;
      }

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

      Logger.debug('HTTP', 'Enviando mensaje', { channelId, content: body.content.substring(0, 50) });

      // Enviar mensaje
      const message = await MessageService.send(channelId, body.content) as PollMessage;

      const duration = Date.now() - startTime;
      Logger.http('POST', req.path, 201, duration, { channelId });
      Logger.command('mensaje', channelId, undefined, true, { content: body.content.substring(0, 50) });

      const response: ApiResponse = {
        success: true,
        message: 'Mensaje enviado',
        data: {
          message_link: getMessageLink(message),
          channel_id: channelId
        }
      };

      res.status(201).json(response);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      Logger.error('HTTP', `POST ${req.path} [ERROR]`, errorMessage);
      Logger.command('mensaje', body.channel_id || body.channelId || '', undefined, false, { error: errorMessage });
      
      const response: ApiResponse = {
        success: false,
        error: errorMessage
      };

      res.status(500).json(response);
    }
  }
}

export default MessageController;