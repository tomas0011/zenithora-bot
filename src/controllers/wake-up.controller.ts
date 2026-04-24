/**
 * Controlador de Wake-Up
 * Levanta el servicio para prevent sleep en Render
 */

import type { Request, Response } from 'express';
import type { ApiResponse } from '../models/types.js';
import { Logger } from '../services/logger.service.js';

interface WakeUpResponse {
  timestamp: string;
}

export class WakeUpController {
  /**
   * GET /wake-up
   * Levanta el servicio
   */
  static index(req: Request, res: Response): void {
    Logger.info('HTTP', `GET ${req.path}`);

    const response: ApiResponse<WakeUpResponse> = {
      success: true,
      message: 'Service is now awake',
      data: {
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);
  }
}

export default WakeUpController;