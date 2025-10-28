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
COPY --chown=node:node apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --chown=node:node packages/ ./packages/
COPY --chown=node:node apps/frontend/ ./apps/frontend/
COPY --chown=node:node tsconfig.base.json ./

# Build core package first
RUN pnpm run -C packages/core build

# Build frontend
RUN pnpm run -C apps/frontend build

# Production stage with nginx
FROM nginx:1.27-alpine

# Copy nginx configuration
COPY --from=builder /home/node/apps/frontend/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

