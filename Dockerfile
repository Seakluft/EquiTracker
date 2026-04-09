# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Définir DATABASE_URL pour le build (nécessaire pour le prerendering Next.js)
ENV DATABASE_URL="file:./dev.db"
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm install
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Créer une base de données vide pour permettre le build statique
RUN npx prisma db push

RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV PORT 8765

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 8765

# On utilise un script de démarrage pour s'assurer que la DB est à jour au runtime
CMD ["npm", "start", "--", "-p", "8765"]
