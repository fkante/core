FROM node:24.2.0-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Create app directory
WORKDIR /home/node

# Set user
USER node

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node packages/core/package.json ./packages/core/
COPY --chown=node:node apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --chown=node:node packages/ ./packages/
COPY --chown=node:node apps/backend/ ./apps/backend/
COPY --chown=node:node tsconfig.base.json ./

# Build core package first
RUN pnpm run -C packages/core build

# Build backend
RUN pnpm run -C apps/backend build

# Production stage
FROM node:24.2.0-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Create app directory
WORKDIR /home/node

# Set user
USER node

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node packages/core/package.json ./packages/core/
COPY --chown=node:node apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --chown=node:node --from=builder /home/node/apps/backend/dist ./apps/backend/dist
COPY --chown=node:node --from=builder /home/node/packages/core/dist ./packages/core/dist

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/backend/dist/index.js"]

