/**
 * Controlador de Comandos
 * Procesa comandos tipo / de Discord
 */

import type { Request, Response } from 'express';
import type { ApiResponse, PollMessage, PollOption } from '../models/types.js';
import { PollService } from '../services/poll.service.js';
import { MessageService } from '../services/message.service.js';
import { ConfigService } from '../services/config.service.js';
import { Logger } from '../services/logger.service.js';
import { getMessageLink } from '../utils/message-link.js';

interface CommandRequest {
  command: string;
  params: CommandParams;
}

interface CommandParams {
  question?: string;
  options?: PollOption[];
  channel_id?: string;
  channelId?: string;
  duration?: number;
  allow_multiple?: boolean;
  content?: string;
}

export class CommandsController {
  /**
   * POST /commands
   * Procesa comandos tipo /
   */
  static async execute(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const body = req.body as CommandRequest;
    const { command, params } = body;
    
    Logger.info('HTTP', `POST ${req.path}`);

    try {
      if (!command) {
        Logger.warn('HTTP', `POST ${req.path} [VALIDACIÓN]`, { error: 'command requerido' });

        const response: ApiResponse = {
          success: false,
          error: 'command es requerido'
        };
        res.status(400).json(response);
        return;
      }

      let result: unknown;
      const cmd = command.toLowerCase();

      Logger.debug('HTTP', `Ejecutando comando: ${cmd}`, params);

      switch (cmd) {
        case 'aventure':
        case 'aventura': {
          const channelId =
            params.channel_id ||
            params.channelId ||
            ConfigService.getChannel('votaciones');
          
          result = await PollService.publish(channelId, {
            question: params.question || '🎲 ¿Qué aventura jugamos?',
            options: params.options || [],
            duration: params.duration || 72,
            allow_multiple: params.allow_multiple ?? true
          });
          break;
        }

        case 'partida':
        case 'partidas': {
          const channelId =
            params.channel_id ||
            params.channelId ||
            ConfigService.getChannel('votaciones');
          
          result = await PollService.publish(channelId, {
            question: params.question || '🗓️ ¿Cuándo jugamos?',
            options: params.options || [],
            duration: params.duration || 72,
            allow_multiple: params.allow_multiple ?? true
          });
          break;
        }

        case 'poll': {
          const pollChannelId = params.channel_id || params.channelId;
          if (!pollChannelId) {
            Logger.warn('HTTP', `POST ${req.path} [VALIDACIÓN]`, { error: 'channel_id requerido para poll' });

            const response: ApiResponse = {
              success: false,
              error: 'channel_id es requerido para poll'
            };
            res.status(400).json(response);
            return;
          }

          result = await PollService.publish(
            pollChannelId,
            {
              question: params.question,
              options: params.options || [],
              duration: params.duration || 24,
              allow_multiple: params.allow_multiple ?? false
            }
          );
          break;
        }

        case 'aviso':
        case 'anuncio': {
          const channelId =
            params.channel_id ||
            params.channelId ||
            ConfigService.getChannel('general');
          
          result = await MessageService.sendAdvice(
            channelId,
            params.content || ''
          );
          break;
        }

        case 'mensaje':
        case 'message': {
          const msgChannelId = params.channel_id || params.channelId;
          if (!msgChannelId) {
            Logger.warn('HTTP', `POST ${req.path} [VALIDACIÓN]`, { error: 'channel_id requerido para mensaje' });

            const response: ApiResponse = {
              success: false,
              error: 'channel_id es requerido para mensaje'
            };
            res.status(400).json(response);
            return;
          }

          result = await MessageService.send(
            msgChannelId,
            params.content || ''
          );
          break;
        }

        default: {
          const duration = Date.now() - startTime;
          Logger.warn('HTTP', `POST ${req.path} [COMANDO DESCONOCIDO]`, { command });

          const response: ApiResponse = {
            success: false,
            error: `Comando desconocido: ${command}. Usa: aventure, partida, poll, aviso, mensaje`
          };
          res.status(400).json(response);
          return;
        }
      }

      const message = result as PollMessage;
      const duration = Date.now() - startTime;
      
      Logger.http('POST', req.path, 201, duration);
      Logger.command(cmd, params.channel_id || params.channelId || '', undefined, true, params as unknown as Record<string, unknown>);

      const response: ApiResponse = {
        success: true,
        message: `Comando ${command} ejecutado`,
        data: {
          result_link: getMessageLink(message),
          command
        }
      };

      res.status(201).json(response);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      Logger.error('HTTP', `POST ${req.path} [ERROR]`, errorMessage);
      Logger.command(command || '', params?.channel_id || params?.channelId || '', undefined, false, { error: errorMessage });
      
      const response: ApiResponse = {
        success: false,
        error: errorMessage
      };

      res.status(500).json(response);
    }
  }
}

export default CommandsController;