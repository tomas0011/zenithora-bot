/**
 * Servicio de Poll
 * Lógica para crear y publicar encuestas en Discord
 */

import type { PollOption, DiscordPoll, DiscordEmoji } from '../models/types.js';
import { DiscordService } from './discord.service.js';
import { DateService } from './date.service.js';

export class PollService {
  /**
   * Construye el objeto emoji para Discord
   */
  static buildEmoji(emojiStr: string | undefined): DiscordEmoji | null {
    if (!emojiStr) {
      return null;
    }

    // Custom emoji: <emoji_name:emoji_id> o <a:emoji_name:emoji_id>
    const match = emojiStr.match(/<a?:(\w+):(\d+)>/);
    if (match) {
      return {
        id: match[1],
        name: match[2],
        animated: emojiStr.startsWith('<a:')
      };
    }

    return { name: emojiStr };
  }

  /**
   * Construye las respuestas de una poll
   */
  static buildAnswers(
    options: PollOption[],
    saturday: Date | null,
    sunday: Date | null
  ): { poll_media: { text: string; emoji?: DiscordEmoji } }[] {
    return options.map((option) => {
      let label = option.label || '';

      // Reemplazar placeholders de fecha
      if (saturday || sunday) {
        label = DateService.replaceDatePlaceholders(label, saturday, sunday);
      }

      const pollMedia: { text: string; emoji?: DiscordEmoji } = { text: label };

      // Agregar emoji si existe
      const emoji = this.buildEmoji(option.emoji);
      if (emoji) {
        pollMedia.emoji = emoji;
      }

      return { poll_media: pollMedia };
    });
  }

  /**
   * Crea el objeto poll para Discord
   */
  static createPollObject(
    pollData: {
      question?: string;
      options?: PollOption[];
      duration?: number;
      allow_multiple_answers?: boolean;
      allow_multiple?: boolean;
    },
    saturday: Date | null,
    sunday: Date | null
  ): DiscordPoll {
    const options = pollData.options || [];
    const questionText = pollData.question || '📊 Encuesta';

    // Reemplazar placeholders en la pregunta
    let finalQuestion = questionText;
    if (saturday || sunday) {
      finalQuestion = DateService.replaceDatePlaceholders(
        questionText,
        saturday,
        sunday
      );
    }

    return {
      question: { text: finalQuestion },
      answers: this.buildAnswers(options, saturday, sunday),
      duration: pollData.duration || 24,
      allow_multiselect:
        pollData.allow_multiple_answers ||
        pollData.allow_multiple ||
        false,
      layout_type: 1
    };
  }

  /**
   * Publica una encuesta en un canal
   */
  static async publish(
    channelId: string,
    pollData: {
      question?: string;
      options?: PollOption[];
      duration?: number;
      allow_multiple_answers?: boolean;
      allow_multiple?: boolean;
    }
  ): Promise<unknown> {
    // Detectar y calcular fechas
    const options = pollData.options || [];
    const { saturday, sunday } = DateService.detectDatePlaceholders(options);

    // Crear poll
    const pollObj = this.createPollObject(pollData, saturday, sunday);

    // Publicar en Discord
    return DiscordService.publishPoll(channelId, pollObj);
  }
}

export default PollService;