#!/usr/bin/env bash

set -e

echo "🚀 Starting Production Deployment..."
echo ""

echo "🔄 Pulling Docker images..."
docker compose -f compose.prod.yml pull postgres

echo ""
echo "🔄 Starting PostgreSQL..."
docker compose -f compose.prod.yml up -d --wait postgres

echo ""
echo "🔄 Migrating and seeding database..."
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app pnpm --filter backend db:migrate
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app pnpm --filter backend db:seed

echo ""
echo "🔨 Building and starting services..."
docker compose -f compose.prod.yml up -d --build --wait backend frontend

echo ""
echo "✅ All services deployed successfully!"
echo ""
echo "🌐 Production URLs:"
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:8080"
echo ""
echo "📊 Useful commands:"
echo "  View logs:    docker compose -f compose.prod.yml logs -f"
echo "  Stop:         pnpm stop"
echo "  Restart:      docker compose -f compose.prod.yml restart"
echo "  Status:       docker compose -f compose.prod.yml ps"
echo ""

