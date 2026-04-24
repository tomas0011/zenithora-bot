/**
 * Servicio de Fechas
 * Utilidades para manejar fechas y placeholders
 */

import type { DatePlaceholders } from '../models/types.js';

export class DateService {
  /**
   * Obtiene la fecha del próximo día de la semana
   * @param targetWeekday 0 = Lunes, 6 = Domingo
   */
  static getNextDateByWeekday(targetWeekday: number): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWeekday = today.getDay();
    let daysAhead = targetWeekday - currentWeekday;
    
    if (daysAhead <= 0) {
      daysAhead += 7;
    }
    
    today.setDate(today.getDate() + daysAhead);
    return today;
  }

  /**
   * Obtiene la fecha del próximo sábado
   */
  static getNextSaturday(): Date {
    return this.getNextDateByWeekday(5);
  }

  /**
   * Obtiene la fecha del próximo domingo
   */
  static getNextSunday(): Date {
    return this.getNextDateByWeekday(6);
  }

  /**
   * Formatea una fecha
   * @param formatType 'short' (d) o 'full' (dd/mm)
   */
  static formatDate(dateObj: Date, formatType: 'short' | 'full' = 'short'): string {
    if (formatType === 'short') {
      return dateObj.getDate().toString();
    }
    
    if (formatType === 'full') {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
    
    return dateObj.getDate().toString();
  }

  /**
   * Reemplaza los placeholders {saturday} y {sunday} en un texto
   */
  static replaceDatePlaceholders(
    text: string,
    saturday: Date | null,
    sunday: Date | null
  ): string {
    let result = text;
    
    if (saturday) {
      result = result.replace(/{saturday}/g, this.formatDate(saturday, 'short'));
    }
    
    if (sunday) {
      result = result.replace(/{sunday}/g, this.formatDate(sunday, 'short'));
    }
    
    return result;
  }

  /**
   * Detecta si hay placeholders de fecha en los datos
   */
  static detectDatePlaceholders(options: { label?: string }[]): DatePlaceholders {
    let hasSaturday = false;
    let hasSunday = false;

    for (const option of options) {
      const label = option.label || '';
      if (label.includes('{saturday}')) {
        hasSaturday = true;
      }
      if (label.includes('{sunday}')) {
        hasSunday = true;
      }
    }

    return {
      saturday: hasSaturday ? this.getNextSaturday() : null,
      sunday: hasSunday ? this.getNextSunday() : null
    };
  }
}

export default DateService;