# ZenitoraBot API

API REST para crear encuestas y mensajes en Discord. Desplegable en [Render](https://render.com/).

## 🏗️ Arquitectura

```
src/
├── config/
│   └── swagger.ts          # Configuración de Swagger
├── controllers/
│   ├── wake-up.controller.ts
│   ├── channels.controller.ts
│   ├── adventure-poll.controller.ts
│   ├── party-poll.controller.ts
│   ├── poll.controller.ts
│   ├── advice.controller.ts
│   ├── message.controller.ts
│   └── commands.controller.ts
├── models/
│   └── types.ts           # Tipos e interfaces TypeScript
├── routes/
│   └── index.ts          # Rutas de la API
├── services/
│   ├── discord.service.ts # Servicio de Discord API
│   ├── config.service.ts # Configuración
│   ├── date.service.ts   # Utilidades de fecha
│   ├── poll.service.ts   # Lógica de polls
│   └── message.service.ts# Lógica de mensajes
├── utils/
│   └── message-link.ts   # Utilidades
└── index.ts              # Punto de entrada
```

## 🚀 Endpoints

### Wake Up
```
GET /wake-up
```
Levanta el servicio (necesario para Render con free tier que entra en sleep).

### Canales
```
GET /channels
```
Obtiene los canales mapeados:
- `general`: 1476347136525467811
- `votaciones`: 1476347664231829534

---

## 📊 Encuestas

### Poll de Aventuras
```
POST /poll/adventure
```
Crea una poll para votar aventuras.

**Body:**
```json
{
  "question": "¿Qué aventura jugamos?",
  "options": [
    { "label": "Mareas Impías", "emoji": "🌊" },
    { "label": "Patrón de Ausencias", "emoji": "🌀" }
  ],
  "duration": 72,
  "allow_multiple": true,
  "channel_id": "1476347664231829534"
}
```

### Poll de Partidas
```
POST /poll/party
```
Crea una poll para votar horarios de partidas. Soporta `{saturday}` y `{sunday}` como placeholders.

**Body:**
```json
{
  "question": "¿Cuándo jugamos?",
  "options": [
    { "label": "Sábado {saturday} Tarde (15hs a 19hs)", "emoji": "1️⃣" },
    { "label": "Domingo {sunday} Noche (19hs a 23hs)", "emoji": "4️⃣" }
  ],
  "duration": 72,
  "allow_multiple": true
}
```

### Poll Genérica
```
POST /poll
```
Crea cualquier tipo de poll de Discord.

**Body:**
```json
{
  "question": "¿...?",
  "options": [
    { "label": "Opción 1", "emoji": "1️⃣" },
    { "label": "Opción 2", "emoji": "2️⃣" }
  ],
  "channel_id": "..."
}
```

---

## 💬 Mensajes

### Aviso (Anuncio)
```
POST /message/advice
```
Envía un mensaje de aviso mentioneando `@everyone`. Por defecto usa el canal `general`.

**Body:**
```json
{
  "content": "Ya están disponibles las votaciones",
  "channel_id": "1476347136525467811"
}
```

### Mensaje Directo
```
POST /message
```
Envía un mensaje directo a cualquier canal.

**Body:**
```json
{
  "content": "Hola a todos!",
  "channel_id": "1476347664231829534"
}
```

---

## ⌨️ Comandos

```
POST /commands
```
Procesa comandos tipo `/` de Discord.

**Body:**
```json
{
  "command": "aventure|partida|poll|aviso",
  "params": {
    "question": "...",
    "options": [...],
    "channel_id": "...",
    "content": "..."
  }
}
```

---

## ��� Documentación Swagger

Accede a la documentación interactiva en:
```
https://tu-api.onrender.com/api-docs
```

---

## ⚙️ Configuración

Crea un archivo `.env` basado en `.env.example`:

```env
# Discord Bot - obtener en Discord Developer Portal → Your App → Bot
DISCORD_BOT_TOKEN=tu_token_del_bot
DISCORD_CLIENT_ID=tu_client_id
GENERAL_CHANNEL=1476347136525467811
VOTACIONES_CHANNEL=1476347664231829534
PORT=3000
```

**Importante:** En Discord Developer Portal debes habilitar los Gateway Privileged Intents:
- Ve a tu aplicación en https://discord.com/developers/applications
- Bot → Privileged Intents → habilita "Message Content Intent"

---

## 🖥️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Iniciar servidor
npm start

# Desarrollo con watch
npm run dev:watch
```

---

## 🎮 Integración con Discord

### Comandos Slash

La API soporta comandos slash de Discord.

#### Registrar Comandos

```bash
curl -X POST https://tu-api.onrender.com/integrations/discord/register-commands
```

Esto registra el comando `/zb advice` globalmente.

#### Usar el Comando

Una vez registrado, usa `/zb advice` en Discord para recibir un consejo aleatorio.

---

## 🐳 Docker

### Construir imagen
```bash
docker build -t zenitorabot .
```

### Correr con docker-compose
```bash
# Copiar archivo de entorno
cp .env.docker .env

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Variables requeridas
```env
DISCORD_BOT_TOKEN=tu_token
DISCORD_CLIENT_ID=tu_client_id
```

---

## ☁️ Despliegue en Render

1. Conecta tu repositorio a Render
2. Configura las variables de entorno en el dashboard de Render
3. Render automáticamente detectará el `Procfile`

**Nota:** En Render, asegúrate de setear el Build Command a `npm run build`