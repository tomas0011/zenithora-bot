/**
 * Servicio de Logger
 * Registra HTTP requests y comandos de Discord
 */

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CONFIGURACIÓN
// ============================================

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  type: 'HTTP' | 'COMMAND' | 'SYSTEM' | 'ADVICE';
  message: string;
  details?: unknown;
}

interface LoggerConfig {
  level: LogLevel;
  logToFile: boolean;
  logDir: string;
  color: boolean;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: 'INFO',
  logToFile: true,
  logDir: './logs',
  color: true
};

// ============================================
// COLORES PARA CONSOLA
// ============================================

const Colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

// ============================================
// SERVICIO DE LOGGER
// ============================================

export class Logger {
  private static config: LoggerConfig = { ...DEFAULT_CONFIG };
  private static initialized = false;

  /**
   * Inicializa el logger
   */
  static init(config?: Partial<LoggerConfig>): void {
    if (this.initialized) return;

    this.config = { ...DEFAULT_CONFIG, ...config };

    // Crear directorio de logs si no existe
    if (this.config.logToFile) {
      try {
        if (!existsSync(this.config.logDir)) {
          mkdirSync(this.config.logDir, { recursive: true });
        }
      } catch {
        // Ignorar errores de directorio
      }
    }

    this.initialized = true;
    this.log('INFO', 'SYSTEM', 'Logger inicializado');
  }

  /**
   * Convierte un objeto a string para logs
   */
  private static stringify(data: unknown): string {
    if (data === undefined) return '';
    if (data === null) return 'null';
    if (typeof data === 'string') return data;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);
    
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  /**
   * Formatea una entrada de log
   */
  private static formatEntry(entry: LogEntry): string {
    const parts = [
      entry.timestamp,
      `[${entry.level}]`,
      `[${entry.type}]`,
      entry.message
    ];

    if (entry.details) {
      parts.push('\n' + this.stringify(entry.details));
    }

    return parts.join(' ');
  }

  /**
   * Obtiene el color para el nivel
   */
  private static getColor(level: LogLevel): string {
    if (!this.config.color) return '';

    switch (level) {
      case 'ERROR': return Colors.red;
      case 'WARN': return Colors.yellow;
      case 'DEBUG': return Colors.gray;
      case 'INFO': return Colors.green;
    }
  }

  /**
   * Debe loguear según el nivel configurado
   */
  private static shouldLog(level: LogLevel): boolean {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const configuredIndex = levels.indexOf(this.config.level);
    const entryIndex = levels.indexOf(level);
    return entryIndex >= configuredIndex;
  }

  /**
   * Registra una entrada
   */
  private static log(level: LogLevel, type: LogEntry['type'], message: string, details?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      type,
      message,
      details
    };

    // Loguear a consola
    const line = this.formatEntry(entry);
    const color = this.getColor(level);
    console.log(color + line + Colors.reset);

    // Loguear a archivo
    if (this.config.logToFile) {
      try {
        const date = new Date().toISOString().split('T')[0];
        const logFile = `${this.config.logDir}/zenitora-${date}.log`;
        appendFileSync(logFile, line + '\n');
      } catch {
        // Ignorar errores de escritura
      }
    }
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================

  static debug(type: LogEntry['type'], message: string, details?: unknown): void {
    this.log('DEBUG', type, message, details);
  }

  static info(type: LogEntry['type'], message: string, details?: unknown): void {
    this.log('INFO', type, message, details);
  }

  static warn(type: LogEntry['type'], message: string, details?: unknown): void {
    this.log('WARN', type, message, details);
  }

  static error(type: LogEntry['type'], message: string, details?: unknown): void {
    this.log('ERROR', type, message, details);
  }

  // ============================================
  // LOGGERS ESPECÍFICOS
  // ============================================

  /**
   * Loguea una petición HTTP
   */
  static http(method: string, path: string, status: number, duration: number, details?: unknown): void {
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    const message = `${method} ${path} → ${status} (${duration}ms)`;
    this.log(level, 'HTTP', message, details);
  }

  /**
   * Loguea un comando de Discord
   */
  static command(command: string, channelId: string, userId?: string, success?: boolean, details?: Record<string, unknown>): void {
    const level = success === false ? 'ERROR' : 'INFO';
    const message = `DISCORD: /${command} in ${channelId}${success === false ? ' [FALLO]' : ''}`;
    this.log(level, 'COMMAND', message, { userId, success, ...(details as Record<string, unknown>) });
  }
}

export default Logger;