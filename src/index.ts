/**
 * ZenitoraBot API
 * API REST para crear encuestas y mensajes en Discord
 * Desplegable en Render
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

// Importaciones propias
import routes from './routes/index.js';
import swaggerDocument from './config/swagger.js';
import { ConfigService } from './services/config.service.js';
import { Logger, type LogLevel } from './services/logger.service.js';
import { startDiscordClient, initializeDiscordClient } from './integrations/discord/discordClient.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar logger
const logLevel = process.env.LOG_LEVEL;
const validLogLevel: LogLevel | undefined = 
  (logLevel === 'DEBUG' || logLevel === 'INFO' || logLevel === 'WARN' || logLevel === 'ERROR') 
    ? logLevel as LogLevel 
    : undefined;

Logger.init({
  level: validLogLevel || 'INFO',
  logToFile: process.env.LOG_TO_FILE === 'true',
  logDir: process.env.LOG_DIR || './logs'
});

// Crear aplicación Express
const app = express();
app.use(express.json());

// ============================================
// CORS
// ============================================

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// MIDDLEWARES
// ============================================

// Middleware para logging de inicio de request
app.use((req: Request, res: Response, next: NextFunction) => {
  Logger.debug('HTTP', `${req.method} ${req.path} - Inicio`);
  next();
});

// ============================================
// SWAGGER
// ============================================

// Documentación Swagger en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint JSON de Swagger
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// ============================================
// RUTAS
// ============================================

app.use('/', routes);

// ============================================
// ERROR HANDLER
// ============================================

// Middleware de manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Logger.error('HTTP', `Error en ${req.method} ${req.path}`, err.message);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

const PORT = ConfigService.getPort();

// ============================================
// INICIO DEL SERVIDOR Y DISCORD BOT
// ============================================

async function startServer(): Promise<void> {
  // Iniciar cliente de Discord si está configurado
  if (process.env.DISCORD_BOT_TOKEN) {
    try {
      initializeDiscordClient();
      
      // Iniciar el bot de Discord (async, no bloquear start)
      startDiscordClient()
        .then(() => {
          Logger.info('SYSTEM', '✅ Discord bot iniciado');
        })
        .catch((err) => {
          Logger.error('SYSTEM', '❌ Error al iniciar Discord bot', err.message);
        });
    } catch (err) {
      Logger.error('SYSTEM', '❌ Error inicializando Discord client', String(err));
    }
  } else {
    Logger.warn('SYSTEM', '⚠️ DISCORD_BOT_TOKEN no configurado, bot deshabilitado');
  }

  // Iniciar servidor HTTP
  app.listen(PORT, () => {
    Logger.info('SYSTEM', `🎲 ZenitoraBot API iniciada en puerto ${PORT}`);
    Logger.info('SYSTEM', `
🎲 ZenitoraBot API iniciada
   Puerto: ${PORT}
   
📖 Documentación Swagger:
   - UI: http://localhost:${PORT}/api-docs
   - JSON: http://localhost:${PORT}/api-docs.json
   
📡 Endpoints disponibles:
   - GET  /wake-up         → Levantar servicio
   - GET  /channels        → Ver canales mapeados
   - POST /poll/adventure   → Crear poll de aventuras
   - POST /poll/party      → Crear poll de partidas
   - POST /poll            → Crear poll genérica
   - POST /message/advice  → Enviar aviso
   - POST /message        → Enviar mensaje directo
   - POST /commands       → Ejecutar comando
   - POST /integrations/discord/register-commands  → Registrar comandos
`);
  });
}

startServer();

export default app;