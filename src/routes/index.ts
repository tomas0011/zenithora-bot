/**
 * Rutas de la API
 * Configura todas las rutas del servidor
 */

import { Router, type Request, type Response } from 'express';
import { WakeUpController } from '../controllers/wake-up.controller.js';
import { ChannelsController } from '../controllers/channels.controller.js';
import { AdventurePollController } from '../controllers/adventure-poll.controller.js';
import { PartyPollController } from '../controllers/party-poll.controller.js';
import { PollController } from '../controllers/poll.controller.js';
import { AdviceController } from '../controllers/advice.controller.js';
import { MessageController } from '../controllers/message.controller.js';
import { CommandsController } from '../controllers/commands.controller.js';
import { Logger } from '../services/logger.service.js';
import { registerCommands } from '../integrations/discord/registerCommands.controller.js';
import { consumeAdvice } from '../integrations/discord/discordConsumer.controller.js';

const router = Router();

// ============================================
// RUTAS BASE
// ============================================

// GET /wake-up - Levantar servicio
router.get('/wake-up', (req, res) => {
  Logger.info('HTTP', `GET ${req.path}`);
  WakeUpController.index(req, res);
});

// GET /channels - Obtener canales mapeados
router.get('/channels', (req, res) => {
  Logger.info('HTTP', `GET ${req.path}`);
  ChannelsController.getAll(req, res);
});

// ============================================
// RUTAS DE POLLS
// ============================================

// POST /poll/adventure - Poll de aventuras
router.post('/poll/adventure', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  AdventurePollController.create(req, res);
});

// POST /poll/party - Poll de partidas
router.post('/poll/party', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  PartyPollController.create(req, res);
});

// POST /poll - Poll genérica
router.post('/poll', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  PollController.create(req, res);
});

// ============================================
// RUTAS DE MENSAJES
// ============================================

// POST /message/advice - Aviso
router.post('/message/advice', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  AdviceController.send(req, res);
});

// POST /message - Mensaje directo
router.post('/message', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  MessageController.send(req, res);
});

// ============================================
// RUTAS DE COMANDOS
// ============================================

// POST /commands - Ejecutar comando
router.post('/commands', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  CommandsController.execute(req, res);
});

// ============================================
// HEALTH CHECK
// ============================================

// GET /health - Health check
router.get('/health', (req, res) => {
  Logger.info('HTTP', `GET ${req.path}`);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// RUTAS DE INTEGRACIÓN DISCORD
// ============================================

// POST /integrations/discord/register-commands -Registrar comandos de Discord
router.post('/integrations/discord/register-commands', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  registerCommands(req, res);
});

// POST /integrations/discord/consume/advice - Consumidor interno de advice
router.post('/integrations/discord/consume/advice', (req, res) => {
  Logger.info('HTTP', `POST ${req.path}`);
  consumeAdvice(req, res);
});

export default router;