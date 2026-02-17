# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package
RUN pnpm --filter @jambaar/shared build

# Generate Prisma client
RUN pnpm --filter api exec prisma generate

# Build API
RUN pnpm --filter api build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV API_PORT=3001

EXPOSE 3001

CMD ["node", "dist/main.js"]
