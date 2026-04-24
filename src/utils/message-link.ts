/**
 * Utilidad para generar links de mensajes de Discord
 */

import type { PollMessage } from '../models/types.js';

/**
 * Genera el link a un mensaje de Discord
 */
export function getMessageLink(message: PollMessage): string {
  const guildId = message.guild_id;
  const channelId = message.channel_id;
  const messageId = message.id;

  if (guildId) {
    return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
  }

  return `https://discord.com/channels/@me/${channelId}/${messageId}`;
}

export default getMessageLink;