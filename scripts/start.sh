#!/usr/bin/env bash

set -e

echo "🔄 Starting Development Environment..."
echo ""

echo "🔄 Pulling Docker images..."
docker compose -f compose.yml pull

echo ""
echo "🔄 Starting PostgreSQL..."
docker compose -f compose.yml up -d --wait postgres

# Uncomment when database migrations are set up
# echo ""
# echo "🔄 Migrating database..."
# pnpm run -C packages/database drizzle-kit migrate
#
# echo "🔄 Seeding database..."
# pnpm run -C packages/database seed

echo ""
echo "🔄 Building and starting services..."
docker compose -f compose.yml up -d --build backend frontend

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Development URLs:"
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "📊 Useful commands:"
echo "  View logs:    docker compose -f compose.yml logs -f"
echo "  Stop:         pnpm stop"
echo "  Restart:      docker compose -f compose.yml restart"
echo "  Status:       docker compose -f compose.yml ps"
echo ""
