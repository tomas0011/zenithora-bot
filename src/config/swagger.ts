/**
 * Configuración de Swagger para la API
 */

import type { SwaggerConfig } from '../models/types.js';

export const swaggerConfig: SwaggerConfig = {
  title: 'ZenitoraBot API',
  version: '1.0.0',
  description: `
API REST para crear encuestas y mensajes en Discord.
Desplegable en Render con wake-up endpoint para evitar sleep.

## Canales Mapeados
- **general**: 1476347136525467811
- **votaciones**: 1476347664231829534

## Discord Slash Commands
- POST /integrations/discord/register-commands → Registrar /zb advice
- POST /integrations/discord/consume/advice → Consumidor interno

## Autenticación
No requiere autenticación. Configura DISCORD_BOT_TOKEN en las variables de entorno.
  `.trim()
};

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: swaggerConfig.title,
    version: swaggerConfig.version,
    description: swaggerConfig.description
  },
  servers: [
    {
      url: 'https://tu-api.onrender.com',
      description: 'Servidor de producción (cambia la URL)'
    },
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo'
    }
  ],
  paths: {
    '/wake-up': {
      get: {
        summary: 'Levantar el servicio',
        description: 'Endpoint para levantar el servicio en Render (evita que entre en sleep)',
        operationId: 'wakeUp',
        responses: {
          '200': {
            description: 'Servicio despierto',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Service is now awake',
                  data: {
                    timestamp: '2024-01-01T00:00:00.000Z'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/channels': {
      get: {
        summary: 'Obtener canales mapeados',
        description: 'Retorna la lista de canales mapeados en la configuración',
        operationId: 'getChannels',
        responses: {
          '200': {
            description: 'Canales obtenidos',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Canales mapeados disponibles',
                  data: {
                    general: '1476347136525467811',
                    votaciones: '1476347664231829534'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/poll/adventure': {
      post: {
        summary: 'Crear poll de aventuras',
        description: 'Crea una encuesta para votar qué aventura jugar',
        operationId: 'createAdventurePoll',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  question: {
                    type: 'string',
                    description: 'Pregunta de la poll',
                    example: '🎲 ¿Qué aventura jugamos?'
                  },
                  options: {
                    type: 'array',
                    description: 'Opciones de la aventura',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string', example: 'Mareas Impías' },
                        emoji: { type: 'string', example: '🌊' }
                      }
                    },
                    example: [
                      { label: 'Mareas Impías', emoji: '🌊' },
                      { label: 'Patrón de Ausencias', emoji: '🌀' }
                    ]
                  },
                  channel_id: {
                    type: 'string',
                    description: 'ID del canal (usa votaciones por defecto)',
                    example: '1476347664231829534'
                  },
                  duration: {
                    type: 'number',
                    description: 'Duración en horas',
                    example: 72
                  },
                  allow_multiple: {
                    type: 'boolean',
                    description: 'Permitir múltiples votos',
                    example: true
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Poll creada',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Poll de aventura creada',
                  data: {
                    poll_message: 'https://discord.com/channels/...',
                    channel_id: '1476347664231829534'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'Error creando poll'
                }
              }
            }
          }
        }
      }
    },
    '/poll/party': {
      post: {
        summary: 'Crear poll de partidas',
        description: 'Crea una encuesta para votar horarios de partidas. Soporta {saturday} y {sunday}',
        operationId: 'createPartyPoll',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  question: {
                    type: 'string',
                    description: 'Pregunta de la poll',
                    example: '🗓️ ¿Cuándo jugamos?'
                  },
                  options: {
                    type: 'array',
                    description: 'Opciones con placeholders de fecha',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string', example: 'Sábado {saturday} Tarde (15hs a 19hs)' },
                        emoji: { type: 'string', example: '1️⃣' }
                      }
                    },
                    example: [
                      { label: 'Sábado {saturday} Tarde (15hs a 19hs)', emoji: '1️⃣' },
                      { label: 'Domingo {sunday} Noche (19hs a 23hs)', emoji: '4️⃣' }
                    ]
                  },
                  channel_id: {
                    type: 'string',
                    description: 'ID del canal',
                    example: '1476347664231829534'
                  },
                  duration: {
                    type: 'number',
                    description: 'Duración en horas',
                    example: 72
                  },
                  allow_multiple: {
                    type: 'boolean',
                    example: true
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Poll creada',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Poll de partidas creada',
                  data: {
                    poll_message: 'https://discord.com/channels/...',
                    channel_id: '1476347664231829534'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/poll': {
      post: {
        summary: 'Crear poll genérica',
        description: 'Crea cualquier tipo de poll de Discord',
        operationId: 'createPoll',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['channel_id', 'options'],
                properties: {
                  question: {
                    type: 'string',
                    example: '¿Qué prefieres?'
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        emoji: { type: 'string' }
                      }
                    }
                  },
                  channel_id: {
                    type: 'string',
                    example: '1476347664231829534'
                  },
                  duration: {
                    type: 'number',
                    example: 24
                  },
                  allow_multiple: {
                    type: 'boolean',
                    example: false
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Poll creada'
          },
          '400': {
            description: 'Error de validación'
          }
        }
      }
    },
    '/message/advice': {
      post: {
        summary: 'Enviar aviso',
        description: 'Envía un mensaje de aviso mentioneando @everyone. Por defecto usa el canal general',
        operationId: 'sendAdvice',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                    description: 'Contenido del mensaje',
                    example: '¡Ya están disponibles las votaciones!'
                  },
                  channel_id: {
                    type: 'string',
                    description: 'ID del canal (opcional, usa general por defecto)',
                    example: '1476347136525467811'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Aviso enviado'
          }
        }
      }
    },
    '/message': {
      post: {
        summary: 'Enviar mensaje directo',
        description: 'Envía un mensaje a un canal específico',
        operationId: 'sendMessage',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content', 'channel_id'],
                properties: {
                  content: {
                    type: 'string',
                    example: 'Hola a todos!'
                  },
                  channel_id: {
                    type: 'string',
                    example: '1476347664231829534'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Mensaje enviado'
          },
          '400': {
            description: 'Error de validación'
          }
        }
      }
    },
    '/commands': {
      post: {
        summary: 'Ejecutar comando',
        description: 'Procesa comandos tipo / de Discord',
        operationId: 'executeCommand',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['command'],
                properties: {
                  command: {
                    type: 'string',
                    enum: ['aventure', 'partida', 'poll', 'aviso', 'mensaje'],
                    description: 'Comando a ejecutar',
                    example: 'aventure'
                  },
                  params: {
                    type: 'object',
                    description: 'Parámetros del comando',
                    example: {
                      question: '¿Qué aventura jugamos?',
                      options: [
                        { label: 'Mareas Impías', emoji: '🌊' }
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Comando ejecutado'
          },
          '400': {
            description: 'Comando desconocido'
          }
        }
      }
    },
    '/integrations/discord/register-commands': {
      post: {
        summary: 'Registrar comandos de Discord',
        description: 'Registra los comandos slash (/zb advice) en Discord. Use este endpoint una vez para habilitar el comando.',
        operationId: 'registerDiscordCommands',
        responses: {
          '201': {
            description: 'Comandos registradas',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Comandos registrados exitosamente',
                  data: {
                    commands: [
                      { id: '123456789', name: 'zb', description: 'Comandos principales de Zenitora' }
                    ]
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'DISCORD_BOT_TOKEN no configurado'
                }
              }
            }
          }
        }
      }
    },
    '/integrations/discord/consume/advice': {
      post: {
        summary: 'Consumir comando advice',
        description: 'Endpoint interno para procesar /zb advice. El bot lo llama cuando el usuario usa el comando.',
        operationId: 'consumeAdvice',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: {
                    type: 'string',
                    description: 'ID del usuario de Discord',
                    example: '123456789'
                  },
                  username: {
                    type: 'string',
                    description: 'Nombre de usuario',
                    example: 'Usuario123'
                  },
                  channelId: {
                    type: 'string',
                    description: 'ID del canal donde se ejecutó el comando',
                    example: '1476347136525467811'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Advice procesado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    message: '¡Hey Usuario123! 🎭 Remember: el éxito es ir de fracaso en fracaso sin perder el entusiasmo!'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Error',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'Error generando advice',
                  data: {
                    message: '⚠️ No pude generar un consejo. Pero remember: ¡tú puedes!'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
          error: { type: 'string' }
        }
      }
    }
  }
};

export default swaggerDocument;