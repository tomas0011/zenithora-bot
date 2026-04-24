# Usar imagen base de Node.js
FROM node:20-alpine

# Definir directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY dist/ ./dist/
COPY .env.example ./

# Exponer puerto
EXPOSE 3000

# Variables de entorno requeridas
ENV NODE_ENV=production

# Comando para iniciar
CMD ["node", "dist/index.js"]