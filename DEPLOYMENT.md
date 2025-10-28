# Deployment Guide

This guide explains how to deploy and run the monorepo applications using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 24.2.0 or higher
- pnpm 10.11.0 or higher

## Available Scripts

The following npm scripts are available in the root `package.json`:

### Development Mode

Run the application in development mode with hot-reloading:

```bash
pnpm start:dev
```

This will:
- Start PostgreSQL database
- Build and start backend on port 3000
- Build and start frontend on port 5173
- Mount source code as volumes for hot-reloading

**URLs:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Database: postgresql://postgres:postgres@localhost:5432/postgres

### Production Mode

Run the application in production mode with optimized builds:

```bash
pnpm start:prod
```

This will:
- Start PostgreSQL database
- Build optimized production Docker images
- Start backend on port 3000
- Start frontend (via nginx) on port 8080

**URLs:**
- Backend: http://localhost:3000
- Frontend: http://localhost:8080
- Database: postgresql://postgres:postgres@localhost:5432/postgres

### Stop All Services

Stop both development and production environments:

```bash
pnpm stop
```

### View Logs

View logs from running services:

```bash
pnpm logs
```

## Docker Compose Files

### `compose.yml` (Development)

Used for local development with:
- Volume mounts for hot-reloading
- Development dependencies included
- Debug logging enabled
- Frontend on port 5173 (Vite dev server)

### `compose.prod.yml` (Production)

Used for production deployments with:
- Multi-stage builds for optimized images
- No volume mounts (uses built artifacts)
- Production dependencies only
- Frontend served via nginx on port 80 (exposed as 8080)
- Optimized logging

## Production Dockerfiles

### Backend (`apps/backend/Dockerfile`)

Multi-stage build:
1. **Builder stage**: Installs dependencies and compiles TypeScript to JavaScript
2. **Production stage**: Copies only compiled code and production dependencies

### Frontend (`apps/frontend/Dockerfile`)

Multi-stage build:
1. **Builder stage**: Installs dependencies and builds Vite application
2. **Production stage**: Serves static files via nginx with SPA routing support

## Manual Docker Commands

If you prefer to run Docker Compose commands directly:

### Development

```bash
# Start development environment
docker compose -f compose.yml up -d --build

# View logs
docker compose -f compose.yml logs -f

# Stop
docker compose -f compose.yml down
```

### Production

```bash
# Start production environment
docker compose -f compose.prod.yml up -d --build

# View logs
docker compose -f compose.prod.yml logs -f

# Stop
docker compose -f compose.prod.yml down
```

## Health Checks

All services include health checks:

- **Backend**: HTTP check on `/health` endpoint
- **Frontend**: HTTP check on root path
- **PostgreSQL**: `pg_isready` check

View service health status:

```bash
docker compose ps
# or for production:
docker compose -f compose.prod.yml ps
```

## Environment Variables

Environment variables can be configured in the respective compose files:

- `NODE_ENV`: Set to `development` or `production`
- `DATABASE_URL`: PostgreSQL connection string
- `LOG_LEVEL`: Logging verbosity (`debug`, `info`, `warn`, `error`)
- `CORS_ORIGIN`: Allowed CORS origins for the backend

## Troubleshooting

### Ports Already in Use

If you get port conflict errors, either stop the conflicting service or modify the port mappings in the compose files.

### Database Connection Issues

Ensure PostgreSQL is running and healthy:

```bash
docker compose ps postgres
```

### Build Failures

Clean up Docker cache and rebuild:

```bash
docker compose down -v
docker system prune -a
pnpm start:dev  # or start:prod
```

### View Container Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## Production Deployment Best Practices

1. **Use environment-specific secrets**: Don't use default credentials in production
2. **Configure proper CORS origins**: Update `CORS_ORIGIN` to match your frontend domain
3. **Set up SSL/TLS**: Use a reverse proxy (nginx, Traefik) with SSL certificates
4. **Monitor resources**: Set memory and CPU limits in compose files
5. **Regular backups**: Set up PostgreSQL backup strategy
6. **Log aggregation**: Configure centralized logging for production

## Database Migrations

When database migrations are set up, uncomment the migration commands in:
- `scripts/start.sh` (development)
- `scripts/deploy.sh` (production)

Example:
```bash
echo "🔄 Migrating database..."
pnpm run -C packages/database drizzle-kit migrate

echo "🔄 Seeding database..."
pnpm run -C packages/database seed
```

