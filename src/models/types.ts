/**
 * Tipos para la API de ZenitoraBot
 */

// ============================================
// ENUMS
// ============================================

export enum ChannelName {
  GENERAL = 'general',
  VOTACIONES = 'votaciones'
}

// ============================================
// INTERFACES BÁSICAS
// ============================================

export interface EnvConfig {
  DISCORD_BOT_TOKEN: string;
  GENERAL_CHANNEL: string;
  VOTACIONES_CHANNEL: string;
  PORT: number;
}

export interface ChannelMap {
  [key: string]: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PollMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
}

// ============================================
// INTERFACES DE POLLS
// ============================================

export interface PollOption {
  label: string;
  emoji?: string;
}

export interface PollAnswer {
  poll_media: PollMedia;
}

export interface PollMedia {
  text: string;
  emoji?: DiscordEmoji;
}

export interface DiscordEmoji {
  id?: string;
  name: string;
  animated?: boolean;
}

export interface PollQuestion {
  text: string;
}

export interface PollData {
  question: string;
  options?: PollOption[];
  aventuras?: PollOption[];
  channel_id?: string;
  channelId?: string;
  duration?: number;
  allow_multiple_answers?: boolean;
  allow_multiple?: boolean;
}

export interface DiscordPoll {
  question: PollQuestion;
  answers: PollAnswer[];
  duration: number;
  allow_multiselect: boolean;
  layout_type: number;
}

// ============================================
// INTERFACES DE MENSAJES
// ============================================

export interface MessageRequest {
  content: string;
  channel_id?: string;
  channelId?: string;
}

export interface AdviceRequest {
  content: string;
  channel_id?: string;
}

// ============================================
// INTERFACES DE COMANDOS
// ============================================

export interface CommandRequest {
  command: string;
  params: CommandParams;
}

export interface CommandParams {
  question?: string;
  options?: PollOption[];
  opciones?: PollOption[];
  channel_id?: string;
  channelId?: string;
  duration?: number;
  allow_multiple?: boolean;
  content?: string;
}

// ============================================
// INTERFACES DE FECHAS
// ============================================

export interface DatePlaceholders {
  saturday: Date | null;
  sunday: Date | null;
}

// SWAGGER
// ============================================

export interface SwaggerConfig {
  title: string;
  version: string;
  description: string;
}