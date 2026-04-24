/**
 * Controlador de Canales
 * Obtiene los canales mapeados
 */

import type { Request, Response } from 'express';
import type { ApiResponse, ChannelMap } from '../models/types.js';
import { ConfigService } from '../services/config.service.js';
import { Logger } from '../services/logger.service.js';

export class ChannelsController {
  /**
   * GET /channels
   * Obtiene todos los canales mapeados
   */
  static getAll(req: Request, res: Response): void {
    Logger.info('HTTP', `GET ${req.path}`);

    const channels = ConfigService.getAllChannels();

    const response: ApiResponse<ChannelMap> = {
      success: true,
      message: 'Canales mapeados disponibles',
      data: channels
    };

    res.json(response);
  }
}

export default ChannelsController;