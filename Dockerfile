# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/client/package.json ./apps/client/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store && \
  pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter @halaqa/shared build
RUN pnpm --filter @halaqa/client build
RUN pnpm --filter @halaqa/backend exec prisma generate
RUN pnpm --filter @halaqa/backend build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/client/package.json ./apps/client/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store && \
  pnpm install --frozen-lockfile --prod --filter @halaqa/backend...

FROM node:20-alpine AS runner
ARG APP_VERSION=dev
ARG APP_COMMIT_SHA=unknown
ARG APP_BUILD_DATE=unknown
LABEL org.opencontainers.image.version=$APP_VERSION \
  org.opencontainers.image.revision=$APP_COMMIT_SHA \
  org.opencontainers.image.created=$APP_BUILD_DATE
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=5000
ENV LOGS_DIR=/app/logs

WORKDIR /app

COPY --from=prod-deps /app ./
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts
COPY --from=builder /app/apps/client/build ./apps/client/build
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

RUN mkdir -p /app/logs && chown -R node:node /app

WORKDIR /app/apps/backend
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/observability/health" >/dev/null || exit 1

USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/seed/bootstrap-admin.js && node dist/src/main.js"]
