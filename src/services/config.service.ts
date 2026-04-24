/**
 * Servicio de Configuración
 * Maneja las variables de entorno y configuración
 */

import type { ChannelMap } from '../models/types.js';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

export class ConfigService {
  // Canales mapeados por defecto
  static readonly CHANNELS: ChannelMap = {
    general: process.env.GENERAL_CHANNEL || '1476347136525467811',
    votaciones: process.env.VOTACIONES_CHANNEL || '1476347664231829534',
    testing: process.env.TESTING_CHANNEL || '1497030359743856670'
  };

  /**
   * Obtiene el ID de un canal por nombre
   */
  static getChannel(channelName: string): string {
    return this.CHANNELS[channelName.toLowerCase()] || '';
  }

  /**
   * Obtiene todos los canales mapeados
   */
  static getAllChannels(): ChannelMap {
    return { ...this.CHANNELS };
  }

  /**
   * Verifica si el token está configurado
   */
  static hasToken(): boolean {
    return !!process.env.DISCORD_BOT_TOKEN;
  }

  /**
   * Obtiene el puerto del servidor
   */
  static getPort(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }
}

export default ConfigService;