FROM node:26-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

WORKDIR /home/node
USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node packages/core/package.json ./packages/core/
COPY --chown=node:node apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY --chown=node:node packages/ ./packages/
COPY --chown=node:node apps/frontend/ ./apps/frontend/
COPY --chown=node:node tsconfig.base.json ./

# VITE_* values are baked into the client bundle at build time.
ARG VITE_API_BASE_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN pnpm run -C packages/core build
RUN pnpm run -C apps/frontend build

# Production stage: run the TanStack Start (nitro) SSR server.
FROM node:26-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /home/node/apps/frontend/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
