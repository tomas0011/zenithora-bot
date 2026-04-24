/**
 * Servicio de Discord API
 * Módulo reutilizable para interactuar con la API de Discord
 */

import type { DiscordEmoji, DiscordPoll, PollMessage } from '../models/types.js';

const DISCORD_API = 'https://discord.com/api/v10';

export class DiscordService {
  private static getToken(): string {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN no configurado');
    }
    return token;
  }

  /**
   * Hace una petición a la API de Discord
   */
  static async request<T = unknown>(
    method: string,
    url: string,
    data?: unknown
  ): Promise<T> {
    const token = this.getToken();

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ZenitoraBot-API/1.0'
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
   * Envía un mensaje a un canal de Discord
   */
  static async sendMessage(channelId: string, content: string): Promise<PollMessage> {
    const url = `${DISCORD_API}/channels/${channelId}/messages`;
    return this.request<PollMessage>('POST', url, { content });
  }

  /**
   * Publica una encuesta en un canal de Discord
   */
  static async publishPoll(channelId: string, poll: DiscordPoll): Promise<PollMessage> {
    const url = `${DISCORD_API}/channels/${channelId}/messages`;
    return this.request<PollMessage>('POST', url, { poll });
  }

  /**
   * Obtiene información de un canal
   */
  static async getChannel(channelId: string): Promise<unknown> {
    const url = `${DISCORD_API}/channels/${channelId}`;
    return this.request('GET', url);
  }

  /**
   * Obtiene lista de canales del servidor
   */
  static async getGuildChannels(guildId: string): Promise<unknown> {
    const url = `${DISCORD_API}/guilds/${guildId}/channels`;
    return this.request('GET', url);
  }
}

export default DiscordService;