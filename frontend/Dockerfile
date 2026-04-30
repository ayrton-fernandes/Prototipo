# =========================
#  BASE IMAGE
# =========================
FROM dhi.io/node:24.14.1-alpine3.23-dev AS base
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
ARG PORT
ARG HOSTNAME
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

ARG NODE_ENV
WORKDIR /app

# Copia apenas o necessário
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

USER node

EXPOSE 3001

CMD ["node_modules/.bin/next", "start"]
