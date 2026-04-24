/**
 * Servicio de Mensajes
 * Lógica para enviar mensajes a Discord
 */

import { DiscordService } from './discord.service.js';

export class MessageService {
  /**
   * Envía un mensaje simple a un canal
   */
  static async send(
    channelId: string,
    content: string
  ): Promise<unknown> {
    return DiscordService.sendMessage(channelId, content);
  }

  /**
   * Envía un aviso con @everyone
   */
  static async sendAdvice(
    channelId: string,
    content: string
  ): Promise<unknown> {
    // Agregar mention a todos si no está ya en el mensaje
    let fullContent = content;
    if (!content.includes('@everyone') && !content.includes('<@')) {
      fullContent = `@everyone ${content}`;
    }

    return DiscordService.sendMessage(channelId, fullContent);
  }
}

export default MessageService;