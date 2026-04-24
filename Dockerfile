# Usar imagen base de Node.js
FROM node:20-alpine

# Definir directorio de trabajo
WORKDIR /app

# Copiar package.json primero
COPY package.json ./

# Instalar todas las dependencias (incluye dev para TypeScript)
RUN npm ci

# Copiar código fuente
COPY src/ ./src/
COPY tsconfig.json ./

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno requeridas
ENV NODE_ENV=production

# Comando para iniciar
CMD ["node", "dist/index.js"]