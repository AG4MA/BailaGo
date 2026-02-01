# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci

# Copia sorgenti
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Crea utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copia solo i file necessari
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Installa solo dipendenze di produzione
RUN npm ci --only=production && \
    npm cache clean --force

# Usa utente non-root
USER nodejs

# Espone porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Avvia l'applicazione
CMD ["node", "dist/index.js"]
