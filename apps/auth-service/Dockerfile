# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage
FROM base AS dependencies
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all package.json files for dependency installation
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/auth-service/node_modules ./apps/auth-service/node_modules
COPY --from=dependencies /app/packages ./packages

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy application source
COPY apps/auth-service ./apps/auth-service

# Expose port
EXPOSE 3002

# Start development server
CMD ["pnpm", "--filter", "auth-service", "start:dev"]

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/auth-service/node_modules ./apps/auth-service/node_modules
COPY --from=dependencies /app/packages ./packages

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy application source
COPY apps/auth-service ./apps/auth-service

# Build application
RUN pnpm --filter auth-service build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/auth-service/package.json ./apps/auth-service/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist

# Expose port
EXPOSE 3002

# Start production server
CMD ["node", "apps/auth-service/dist/main"]
