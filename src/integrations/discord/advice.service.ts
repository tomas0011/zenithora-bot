/**
 * Servicio de Advice
 * Proporciona consejos aleatorios a los usuarios
 */

import { Logger } from '../../services/logger.service.js';

// Lista de consejos aleatorios
const ADVICE_QUOTES = [
  "🎭 Recuerda: ¡El éxito es ir de fracaso en fracaso sin perder el entusiasmo!",
  "💡 Consejo del día: El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es hoy.",
  "🚀 No esperes tener todo listo para empezar. ¡Empieza y listo!",
  "⚔️ Mitos de DnD: Los PNJs siempre saben lo que está pasando. La verdad: dependen de ti.",
  "🎲 Consejo rolero: Si los dados están en tu contra, recuerda que el drama viene del fracaso.",
  "🌟 Remember: No es el tamaño del dado, es cómo lo tiras.",
  "✨ Lo que no te mata te hace más fuerte. Y si te mata, bueno, eso es cosa del dungeon master.",
  "🎯 En la duda, ataca. O huye. O negocia. Las tres son válidas.",
  "💪 El poder no viene del nivel, viene de saber usar lo que tienes."
];

/**
 * Servicio de Advice
 * Proporciona consejos aleatorios para el comando /zb advice
 */
export class AdviceService {
  /**
   * Obtiene un consejo aleatorio
   * @param username - Nombre del usuario (para personalización opcional)
   */
  static async getRandomAdvice(username?: string): Promise<string> {
    // Seleccionar consejo aleatorio
    const randomIndex = Math.floor(Math.random() * ADVICE_QUOTES.length);
    const advice = ADVICE_QUOTES[randomIndex];

    Logger.debug('ADVICE', 'Consejo seleccionado', {
      username,
      index: randomIndex
    });

    // Personalizar mensaje con nombre de usuario si está disponible
    if (username && username !== 'unknown') {
      return `${advice}`;
    }

    return advice;
  }
}

export default AdviceService;