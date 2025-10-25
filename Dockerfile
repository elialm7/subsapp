# ============================
# Etapa 1: Build de la app
# ============================
FROM node:22-alpine AS builder

# Definir el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias primero (para aprovechar la cache)
COPY package*.json ./

# Instalar dependencias con la flag solicitada
RUN npm install --legacy-peer-deps

# Copiar el resto del código de la app
COPY . .

# Compilar la app Next.js
RUN npm run build

# ============================
# Etapa 2: Imagen final (producción)
# ============================
FROM node:18-alpine AS runner

# Definir directorio de trabajo
WORKDIR /app

# Establecer variable de entorno
ENV NODE_ENV=production

# Copiar los archivos necesarios desde el builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Exponer el puerto 7750
EXPOSE 7750

# Comando para iniciar la app
CMD ["npm", "start"]
