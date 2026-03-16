FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* must be baked at build time)
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ARG NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8000
ARG NEXT_PUBLIC_ARENA_TOKEN_ADDRESS
ARG NEXT_PUBLIC_AGENT_NFT_ADDRESS
ARG NEXT_PUBLIC_SKILL_NFT_ADDRESS
ARG NEXT_PUBLIC_ZK_BETTING_POOL_ADDRESS
ARG NEXT_PUBLIC_RESULT_ORACLE_ADDRESS
ARG NEXT_PUBLIC_WC_PROJECT_ID

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_WS_URL=$NEXT_PUBLIC_BACKEND_WS_URL
ENV NEXT_PUBLIC_ARENA_TOKEN_ADDRESS=$NEXT_PUBLIC_ARENA_TOKEN_ADDRESS
ENV NEXT_PUBLIC_AGENT_NFT_ADDRESS=$NEXT_PUBLIC_AGENT_NFT_ADDRESS
ENV NEXT_PUBLIC_SKILL_NFT_ADDRESS=$NEXT_PUBLIC_SKILL_NFT_ADDRESS
ENV NEXT_PUBLIC_ZK_BETTING_POOL_ADDRESS=$NEXT_PUBLIC_ZK_BETTING_POOL_ADDRESS
ENV NEXT_PUBLIC_RESULT_ORACLE_ADDRESS=$NEXT_PUBLIC_RESULT_ORACLE_ADDRESS
ENV NEXT_PUBLIC_WC_PROJECT_ID=$NEXT_PUBLIC_WC_PROJECT_ID

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
