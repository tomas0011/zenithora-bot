# Usar imagen base de Node.js
FROM node:20-alpine

# Definir directorio de trabajo
WORKDIR /app

# Copiar package.json y tsconfig.json (necesarios para build)
COPY package.json package-lock.json tsconfig.json ./

# Instalar todas las dependencias (incluye dev para TypeScript)
RUN npm ci

# Copiar TODO el código fuente de una vez
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno requeridas
ENV NODE_ENV=production

# Comando para iniciar
CMD ["node", "dist/index.js"]