# =========================
#  BASE IMAGE
# =========================
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# =========================
#  DEPENDÊNCIAS (build)
# =========================
FROM base AS deps
COPY package*.json ./
# npm ci garante build reprodutível e ignora scripts pós-install
RUN npm ci --ignore-scripts

# =========================
#  BUILD
# =========================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# =========================
#  DEPENDÊNCIAS (prod)
# =========================
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# =========================
#  RUNNER FINAL
# =========================
FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copia apenas o necessário
COPY --from=builder /app/public ./public 
COPY --from=builder /app/.next ./.next
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "start"]